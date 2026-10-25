const express = require('express');

const router = express.Router();

const authenticateFirebase = require('../middleware/authenticateFirebase');

const UserProfile = require('../models/UserProfile');

const {
  getDailyNutrition
} = require('../services/dailyNutritionService');

const {
  evaluateDailyNutritionForUser
} = require('../services/dailyAssessmentService');


/*
 * GET /api/nutrition/daily/assessment
 *
 * Example:
 * GET /api/nutrition/daily/assessment?date=2026-10-04
 */
router.get('/', authenticateFirebase, async (req, res) => {
  try {
    // ---------------------------------------------
    // 1. Get authenticated user
    // ---------------------------------------------

    const userId = req.firebaseUser?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authenticated user ID is missing.'
      });
    }


    // ---------------------------------------------
    // 2. Validate date
    // ---------------------------------------------

    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required in YYYY-MM-DD format.'
      });
    }


    // ---------------------------------------------
    // 3. Get user profile
    // ---------------------------------------------

    const profile = await UserProfile.findOne({
      userId
    }).lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }


    // ---------------------------------------------
    // 4. Get aggregated daily nutrition
    // ---------------------------------------------

    const dailyNutrition = await getDailyNutrition(
      userId,
      date
    );


    // ---------------------------------------------
    // 5. Evaluate daily nutrition
    // ---------------------------------------------

    const dailyAssessment =
      await evaluateDailyNutritionForUser({
        profile,
        dailyNutrition
      });


    // ---------------------------------------------
    // 6. Return response
    // ---------------------------------------------

    return res.status(200).json({
      success: true,
      dailyAssessment
    });

  } catch (error) {
    console.error(
      'Daily Assessment API error:',
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        'Failed to evaluate daily nutrition.'
    });
  }
});


module.exports = router;