require('dotenv').config();

const mongoose = require('mongoose');

const Product = require('../models/Product');
const UserProfile = require('../models/UserProfile');

const {
  evaluateAllergyRules
} = require('../services/allergyEvaluationService');


async function testAllergyEvaluation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected.');

    const product = await Product.findOne({
      barcode: '737628064502',
      active: true
    }).lean();

    if (!product) {
      console.log('Product not found.');
      return;
    }

    console.log('\nProduct:');
    console.log({
      barcode: product.barcode,
      productName: product.productName,
      foodComponents: product.foodComponents
    });

    const profile = await UserProfile.findOne({
      'diet.allergies': { $exists: true }
    }).lean();

    const allergies = ['Peanut'];

    console.log('\nUser allergies:');
    console.log(allergies);


    const findings = evaluateAllergyRules({
      allergies,
      product
    });


    console.log('\nAllergy Evaluation Findings:');
    console.log(JSON.stringify(findings, null, 2));

  } catch (error) {
    console.error('Allergy evaluation test failed:', error);

  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed.');
  }
}


testAllergyEvaluation();