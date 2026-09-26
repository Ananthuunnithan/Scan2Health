const express = require('express');

const NutritionalRule = require('../models/NutritionalRule');
const HealthCondition = require('../models/HealthCondition');

const authenticateFirebase = require('../middleware/authenticateFirebase');

const router = express.Router();

router.use(authenticateFirebase);

router.get('/', async (req, res, next) => {
  try {
    const filter = {
      active: true
    };

    if (req.query.condition) {
      filter.conditionCode = req.query.condition
        .trim()
        .toUpperCase();
    }

    const rules = await NutritionalRule
      .find(filter)
      .sort({
        conditionCode: 1,
        nutrient: 1
      })
      .lean();

    return res.json({
      success: true,
      count: rules.length,
      rules
    });

  } catch (error) {
    return next(error);
  }
});


/*
 * GET RULES FOR A SPECIFIC HEALTH CONDITION
 *
 * Example:
 * /api/nutritional-rules/DIABETES
 */
router.get('/:conditionCode', async (req, res, next) => {
  try {

    const conditionCode =
      req.params.conditionCode.trim().toUpperCase();

    /*
     * First verify that the health condition exists.
     */
    const condition = await HealthCondition.findOne({
      code: conditionCode,
      active: true
    }).lean();

    if (!condition) {
      return res.status(404).json({
        success: false,
        message: 'Health condition not found.'
      });
    }

    /*
     * Retrieve rules associated with the condition.
     */
    const rules = await NutritionalRule
      .find({
        conditionCode,
        active: true
      })
      .sort({
        nutrient: 1
      })
      .lean();

    return res.json({
      success: true,
      condition,
      count: rules.length,
      rules
    });

  } catch (error) {
    return next(error);
  }
});


module.exports = router;