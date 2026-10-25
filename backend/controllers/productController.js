const Product = require('../models/Product');

const {
  findOrFetchProductByBarcode,
} = require('../services/productLookupService');

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
    const result = await findOrFetchProductByBarcode(
      req.params.barcode
    );

    return res.status(200).json({
      success: true,
      source: result.source,
      product: result.product,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

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