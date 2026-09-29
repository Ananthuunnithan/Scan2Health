const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    barcode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
      default: '',
    },

    category: {
      type: String,
      trim: true,
      default: '',
    },

    serving: {
      size: {
        type: Number,
        default: null,
      },
      unit: {
        type: String,
        enum: ['g', 'ml', null],
        default: null,
      },
      servingsPerPackage: {
        type: Number,
        default: null,
      },
    },

    nutrition: {
      calories: {
        type: Number,
        default: null,
      },
      protein: {
        type: Number,
        default: null,
      },
      carbohydrates: {
        type: Number,
        default: null,
      },
      totalFat: {
        type: Number,
        default: null,
      },
      saturatedFat: {
        type: Number,
        default: null,
      },
      transFat: {
        type: Number,
        default: null,
      },
      sugars: {
        type: Number,
        default: null,
      },
      fiber: {
        type: Number,
        default: null,
      },
      sodium: {
        type: Number,
        default: null,
      },
      cholesterol: {
        type: Number,
        default: null,
      },
      iron: {
        type: Number,
        default: null,
      },
      calcium: {
        type: Number,
        default: null,
      },
      potassium: {
        type: Number,
        default: null,
      },
      vitaminA: {
        type: Number,
        default: null,
      },
      vitaminC: {
        type: Number,
        default: null,
      },
      vitaminD: {
        type: Number,
        default: null,
      },
      vitaminB12: {
        type: Number,
        default: null,
      },
      folate: {
        type: Number,
        default: null,
      },
    },

    nutritionBasis: {
      type: String,
      enum: ['PER_100G', 'PER_100ML', 'PER_SERVING'],
      default: 'PER_100G',
    },

    ingredients: {
      text: { type: String, default: '', trim: true },
      items: { type: [String], default: [] },
    },

    foodComponents: {
      type: [String],
      enum: [
        'peanut',
        'soy',
        'milk',
        'egg',
        'lactose',
        'gluten',
      ],
      default: [],
    },

    allergens: {
      type: [String],
      default: [],
    },

    source: {
      type: String,
      enum: [
        'OPEN_FOOD_FACTS',
        'OCR',
        'MANUAL',
        'OTHER',
      ],
      default: 'MANUAL',
    },

    sourceProductId: {
      type: String,
      default: '',
      trim: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Product', productSchema);