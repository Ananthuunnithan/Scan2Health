
function formatNutrient(nutrient) {
  if (!nutrient || typeof nutrient !== 'string') {
    return 'nutrition';
  }

  return nutrient
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


function generateAllergyRecommendation(finding) {
  return {
    type: 'ALLERGY',
    priority: 'CRITICAL',
    action: 'AVOID',
    nutrient: null,
    message:
      `Avoid this product. It contains ${finding.allergy.toLowerCase()}, ` +
      `which matches an allergy in your profile.`,
    reason: finding.message
  };
}


function generateNutritionRecommendation({
  finding,
  dailyFinding
}) {
  const nutrient = formatNutrient(finding.nutrient);
  const value = finding.value;
  const threshold = finding.threshold;
  const unit = finding.unit;

  let actionMessage;

  if (finding.action === 'LIMIT') {
    actionMessage =
      `Consider limiting this product because its ${nutrient.toLowerCase()} ` +
      `content may be difficult to fit within your nutrition target.`;
  } else if (finding.action === 'AVOID') {
    actionMessage =
      `Avoid this product because its ${nutrient.toLowerCase()} ` +
      `content conflicts with your current nutrition requirements.`;
  } else if (finding.action === 'PREFER') {
    actionMessage =
      `This product may be a preferable choice for your current nutrition needs.`;
  } else {
    actionMessage =
      `Pay attention to the ${nutrient.toLowerCase()} content of this product.`;
  }

  let contextMessage = '';

  if (dailyFinding) {
    const dailyNutrient = formatNutrient(dailyFinding.nutrient);

    if (
      dailyFinding.operator === 'GREATER_THAN' ||
      dailyFinding.operator === 'GREATER_THAN_OR_EQUAL'
    ) {
      contextMessage =
        ` Your ${dailyNutrient.toLowerCase()} intake is already ` +
        `above the daily threshold of ${dailyFinding.threshold} ` +
        `${dailyFinding.unit}.`;
    } else if (dailyFinding.operator === 'LESS_THAN') {
      contextMessage =
        ` Your current daily ${dailyNutrient.toLowerCase()} intake ` +
        `is below the recommended level of ${dailyFinding.threshold} ` +
        `${dailyFinding.unit}.`;
    }
  }

  return {
    type: 'NUTRITION',
    priority: finding.severity || 'INFO',
    action: finding.action || 'INFO',
    nutrient: finding.nutrient,
    productValue: value,
    productThreshold: threshold,
    unit,
    message: actionMessage + contextMessage,
    reason: finding.message || null
  };
}


function generateNoWarningRecommendation() {
  return {
    type: 'GENERAL',
    priority: 'INFO',
    action: 'PREFER',
    nutrient: null,
    message:
      'This product does not currently trigger an active allergy ' +
      'or nutrition rule for your profile.',
    reason: null
  };
}


function generateRecommendations({
  assessment,
  dailyNutrition
}) {
  if (!assessment) {
    throw new Error('Product assessment is required.');
  }

  const allergyFindings = Array.isArray(assessment.allergyFindings)
    ? assessment.allergyFindings
    : [];

  const nutritionFindings = Array.isArray(assessment.nutritionFindings)
    ? assessment.nutritionFindings
    : [];

  const dailyFindings =
    Array.isArray(dailyNutrition?.nutritionFindings)
      ? dailyNutrition.nutritionFindings
      : [];

  const recommendations = [];

  for (const finding of allergyFindings) {
    recommendations.push(
      generateAllergyRecommendation(finding)
    );
  }

  for (const finding of nutritionFindings) {
    const dailyFinding = dailyFindings.find(
      (item) =>
        item.nutrient === finding.nutrient
    );

    recommendations.push(
      generateNutritionRecommendation({
        finding,
        dailyFinding
      })
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      generateNoWarningRecommendation()
    );
  }

  return recommendations;
}


module.exports = {
  generateRecommendations
};