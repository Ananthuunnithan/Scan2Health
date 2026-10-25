const express = require('express');

const router = express.Router();

const authenticateFirebase = require('../middleware/authenticateFirebase');

const {
  getDailyNutrition,
  getWeeklyNutrition
} = require('../services/dailyNutritionService');

router.get('/', authenticateFirebase, async (req, res) => {
  try {
    const userId = req.firebaseUser?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authenticated user ID is missing.'
      });
    }


    // --------------------------------------------------
    // Get requested date
    // --------------------------------------------------

    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required in YYYY-MM-DD format.'
      });
    }


    // --------------------------------------------------
    // Get daily nutrition
    // --------------------------------------------------

    const dailyNutrition = await getDailyNutrition(
      userId,
      date
    );


    // --------------------------------------------------
    // Return response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      dailyNutrition
    });

  } catch (error) {
    console.error('Daily Nutrition API error:', error);

    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve daily nutrition.'
    });
  }
});

// --------------------------------------------------
// Get weekly nutrition
// --------------------------------------------------

router.get('/weekly', authenticateFirebase, async (req, res) => {
  try {
    const userId = req.firebaseUser?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authenticated user ID is missing.'
      });
    }

    // --------------------------------------------------
    // Get requested end date
    // --------------------------------------------------

    const { endDate } = req.query;

    if (!endDate) {
      return res.status(400).json({
        success: false,
        message: 'End date is required in YYYY-MM-DD format.'
      });
    }

    // --------------------------------------------------
    // Get weekly nutrition
    // --------------------------------------------------

    const weeklyNutrition = await getWeeklyNutrition(
      userId,
      endDate
    );

    // --------------------------------------------------
    // Return response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      weeklyNutrition
    });

  } catch (error) {
    console.error('Weekly Nutrition API error:', error);

    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve weekly nutrition.'
    });
  }
});


module.exports = router;