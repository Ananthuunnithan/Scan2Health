const mongoose = require('mongoose');
require('dotenv').config();

const UserProfile = require('./models/UserProfile');
const Product = require('./models/Product');

const {
  evaluateDailyNutritionForUser
} = require('./services/dailyAssessmentService');

const {
  getDailyNutrition
} = require('./services/dailyNutritionService');


async function testDailyAssessment() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected for test.');

    // Your currently tested Firebase UID
    const userId = 'D0e4zQjSaPftkA7DvTunfmHVFfg2';

    const date = '2026-10-04';


    // ---------------------------------------------
    // 1. Get the user's profile
    // ---------------------------------------------

    const profile = await UserProfile.findOne({
      userId
    }).lean();

    if (!profile) {
      throw new Error('User profile not found.');
    }
        console.log('\n========== PROFILE CONDITIONS ==========\n');

        console.log(
        JSON.stringify(
            profile.healthConditions,
            null,
            2
        )
        );

        console.log(
        '\n========================================\n'
        );

    // ---------------------------------------------
    // 2. Get aggregated daily nutrition
    // ---------------------------------------------

    const dailyNutrition = await getDailyNutrition(
      userId,
      date
    );
    console.log('\n========== DAILY TOTALS ==========\n');

    console.log(
    JSON.stringify(
        dailyNutrition.totals,
        null,
        2
    )
    );

    console.log(
    '\n==================================\n'
    );

    // ---------------------------------------------
    // 3. Evaluate daily nutrition
    // ---------------------------------------------

    const assessment =
      await evaluateDailyNutritionForUser({
        profile,
        dailyNutrition
      });


    console.log('\n========== DAILY ASSESSMENT ==========\n');

    console.log(
      JSON.stringify(
        assessment,
        null,
        2
      )
    );

    console.log(
      '\n======================================\n'
    );

  } catch (error) {
    console.error(
      'Daily assessment test failed:',
      error
    );

  } finally {
    await mongoose.connection.close();
  }
}


testDailyAssessment();