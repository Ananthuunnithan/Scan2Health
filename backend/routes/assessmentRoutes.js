const express = require('express');

const router = express.Router();

const authenticateFirebase = require('../middleware/authenticateFirebase');

const UserProfile = require('../models/UserProfile');
const Product = require('../models/Product');

const {
  evaluateProductForUser
} = require('../services/assessmentService');


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

    const product = await Product.findOne({
      barcode: String(barcode).trim(),
      active: true
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const assessment = await evaluateProductForUser({
      profile,
      product
    });


    return res.status(200).json({
      success: true,
      assessment
    });

  } catch (error) {
    console.error('Assessment API error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to evaluate product.'
    });
  }
});


module.exports = router;