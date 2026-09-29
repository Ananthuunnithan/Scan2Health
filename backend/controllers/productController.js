const Product = require('../models/Product');

const {
  getProductByBarcode: getOpenFoodFactsProduct,
} = require('../services/openFoodFactsService');

const {
  detectFoodComponents,
} = require('../utils/foodComponentDetector');

const gramsToMg = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number * 1000;
};

const parseServingSize = (servingSize) => {
  if (!servingSize) {
    return {
      size: null,
      unit: null,
    };
  }

  const text = String(servingSize).trim().toLowerCase();

  // Prefer an explicit value followed by g or ml.
  const unitMatch = text.match(
    /(\d+(?:\.\d+)?)\s*(g|ml)\b/
  );

  if (unitMatch) {
    return {
      size: Number(unitMatch[1]),
      unit: unitMatch[2],
    };
  }

  // If no unit is present, don't guess.
  return {
    size: null,
    unit: null,
  };
};

const normalizeIngredient = (ingredient) => {
  if (!ingredient) {
    return null;
  }

  return String(ingredient)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
};

const extractIngredients = (ingredients) => {
  if (!Array.isArray(ingredients)) {
    return [];
  }

  const result = [];

  const walk = (items) => {
    for (const item of items) {
      if (!item || typeof item !== 'object') {
        continue;
      }

      if (item.text) {
        const normalized = normalizeIngredient(item.text);

        if (normalized) {
          result.push(normalized);
        }
      }

      if (Array.isArray(item.ingredients)) {
        walk(item.ingredients);
      }
    }
  };

  walk(ingredients);

  return [...new Set(result)];
};

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ active: true })
      .sort({ productName: 1 })
      .lean();

    return res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return next(error);
  }
};

const getProductByBarcode = async (req, res, next) => {
  try {
    const barcode = req.params.barcode.trim();

    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: 'Barcode is required.',
      });
    }

    // 1. Check our own MongoDB first

    const existingProduct = await Product.findOne({
      barcode,
      active: true,
    }).lean();

    if (existingProduct) {
      return res.json({
        success: true,
        source: 'MONGODB',
        product: existingProduct,
      });
    }

    // 2. Product not in MongoDB
    //    Try Open Food Facts

    let externalData;

    try {
      externalData = await getOpenFoodFactsProduct(barcode);

      console.log('========== OPEN FOOD FACTS RESPONSE ==========');
      console.log(JSON.stringify(externalData, null, 2));
      console.log('===============================================');
    } catch (error) {
      console.error(
        'Open Food Facts request failed:',
        error.message
      );

      return res.status(502).json({
        success: false,
        message: 'Unable to retrieve product information.',
      });
    }

    // 3. Check Open Food Facts response
  
    if (
      !externalData ||
      !externalData.product
    ) {
      return res.status(404).json({
      success: false,
      message: 'Product was not found.',
      });
    }

    const externalProduct = externalData.product;

    // 4. Normalize Open Food Facts data

    const nutriments = externalProduct.nutriments || {};

    const normalizedIngredients =
      extractIngredients(
        externalProduct.ingredients
      );

    const foodComponents =
      detectFoodComponents(
        normalizedIngredients
      );

    const normalizedProduct = {
      barcode,

      productName:
        externalProduct.product_name ||
        externalProduct.product_name_en ||
        'Unknown Product',

      brand: externalProduct.brands || '',

      category:
        externalProduct.categories ||
        '',

      serving: {
        ...parseServingSize(
          externalProduct.serving_size
        ),

        servingsPerPackage: null,
      },

      nutrition: {
        calories:
          nutriments['energy-kcal_100g'] ?? null,

        protein:
          nutriments.proteins_100g ?? null,

        carbohydrates:
          nutriments.carbohydrates_100g ?? null,

        totalFat:
          nutriments.fat_100g ?? null,

        saturatedFat:
          nutriments['saturated-fat_100g'] ?? null,

        transFat:
          nutriments['trans-fat_100g'] ?? null,

        sugars:
          nutriments.sugars_100g ?? null,

        fiber:
          nutriments.fiber_100g ?? null,

        // Open Food Facts may provide sodium_100g in grams.
        // Scan2Health stores sodium internally in mg.
        sodium:
          gramsToMg(nutriments.sodium_100g),

        // These values are currently kept as provided.
        cholesterol:
          nutriments.cholesterol_100g ?? null,

        iron:
          nutriments.iron_100g ?? null,

        calcium:
          nutriments.calcium_100g ?? null,

        potassium:
          nutriments.potassium_100g ?? null,

        vitaminA:
          nutriments['vitamin-a_100g'] ?? null,

        vitaminC:
          nutriments['vitamin-c_100g'] ?? null,

        vitaminD:
          nutriments['vitamin-d_100g'] ?? null,

        vitaminB12:
          nutriments['vitamin-b12_100g'] ?? null,

        folate:
          nutriments.folate_100g ?? null,
      },

      nutritionBasis: 'PER_100G',

      ingredients: {
        text:
          externalProduct.ingredients_text ||
          '',

        items: normalizedIngredients,
      },

      foodComponents,
      
      allergens:
        Array.isArray(externalProduct.allergens_tags)
          ? externalProduct.allergens_tags.map(
              (item) =>
                item.replace(/^en:/, '')
          )
          : [],

      source: 'OPEN_FOOD_FACTS',

      sourceProductId:
        externalProduct.code || barcode,

      active: true,
    };

    // 5. Save normalized product to MongoDB

    const savedProduct = await Product.create(
      normalizedProduct
    );

    // 6. Return our MongoDB product

    return res.status(200).json({
      success: true,
      source: 'OPEN_FOOD_FACTS',
      product: savedProduct,
    });

  } catch (error) {
    return next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const existingProduct = await Product.findOne({
      barcode: req.body.barcode,
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: 'A product with this barcode already exists.',
      });
    }

    const product = await Product.create(req.body);

    return res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProducts,
  getProductByBarcode,
  createProduct,
};