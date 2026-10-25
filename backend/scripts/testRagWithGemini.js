require('dotenv').config();
const mongoose = require('mongoose');

const {
  buildRagContext
} = require('../services/ragContextService');

const {
  generateExplanation
} = require('../services/geminiExplanationService');

async function runTest() {
  // Synthetic assessment used to test retrieval and explanation together.
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected.');
  const ragContext = await buildRagContext({
    assessment: {
      product: {
        productName: 'Sample food product',
        nutritionBasis: 'PER_100G'
      },
      overallStatus: 'CAUTION',
      summary: 'A daily sodium threshold was triggered.',
      nutritionFindings: [],
      allergyFindings: []
    },
    dailyAssessment: {
      nutritionFindings: [
        {
          conditionCode: 'HYPERTENSION',
          nutrient: 'sodium',
          value: 2100,
          threshold: 2000,
          unit: 'mg',
          basis: 'DAILY',
          severity: 'WARNING',
          action: 'LIMIT',
          message: 'Daily sodium intake is at or above the configured threshold.'
        }
      ]
    }
  });

    console.log(
    'Retrieved knowledge documents:',
    JSON.stringify(ragContext.knowledge, null, 2)
    );

  console.log('Retrieved knowledge groups:', ragContext.knowledge.length);

  const explanation = await generateExplanation(ragContext);

  console.log('\n========== RAG + GEMINI ==========\n');
  console.log(JSON.stringify(explanation, null, 2));
  console.log('\n==================================\n');
}

runTest()
  .catch((error) => {
    console.error('RAG + Gemini test failed:', error.message);
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  });