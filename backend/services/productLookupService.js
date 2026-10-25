
const Product = require('../models/Product');

const {
  getProductByBarcode: getOpenFoodFactsProduct,
} = require('./openFoodFactsService');

const {
  detectFoodComponents,
} = require('../utils/foodComponentDetector');

const gramsToMg = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number * 1000 : null;
};

const parseServingSize = (servingSize) => {
  if (!servingSize) {
    return { size: null, unit: null };
  }

  const match = String(servingSize)
    .trim()
    .toLowerCase()
    .match(/(\d+(?:\.\d+)?)\s*(g|ml)\b/);

  return match
    ? { size: Number(match[1]), unit: match[2] }
    : { size: null, unit: null };
};

const normalizeIngredient = (ingredient) =>
  String(ingredient)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const extractIngredients = (ingredients) => {
  if (!Array.isArray(ingredients)) return [];

  const result = [];

  const walk = (items) => {
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;

      if (item.text) {
        const normalized = normalizeIngredient(item.text);
        if (normalized) result.push(normalized);
      }

      if (Array.isArray(item.ingredients)) {
        walk(item.ingredients);
      }
    }
  };

  walk(ingredients);
  return [...new Set(result)];
};

const normalizeOpenFoodFactsProduct = (barcode, externalProduct) => {
  const nutriments = externalProduct.nutriments || {};
  const ingredients = extractIngredients(externalProduct.ingredients);

  return {
    barcode,

    productName:
      externalProduct.product_name ||
      externalProduct.product_name_en ||
      'Unknown Product',

    brand: externalProduct.brands || '',
    category: externalProduct.categories || '',

    serving: {
      ...parseServingSize(externalProduct.serving_size),
      servingsPerPackage: null,
    },

    nutrition: {
      calories: nutriments['energy-kcal_100g'] ?? null,
      protein: nutriments.proteins_100g ?? null,
      carbohydrates: nutriments.carbohydrates_100g ?? null,
      totalFat: nutriments.fat_100g ?? null,
      saturatedFat: nutriments['saturated-fat_100g'] ?? null,
      transFat: nutriments['trans-fat_100g'] ?? null,
      sugars: nutriments.sugars_100g ?? null,
      fiber: nutriments.fiber_100g ?? null,

      // Scan2Health stores sodium in milligrams.
      sodium: gramsToMg(nutriments.sodium_100g),

      // Retain the current mappings; unit normalization can be reviewed separately.
      cholesterol: nutriments.cholesterol_100g ?? null,
      iron: nutriments.iron_100g ?? null,
      calcium: nutriments.calcium_100g ?? null,
      potassium: nutriments.potassium_100g ?? null,
      vitaminA: nutriments['vitamin-a_100g'] ?? null,
      vitaminC: nutriments['vitamin-c_100g'] ?? null,
      vitaminD: nutriments['vitamin-d_100g'] ?? null,
      vitaminB12: nutriments['vitamin-b12_100g'] ?? null,
      folate: nutriments.folate_100g ?? null,
    },

    nutritionBasis: 'PER_100G',

    ingredients: {
      text: externalProduct.ingredients_text || '',
      items: ingredients,
    },

    foodComponents: detectFoodComponents(ingredients),

    allergens: Array.isArray(externalProduct.allergens_tags)
      ? externalProduct.allergens_tags.map((item) =>
          item.replace(/^en:/, '')
        )
      : [],

    source: 'OPEN_FOOD_FACTS',
    sourceProductId: externalProduct.code || barcode,
    active: true,
  };
};

const findOrFetchProductByBarcode = async (rawBarcode) => {
  const barcode = String(rawBarcode || '').trim();

  if (!barcode) {
    const error = new Error('Barcode is required.');
    error.statusCode = 400;
    throw error;
  }

  const existingProduct = await Product.findOne({
    barcode,
    active: true,
  }).lean();

  if (existingProduct) {
    return {
      product: existingProduct,
      source: 'MONGODB',
    };
  }

  let response;

  try {
    response = await getOpenFoodFactsProduct(barcode);
    console.log('Open Food Facts response status:', response?.status);
    console.log('Open Food Facts response code:', response?.code);
    console.log('Open Food Facts product exists:', Boolean(response?.product));
    console.log(
    'Open Food Facts response keys:',
    response ? Object.keys(response) : []
    );
  } catch (error) {
    console.error('Open Food Facts request failed:', error.message);

    const lookupError = new Error(
      'Unable to retrieve product information from Open Food Facts.'
    );
    lookupError.statusCode = 502;
    throw lookupError;
  }


    if (
    !response ||
    !response.product ||
    response.status === 'failure' ||
    response.status === 0
    ) {
    const error = new Error('Product was not found.');
    error.statusCode = 404;
    throw error;
    }


  const normalizedProduct = normalizeOpenFoodFactsProduct(
    barcode,
    response.product
  );

  try {
    const savedProduct = await Product.create(normalizedProduct);

    return {
      product: savedProduct.toObject(),
      source: 'OPEN_FOOD_FACTS',
    };
  } catch (error) {
    // Another request may have saved the same unique barcode concurrently.
    if (error.code === 11000) {
      const product = await Product.findOne({
        barcode,
        active: true,
      }).lean();

      if (product) {
        return { product, source: 'MONGODB' };
      }
    }

    throw error;
  }
};

module.exports = {
  findOrFetchProductByBarcode,
};
