const express = require('express');

const UserProfile = require('../models/UserProfile');
const HealthCondition = require('../models/HealthCondition');

const authenticateFirebase = require('../middleware/authenticateFirebase');

const router = express.Router();

const {
  ACTIVITY_LEVELS,
  GOALS,
  DIETARY_PREFERENCES,
  ALLERGIES,
  SEXES
} = UserProfile.options;



const hasOnly = (values, allowed) =>
  Array.isArray(values) &&
  values.every((value) => allowed.includes(value));



async function validateHealthConditions(healthConditions) {

  if (!Array.isArray(healthConditions)) {
    return 'Health conditions must be an array.';
  }


  const conditions = [
    ...new Set(
      healthConditions.map((condition) =>
        String(condition).trim().toUpperCase()
      )
    )
  ];


  if (conditions.includes('NONE')) {

    if (conditions.length > 1) {
      return 'None cannot be combined with another health condition.';
    }

    return null;
  }

  if (conditions.length === 0) {
    return null;
  }

  const existingConditions = await HealthCondition.find({
    code: { $in: conditions },
    active: true
  })
    .select('code')
    .lean();

  const validCodes = new Set(
    existingConditions.map((condition) => condition.code)
  );

  const invalidConditions = conditions.filter(
    (condition) => !validCodes.has(condition)
  );

  if (invalidConditions.length > 0) {
    return `One or more health conditions are invalid: ${invalidConditions.join(', ')}`;
  }

  return null;
}



async function validateProfile(body) {

  const {
    basicInfo,
    healthConditions,
    lifestyle,
    goals,
    diet
  } = body || {};


  

  if (
    !basicInfo ||
    typeof basicInfo.name !== 'string' ||
    !basicInfo.name.trim()
  ) {
    return 'Name is required.';
  }

  if (
    !Number.isInteger(basicInfo.age) ||
    basicInfo.age < 1 ||
    basicInfo.age > 120
  ) {
    return 'Age must be between 1 and 120.';
  }

  if (!SEXES.includes(basicInfo.sex)) {
    return 'Select a valid sex.';
  }

  if (
    typeof basicInfo.heightCm !== 'number' ||
    basicInfo.heightCm < 40 ||
    basicInfo.heightCm > 300
  ) {
    return 'Height must be between 40 and 300 cm.';
  }

  if (
    typeof basicInfo.weightKg !== 'number' ||
    basicInfo.weightKg < 2 ||
    basicInfo.weightKg > 500
  ) {
    return 'Weight must be between 2 and 500 kg.';
  }


  const healthConditionError =
    await validateHealthConditions(healthConditions);

  if (healthConditionError) {
    return healthConditionError;
  }


  

  if (
    !lifestyle ||
    !ACTIVITY_LEVELS.includes(lifestyle.activityLevel)
  ) {
    return 'Select a valid activity level.';
  }


  if (
    !goals ||
    !GOALS.includes(goals.primary)
  ) {
    return 'Select a valid primary goal.';
  }


  
  if (
    !diet ||
    !DIETARY_PREFERENCES.includes(diet.preference)
  ) {
    return 'Select a valid dietary preference.';
  }

  if (!hasOnly(diet.allergies, ALLERGIES)) {
    return 'One or more allergies are invalid.';
  }


  return null;
}


function normaliseProfile(body) {

  let healthConditions = [
    ...new Set(
      (body.healthConditions || []).map((condition) =>
        String(condition).trim().toUpperCase()
      )
    )
  ];

  if (healthConditions.includes('NONE')) {
    healthConditions = [];
  }

  return {

    basicInfo: {
      ...body.basicInfo,
      name: body.basicInfo.name.trim()
    },

    healthConditions,

    lifestyle: {
      activityLevel: body.lifestyle.activityLevel
    },

    goals: {
      primary: body.goals.primary
    },

    diet: {
      preference: body.diet.preference,
      allergies: [
        ...new Set(body.diet.allergies || [])
      ]
    }
  };
}


router.use(authenticateFirebase);


router.get('/', async (req, res, next) => {

  try {

    const profile = await UserProfile
      .findOne({
        userId: req.firebaseUser.uid
      })
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.'
      });
    }

    return res.json({
      success: true,
      profile
    });

  } catch (error) {

    return next(error);

  }

});



router.post('/', async (req, res, next) => {

  try {

    const validationError =
      await validateProfile(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }


    const existing = await UserProfile.findOne({
      userId: req.firebaseUser.uid
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A profile already exists. Use update instead.'
      });
    }


    const profile = await UserProfile.create({
      userId: req.firebaseUser.uid,
      ...normaliseProfile(req.body)
    });


    return res.status(201).json({
      success: true,
      profile
    });

  } catch (error) {

    return next(error);

  }

});


router.put('/', async (req, res, next) => {

  try {

    const validationError =
      await validateProfile(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }


    const profile = await UserProfile.findOneAndUpdate(

      {
        userId: req.firebaseUser.uid
      },

      normaliseProfile(req.body),

      {
        new: true,
        runValidators: true
      }

    );


    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Save it first.'
      });
    }


    return res.json({
      success: true,
      profile
    });

  } catch (error) {

    return next(error);

  }

});


module.exports = router;