const mongoose = require('mongoose');
require('dotenv').config();

const {
  evaluateDailyNutrientRules
} = require('./services/ruleEngineService');


async function testDailyRules() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected for test.');

    const findings = await evaluateDailyNutrientRules({
      conditionCodes: [
        'DIABETES',
        'HYPERTENSION'
      ],

      dailyNutrition: {
        fiber: 0.988,
        sodium: 149.76
      }
    });

    console.log('\n========== DAILY RULE TEST ==========\n');

    console.log(JSON.stringify(findings, null, 2));

    console.log('\n=====================================\n');

  } catch (error) {
    console.error('Daily rule test failed:', error);

  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
  }
}


testDailyRules();