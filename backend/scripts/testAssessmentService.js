require('dotenv').config();

const mongoose = require('mongoose');

const Product = require('../models/Product');
const UserProfile = require('../models/UserProfile');

const {
  evaluateProductForUser
} = require('../services/assessmentService');


async function testAssessmentService() {
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

    const profile = await UserProfile.findOne({
      userId: { $exists: true }
    }).lean();

    if (!profile) {
      console.log('User profile not found.');
      return;
    }

    console.log('\nUser Profile:');
    console.log({
      userId: profile.userId,
      healthConditions: profile.healthConditions,
      allergies: profile.diet?.allergies
    });

    console.log('\nProduct:');
    console.log({
      barcode: product.barcode,
      productName: product.productName,
      foodComponents: product.foodComponents,
      nutritionBasis: product.nutritionBasis
    });


    const assessment = await evaluateProductForUser({
      profile,
      product
    });


    console.log('\n========== ASSESSMENT ==========');
    console.log(JSON.stringify(assessment, null, 2));
    console.log('================================');


  } catch (error) {
    console.error('Assessment test failed:', error);

  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed.');
  }
}


testAssessmentService();