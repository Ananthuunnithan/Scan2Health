const mongoose = require('mongoose');

const NUTRIENTS = [
  'calories',
  'protein',
  'carbohydrates',
  'total_fat',
  'saturated_fat',
  'trans_fat',
  'sugars',
  'fiber',
  'sodium',
  'cholesterol',
  'iron',
  'calcium',
  'potassium',
  'vitamin_a',
  'vitamin_c',
  'vitamin_d',
  'vitamin_b12',
  'folate'
];

const OPERATORS = [
  'GREATER_THAN',
  'GREATER_THAN_OR_EQUAL',
  'LESS_THAN',
  'LESS_THAN_OR_EQUAL',
  'EQUAL'
];

const SEVERITIES = [
  'INFO',
  'CAUTION',
  'WARNING'
];

const ACTIONS = [
  'LIMIT',
  'PREFER',
  'AVOID',
  'MONITOR'
];

const nutritionalRuleSchema = new mongoose.Schema(
  {

    ruleType: {
      type: String,
      required: true,
      enum: [
        'NUTRIENT_THRESHOLD',
        'FOOD_PROFILE'
      ],
      default: 'NUTRIENT_THRESHOLD'
    },

    conditionCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true
    },

    nutrient: {
      type: String,
      required: true,
      enum: NUTRIENTS,
      trim: true
    },

    operator: {
      type: String,
      required: true,
      enum: OPERATORS
    },

    threshold: {
      type: Number,
      required: true
    },

    unit: {
      type: String,
      required: true,
      trim: true
    },

    basis: {
  type: String,
  required: true,
  enum: [
    'PER_100G',
    'PER_100ML',
    'PER_SERVING',
    'PER_PACKAGE',
    'DAILY'
  ]
},

    severity: {
      type: String,
      required: true,
      enum: SEVERITIES,
      default: 'INFO'
    },

    action: {
      type: String,
      required: true,
      enum: ACTIONS
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    source: {
      name: {
        type: String,
        required: true,
        trim: true
      },

      reference: {
        type: String,
        required: true,
        trim: true
      },

      version: {
        type: String,
        trim: true
      }
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const NutritionalRule = mongoose.model(
  'NutritionalRule',
  nutritionalRuleSchema
);

module.exports = NutritionalRule;

module.exports.options = {
  NUTRIENTS,
  OPERATORS,
  SEVERITIES,
  ACTIONS
};