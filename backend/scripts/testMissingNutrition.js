
require('dotenv').config();
const mongoose = require('mongoose');

const NutritionalRule = require('../models/NutritionalRule');
const {
  evaluateNutrientRules,
  evaluateDailyNutrientRules
} = require('../services/ruleEngineService');

async function runTest() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected.');

  try {
    // Product-level test: missing potassium must not trigger a finding.
    const productFindings = await evaluateNutrientRules({
      conditionCodes: ['HYPERTENSION'],
      product: {
        nutritionBasis: 'PER_100G',
        nutrition: {
          sodium: null,
          potassium: null
        }
      }
    });

    console.log('Product findings:', productFindings);

    if (productFindings.some(
      (finding) =>
        finding.nutrient === 'sodium' ||
        finding.nutrient === 'potassium'
    )) {
      throw new Error('Missing product nutrients triggered a rule.');
    }

    // Daily test: missing fiber must not trigger a finding.
    const dailyFindings = await evaluateDailyNutrientRules({
      conditionCodes: ['DIABETES'],
      dailyNutrition: {
        sugars: null,
        fiber: null
      }
    });

    // Edge-case test: empty strings must not trigger daily rules.
    const emptyStringFindings = await evaluateDailyNutrientRules({
      conditionCodes: ['DIABETES'],
      dailyNutrition: {
        fiber: ''
      }
    });

    console.log('Empty-string findings:', emptyStringFindings);

    if (emptyStringFindings.some(
      (finding) => finding.nutrient === 'fiber'
    )) {
      throw new Error(
        'Empty-string fiber incorrectly triggered a daily rule.'
      );
    }   
    
    // Whitespace-only fiber must not trigger a finding.
    const whitespaceFindings = await evaluateDailyNutrientRules({
      conditionCodes: ['DIABETES'],
      dailyNutrition: {
        fiber: '   '
      }
    });

    if (whitespaceFindings.some(
      (finding) => finding.nutrient === 'fiber'
    )) {
      throw new Error('Whitespace-only fiber triggered a rule.');
    }

    // A valid numeric string must still be evaluated.
    const numericStringFindings = await evaluateDailyNutrientRules({
      conditionCodes: ['DIABETES'],
      dailyNutrition: {
        fiber: '24'
      }
    });

    if (!numericStringFindings.some(
      (finding) =>
        finding.nutrient === 'fiber' &&
        finding.value === 24
    )) {
      throw new Error('Valid numeric-string fiber was not evaluated.');
    }

    console.log('Whitespace and numeric-string tests passed.');

    console.log('Daily findings:', dailyFindings);

    if (dailyFindings.some(
      (finding) =>
        finding.nutrient === 'sugars' ||
        finding.nutrient === 'fiber'
    )) {
      throw new Error('Missing daily nutrients triggered a rule.');
    }

    console.log('Missing nutrition tests passed.');
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

runTest().catch((error) => {
  console.error('Missing nutrition test failed:', error.message);
  process.exitCode = 1;
});
