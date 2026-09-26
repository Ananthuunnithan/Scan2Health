require('dotenv').config();

const mongoose = require('mongoose');

const NutritionalRule = require('../models/NutritionalRule');
const HealthCondition = require('../models/HealthCondition');


const nutritionalRules = [

  {
    ruleType: 'NUTRIENT_THRESHOLD',

    conditionCode: 'DIABETES',

    nutrient: 'sugars',

    operator: 'GREATER_THAN_OR_EQUAL',

    threshold: 50,

    unit: 'g',

    basis: 'DAILY',

    severity: 'WARNING',

    action: 'LIMIT',

    message:
      'Daily free sugar intake at or above 50 g should be limited.',

    source: {
      name: 'WHO',
      reference: 'Healthy diet',
      version: '2026'
    },

    active: true
  },


  {
    ruleType: 'NUTRIENT_THRESHOLD',

    conditionCode: 'HYPERTENSION',

    nutrient: 'sodium',

    operator: 'GREATER_THAN_OR_EQUAL',

    threshold: 2000,

    unit: 'mg',

    basis: 'DAILY',

    severity: 'WARNING',

    action: 'LIMIT',

    message:
      'Daily sodium intake should generally remain below 2000 mg.',

    source: {
      name: 'WHO',
      reference: 'Healthy diet / Sodium reduction',
      version: '2026'
    },

    active: true
  },


  {
    ruleType: 'NUTRIENT_THRESHOLD',

    conditionCode: 'DIABETES',

    nutrient: 'fiber',

    operator: 'LESS_THAN',

    threshold: 25,

    unit: 'g',

    basis: 'DAILY',

    severity: 'INFO',

    action: 'PREFER',

    message:
      'A daily intake of at least 25 g of naturally occurring dietary fibre is recommended for people older than 10 years.',

    source: {
      name: 'WHO',
      reference: 'Healthy diet / Carbohydrate guideline',
      version: '2026'
    },

    active: true
  }

];


async function validateConditionCodes() {

  const conditionCodes = [
    ...new Set(
      nutritionalRules.map(
        (rule) => rule.conditionCode
      )
    )
  ];


  const conditions = await HealthCondition.find({
    code: {
      $in: conditionCodes
    },
    active: true
  })
    .select('code')
    .lean();


  const validCodes = new Set(
    conditions.map(
      (condition) => condition.code
    )
  );


  const missingCodes = conditionCodes.filter(
    (code) => !validCodes.has(code)
  );


  if (missingCodes.length > 0) {

    throw new Error(
      `The following health condition codes do not exist: ${missingCodes.join(', ')}`
    );

  }

}


async function seedNutritionalRules() {

  try {

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log('MongoDB connected.');

    await validateConditionCodes();



    await NutritionalRule.deleteMany({});


    await NutritionalRule.insertMany(
      nutritionalRules
    );


    console.log(
      `${nutritionalRules.length} nutritional rules inserted successfully.`
    );


    await mongoose.connection.close();

    console.log(
      'MongoDB connection closed.'
    );

  } catch (error) {

    console.error(
      'Nutritional rule seeding failed:',
      error
    );

    process.exit(1);

  }

}


seedNutritionalRules();