
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

async function main() {
  try {
    await connectDB();

    const barcodes = ['737628064502', '8901014002054'];

    const products = await Product.find({
      barcode: { $in: barcodes },
    })
      .select('barcode productName nutritionBasis serving nutrition')
      .lean();

    for (const product of products) {
      console.log('\nProduct:', product.productName);
      console.log('Barcode:', product.barcode);
      console.log('Nutrition basis:', product.nutritionBasis);
      console.log('Serving:', product.serving);
      console.log('Stored product nutrition:');
      console.dir(product.nutrition, { depth: null });
    }

    const found = new Set(products.map((product) => product.barcode));
    const missing = barcodes.filter((barcode) => !found.has(barcode));

    if (missing.length) {
      console.log('\nProducts not found:', missing);
    }
  } catch (error) {
    console.error('Inspection failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
