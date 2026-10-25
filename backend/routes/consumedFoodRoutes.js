const express = require('express');

const router = express.Router();

const authenticateFirebase = require('../middleware/authenticateFirebase');

const Product = require('../models/Product');
const ConsumedFood = require('../models/ConsumedFood');

const {
  calculateConsumedNutrition,
  resolveServingConsumed
} = require('../services/nutritionConsumptionService');


router.post('/', authenticateFirebase, async (req, res) => {
  try {
    const {
      barcode,
      quantity,
      consumedAmount,
      consumedUnit
    } = req.body;

    // --------------------------------------------------
    // 1. Validate barcode
    // --------------------------------------------------

    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: 'Barcode is required.'
      });
    }


    // --------------------------------------------------
    // 2. Validate quantity
    // --------------------------------------------------

    const parsedQuantity = Number(quantity);
    const parsedConsumedAmount =
      consumedAmount === null || consumedAmount === undefined
        ? null
        : Number(consumedAmount);

    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a number greater than zero.'
      });
    }


    // --------------------------------------------------
    // 3. Get authenticated Firebase user
    // --------------------------------------------------

    const userId = req.firebaseUser?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authenticated user ID is missing.'
      });
    }


    // --------------------------------------------------
    // 4. Find the product
    // --------------------------------------------------

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


    // --------------------------------------------------
    // 5. Calculate nutrition actually consumed
    // --------------------------------------------------

    let nutritionConsumed;
    let servingConsumed;

    try {
      servingConsumed = resolveServingConsumed(
        product,
        parsedQuantity,
        parsedConsumedAmount,
        consumedUnit
      );
      nutritionConsumed = calculateConsumedNutrition(
        product,
        parsedQuantity,
        parsedConsumedAmount,
        consumedUnit
      );
    } catch (calculationError) {
      return res.status(400).json({
        success: false,
        message: calculationError.message
      });
    }


    // --------------------------------------------------
    // 7. Create consumed food record
    // --------------------------------------------------

    const consumedFood = await ConsumedFood.create({
      userId,

      productId: product._id,

      barcode: product.barcode,

      consumedAt: new Date(),

      quantity: parsedQuantity,

      servingConsumed,

      nutritionConsumed
    });


    // --------------------------------------------------
    // 8. Return response
    // --------------------------------------------------

    return res.status(201).json({
      success: true,
      message: 'Food consumption recorded successfully.',
      consumedFood
    });

  } catch (error) {
    console.error('Consumed Food API error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to record consumed food.'
    });
  }
});


module.exports = router;