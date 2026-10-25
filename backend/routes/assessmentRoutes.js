const express = require('express');

const router = express.Router();

const authenticateFirebase = require('../middleware/authenticateFirebase');

const UserProfile = require('../models/UserProfile');

const {
  getProductByBarcode,
} = require('../controllers/productController');

const {
  findOrFetchProductByBarcode,
} = require('../services/productLookupService');

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
  generateRecommendations
} = require('../services/recommendationService');

const {
  buildRagContext
} = require('../services/ragContextService');

const {
  generateExplanation
} = require('../services/geminiExplanationService');

router.post('/', authenticateFirebase, async (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: 'Barcode is required.'
      });
    }

    const userId = req.firebaseUser?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authenticated user ID is missing.'
      });
    }


    const profile = await UserProfile.findOne({
      userId
    }).lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    const { product } = await findOrFetchProductByBarcode(barcode);

    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kolkata'
    });

    const assessment = await evaluateProductForUser({
      profile,
      product
    });

    const dailyNutrition = await getDailyNutrition(
      userId,
      today
    );

    const dailyAssessment = await evaluateDailyNutritionForUser({
      profile,
      dailyNutrition
    });

    const recommendations = generateRecommendations({
      assessment,
      dailyNutrition: dailyAssessment
    });

    const ragContext = await buildRagContext({
      assessment,
      dailyAssessment
    });

    let aiExplanation = null;

    try {
      aiExplanation = await generateExplanation(ragContext);
    } catch (error) {
      console.error('Gemini explanation error:', error.message);
    }

    return res.status(200).json({
      success: true,
      assessment,
      recommendations,
      ragContext,
      aiExplanation
    });

    } catch (error) {
      console.error('Assessment API error:', error);

      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.statusCode
          ? error.message
          : 'Failed to evaluate product.'
      });
    }
});


module.exports = router;
