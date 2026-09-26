const mongoose = require("mongoose");

const healthConditionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    nutritionFocus: {
      type: [String],
      default: [],
    },

    nutrientsToLimit: {
      type: [String],
      default: [],
    },

    nutrientsToMonitor: {
      type: [String],
      default: [],
    },

    nutrientsToPrefer: {
      type: [String],
      default: [],
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "HealthCondition",
  healthConditionSchema
);