const mongoose = require('mongoose');
require('dotenv').config();

const UserProfile = require('../models/UserProfile');
const Product = require('../models/Product');

const {
  evaluateProductForUser
} = require('../services/assessmentService');

const {
  getDailyNutrition
} = require('../services/dailyNutritionService');

const {
  evaluateDailyNutritionForUser
} = require('../services/dailyAssessmentService');

const {
  buildRagContext
} = require('../services/ragContextService');

const {
  generateExplanation
} = require('../services/geminiExplanationService');

async function runTest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected.');

    // Use the same test user and product barcode you've already verified.
    const userId = 'D0e4zQjSaPftkA7DvTunfmHVFfg2';
    const barcode = '737628064502';

    const profile = await UserProfile.findOne({ userId }).lean();

    if (!profile) {
      throw new Error('Test user profile not found.');
    }

    const product = await Product.findOne({
      barcode,
      active: true
    }).lean();

    if (!product) {
      throw new Error('Test product not found.');
    }

    const assessment = await evaluateProductForUser({
      profile,
      product
    });

    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kolkata'
    });

    const dailyNutrition = await getDailyNutrition(userId, today);

    const dailyAssessment = await evaluateDailyNutritionForUser({
      profile,
      dailyNutrition
    });

    const ragContext = await buildRagContext({
    assessment,
    dailyAssessment
    });

    const aiExplanation = await generateExplanation(ragContext);

    console.log('\n========== AI EXPLANATION ==========\n');
    console.log(JSON.stringify(aiExplanation, null, 2));
    console.log('\n====================================\n');

    console.log('\n========== RAG CONTEXT ==========\n');
    console.log(JSON.stringify(ragContext, null, 2));
    console.log('\n=================================\n');

    console.log('Product status:', ragContext.overallStatus);
    console.log('Nutrition findings:', ragContext.findings.length);
    console.log('Allergy findings:', ragContext.allergyFindings.length);
    console.log('Knowledge result groups:', ragContext.knowledge.length);

  } catch (error) {
    console.error('RAG context test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

runTest();