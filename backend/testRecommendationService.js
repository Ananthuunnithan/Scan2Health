const { generateRecommendations } = require('./services/recommendationService');

async function test() {
  const assessment = {
    overallStatus: 'NO_WARNING',

    allergyFindings: [],

    nutritionFindings: []
  };

  const recommendations = generateRecommendations({
    assessment,
    dailyNutrition: {
      nutritionFindings: []
    }
  });

  console.log(JSON.stringify(recommendations, null, 2));
}

test().catch(error => {
  console.error('Recommendation test failed:', error);
});