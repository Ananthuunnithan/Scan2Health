
require('dotenv').config();
const mongoose = require('mongoose');

const NutritionalRule = require('../models/NutritionalRule');
const {
  evaluateNutrientRules
} = require('../services/ruleEngineService');

async function runTest() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected.');

  try {
    const dailyRule = await NutritionalRule.findOne({
      ruleType: 'NUTRIENT_THRESHOLD',
      conditionCode: 'HYPERTENSION',
      nutrient: 'sodium',
      basis: 'DAILY',
      active: true
    }).lean();

    if (!dailyRule) {
      throw new Error('Existing daily sodium rule was not found.');
    }

    const findings = await evaluateNutrientRules({
      conditionCodes: ['HYPERTENSION'],
      product: {
        nutritionBasis: 'PER_100G',
        nutrition: {
          sodium: dailyRule.threshold + 1000
        }
      }
    });

    console.log('Product-level findings:', findings);

    if (findings.some(
      (finding) => finding.nutrient === 'sodium'
    )) {
      throw new Error(
        'Daily sodium rule incorrectly triggered at product level.'
      );
    }

    console.log('Daily/product rule separation test passed.');
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

runTest().catch((error) => {
  console.error('Rule separation test failed:', error.message);
  process.exitCode = 1;
});
