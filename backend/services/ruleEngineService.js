const NutritionalRule = require('../models/NutritionalRule');

function compareValue(value, operator, threshold) {
  switch (operator) {
    case 'GREATER_THAN':
      return value > threshold;

    case 'GREATER_THAN_OR_EQUAL':
      return value >= threshold;

    case 'LESS_THAN':
      return value < threshold;

    case 'LESS_THAN_OR_EQUAL':
      return value <= threshold;

    case 'EQUAL':
      return value === threshold;

    default:
      return false;
  }
}


function isValidNutrientValue(value) {
  if (typeof value !== 'number' && typeof value !== 'string') {
    return false;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return false;
  }

  return Number.isFinite(Number(value));
}



async function evaluateNutrientRules({
  conditionCodes,
  product
}) {
  const findings = [];

  if (!Array.isArray(conditionCodes) || conditionCodes.length === 0) {
    return findings;
  }

  const rules = await NutritionalRule.find({
    ruleType: 'NUTRIENT_THRESHOLD',
    conditionCode: {
      $in: conditionCodes
    },
    active: true
  })
    .sort({
      conditionCode: 1,
      nutrient: 1
    })
    .lean();

  for (const rule of rules) {

    if (rule.basis === 'DAILY') {
      continue;
    }

    const nutrientValue = product.nutrition?.[rule.nutrient];

    if (!isValidNutrientValue(nutrientValue)) {
      continue;
    }
  
    if (product.nutritionBasis !== rule.basis) {
      continue;
    }

    const triggered = compareValue(
      Number(nutrientValue),
      rule.operator,
      rule.threshold
    );

    if (!triggered) {
      continue;
    }

    findings.push({
      type: 'NUTRIENT_THRESHOLD',
      conditionCode: rule.conditionCode,
      nutrient: rule.nutrient,
      value: Number(nutrientValue),
      operator: rule.operator,
      threshold: rule.threshold,
      unit: rule.unit,
      basis: rule.basis,
      severity: rule.severity,
      action: rule.action,
      message: rule.message,
      source: rule.source
    });
  }

  return findings;
}

/*
 * Evaluate DAILY nutrient rules against
 * the user's aggregated daily nutrition.
 *
 * Important:
 * DAILY rules must only be evaluated against
 * aggregated daily intake, never against a
 * single product's nutrition values.
 *
 * Missing nutrient data is NOT treated as zero.
 */
async function evaluateDailyNutrientRules({
  conditionCodes,
  dailyNutrition
}) {
  const findings = [];

  if (!Array.isArray(conditionCodes) || conditionCodes.length === 0) {
    return findings;
  }

  if (!dailyNutrition || typeof dailyNutrition !== 'object') {
    return findings;
  }

  const rules = await NutritionalRule.find({
    ruleType: 'NUTRIENT_THRESHOLD',
    conditionCode: {
      $in: conditionCodes
    },
    basis: 'DAILY',
    active: true
  })
    .sort({
      conditionCode: 1,
      nutrient: 1
    })
    .lean();

  for (const rule of rules) {
    const nutrientValue = dailyNutrition[rule.nutrient];

    /*
     * Missing data must remain missing.
     *
     * Example:
     * fiber = null
     *
     * We cannot conclude that fiber = 0.
     */
    if (!isValidNutrientValue(nutrientValue)) {
      continue;
    }

    const triggered = compareValue(
      Number(nutrientValue),
      rule.operator,
      rule.threshold
    );

    if (!triggered) {
      continue;
    }

    findings.push({
      type: 'NUTRIENT_THRESHOLD',
      conditionCode: rule.conditionCode,
      nutrient: rule.nutrient,
      value: Number(nutrientValue),
      operator: rule.operator,
      threshold: rule.threshold,
      unit: rule.unit,
      basis: rule.basis,
      severity: rule.severity,
      action: rule.action,
      message: rule.message,
      source: rule.source
    });
  }

  return findings;
}


module.exports = {
  evaluateNutrientRules,
  evaluateDailyNutrientRules
};