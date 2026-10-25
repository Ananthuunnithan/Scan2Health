const mongoose = require("mongoose");

const consumedFoodSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    barcode: {
      type: String,
      required: true,
    },

    consumedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },

    servingConsumed: {
      value: {
        type: Number,
        min: 0,
      },
      unit: {
        type: String,
      },
    },

    nutritionConsumed: {
      calories: Number,
      protein: Number,
      carbohydrates: Number,
      total_fat: Number,
      saturated_fat: Number,
      trans_fat: Number,
      sugars: Number,
      fiber: Number,
      sodium: Number,
      cholesterol: Number,
      iron: Number,
      calcium: Number,
      potassium: Number,
      vitamin_a: Number,
      vitamin_c: Number,
      vitamin_d: Number,
      vitamin_b12: Number,
      folate: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ConsumedFood", consumedFoodSchema);