require('dotenv').config();

const mongoose = require('mongoose');

const Product = require('../models/Product');
const { evaluateNutrientRules } = require('../services/ruleEngineService');

async function testRuleEngine() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected.');

    /*
     * Get the real product we already tested.
     */
    const product = await Product.findOne({
      barcode: '737628064502',
      active: true
    }).lean();

    if (!product) {
      console.log('Product not found.');
      return;
    }

    console.log('\nProduct found:');
    console.log({
      barcode: product.barcode,
      productName: product.productName,
      nutritionBasis: product.nutritionBasis,
      sodium: product.nutrition?.sodium
    });

    /*
     * Evaluate rules for hypertension.
     */
    const findings = await evaluateNutrientRules({
      conditionCodes: ['HYPERTENSION'],
      product
    });

    console.log('\nRule Engine Findings:');
    console.log(JSON.stringify(findings, null, 2));

  } catch (error) {
    console.error('Rule Engine test failed:', error);

  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed.');
  }
}

testRuleEngine();