require('dotenv').config();

const {
  generateExplanation
} = require('../services/geminiExplanationService');

async function runTest() {
  try {
    const ragContext = {
      product: {
        productName: 'Thai peanut noodle kit',
        nutritionBasis: 'PER_100G'
      },
      overallStatus: 'AVOID',
      summary: 'This product contains a component that matches an allergy in your profile.',
      findings: [],
      allergyFindings: [
        {
          type: 'ALLERGY',
          allergy: 'Peanut',
          component: 'peanut',
          severity: 'CRITICAL',
          action: 'AVOID',
          message: 'Product contains peanut.'
        }
      ],
      knowledge: []
    };

    const explanation = await generateExplanation(ragContext);

    console.log('\n========== GEMINI EXPLANATION ==========\n');
    console.log(JSON.stringify(explanation, null, 2));
    console.log('\n========================================\n');
  } catch (error) {
    console.error('Gemini explanation test failed:', error.message);
  }
}

runTest();