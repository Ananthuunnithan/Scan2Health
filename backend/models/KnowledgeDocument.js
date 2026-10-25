const mongoose = require('mongoose');

const CATEGORIES = [
  'NUTRIENT',
  'HEALTH_CONDITION',
  'DIETARY_GUIDANCE',
  'FOOD_GUIDANCE'
];

const knowledgeDocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    topic: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },

    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
      index: true
    },

    conditionCodes: {
      type: [String],
      default: []
    },

    nutrients: {
      type: [String],
      default: []
    },

    content: {
      type: String,
      required: true,
      trim: true
    },

    keywords: {
      type: [String],
      default: []
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
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const KnowledgeDocument = mongoose.model(
  'KnowledgeDocument',
  knowledgeDocumentSchema
);

module.exports = KnowledgeDocument;