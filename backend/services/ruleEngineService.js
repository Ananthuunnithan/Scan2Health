const NutritionalRule = require('../models/NutritionalRule');

/*
 * Compare a product nutrient value against a rule.
 */
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


/*
 * Evaluate nutrient-based rules for a product.
 *
 * Important:
 * Missing nutrient data is NOT treated as zero.
 */
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
    /*
     * Currently we only evaluate PER_100G,
     * PER_100ML, PER_SERVING and PER_PACKAGE
     * when the product has the same basis.
     *
     * DAILY rules will be handled separately because
     * they require daily intake/activity information.
     */
    if (rule.basis === 'DAILY') {
      continue;
    }

    const nutrientValue = product.nutrition?.[rule.nutrient];

    /*
     * Missing data must remain missing.
     */
    if (
      nutrientValue === undefined ||
      nutrientValue === null ||
      Number.isNaN(Number(nutrientValue))
    ) {
      continue;
    }

    /*
     * The product and rule must use the same basis.
     */
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


module.exports = {
  evaluateNutrientRules
};