const {
  evaluateNutrientRules
} = require('./ruleEngineService');

const {
  evaluateAllergyRules
} = require('./allergyEvaluationService');


function determineOverallStatus({
  allergyFindings,
  nutritionFindings
}) {

  if (allergyFindings.length > 0) {
    return 'AVOID';
  }


  if (nutritionFindings.length > 0) {
    return 'CAUTION';
  }

  return 'NO_WARNING';
}


function generateSummary({
  allergyFindings,
  nutritionFindings,
  overallStatus
}) {
  if (overallStatus === 'AVOID') {
    return 'This product contains a component that matches an allergy in your profile.';
  }

  if (overallStatus === 'CAUTION') {
    return 'This product triggered one or more nutrition rules based on your health profile.';
  }

  return 'No active allergy or nutrition rule was triggered for this product.';
}


async function evaluateProductForUser({
  profile,
  product
}) {
  if (!profile) {
    throw new Error('User profile is required.');
  }

  if (!product) {
    throw new Error('Product is required.');
  }

  const conditionCodes = Array.isArray(profile.healthConditions)
    ? profile.healthConditions
    : [];

  const allergies = Array.isArray(profile.diet?.allergies)
    ? profile.diet.allergies
    : [];

    
  const nutritionFindings = await evaluateNutrientRules({
    conditionCodes,
    product
  });


  const allergyFindings = evaluateAllergyRules({
    allergies,
    product
  });


  const overallStatus = determineOverallStatus({
    allergyFindings,
    nutritionFindings
  });


  const summary = generateSummary({
    allergyFindings,
    nutritionFindings,
    overallStatus
  });


  return {
    overallStatus,

    summary,

    product: {
      barcode: product.barcode,
      productName: product.productName,
      brand: product.brand,
      nutritionBasis: product.nutritionBasis,

      nutrition: product.nutrition || {},

      serving: product.serving || {},

      ingredients: product.ingredients || {
        text: '',
        normalized: []
      },

      foodComponents: product.foodComponents || [],

      allergens: product.allergens || []
    },

    allergyFindings,

    nutritionFindings
  };
}


module.exports = {
  evaluateProductForUser
};