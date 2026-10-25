const {
  evaluateDailyNutrientRules
} = require('./ruleEngineService');


function determineDailyStatus({
  nutritionFindings
}) {
  if (nutritionFindings.length === 0) {
    return 'NO_WARNING';
  }

  const hasCriticalOrWarning = nutritionFindings.some(
    (finding) =>
      finding.severity === 'CRITICAL' ||
      finding.severity === 'WARNING'
  );

  if (hasCriticalOrWarning) {
    return 'CAUTION';
  }

  return 'INFO';
}

function generateDailySummary({ nutritionFindings, overallStatus }) {
  if (overallStatus === 'CAUTION') {
    return 'Your daily nutrition intake triggered one or more nutrition rules based on your health profile.';
  }

  if (overallStatus === 'INFO') {
    return 'Your daily nutrition intake has one or more areas that may need attention.';
  }

  return 'No active daily nutrition rule was triggered.';
}

function generatePrimaryInsight(nutritionFindings) {
  if (!Array.isArray(nutritionFindings) || nutritionFindings.length === 0) {
    return {
      nutrient: null,
      value: null,
      threshold: null,
      unit: null,
      severity: null,
      message: 'No nutrition concern was detected for today.'
    };
  }

  const severityPriority = {
    CRITICAL: 3,
    WARNING: 2,
    INFO: 1
  };

  const sortedFindings = [...nutritionFindings].sort((a, b) => {
    const priorityA = severityPriority[a.severity] || 0;
    const priorityB = severityPriority[b.severity] || 0;

    return priorityB - priorityA;
  });

  const primaryFinding = sortedFindings[0];

  const nutrient = primaryFinding.nutrient;
  const value = primaryFinding.value;
  const threshold = primaryFinding.threshold;
  const unit = primaryFinding.unit;
  const severity = primaryFinding.severity;

  const formattedNutrient =
    nutrient.charAt(0).toUpperCase() + nutrient.slice(1);

  let message;

  if (primaryFinding.operator === 'LESS_THAN') {
    message =
      `Your ${formattedNutrient.toLowerCase()} intake is low today. ` +
      `You have consumed about ${Number(value.toFixed(1))} ${unit}, ` +
      `while the recommended daily level is ${threshold} ${unit}.`;
  } else if (
    primaryFinding.operator === 'GREATER_THAN' ||
    primaryFinding.operator === 'GREATER_THAN_OR_EQUAL'
  ) {
    message =
      `Your ${formattedNutrient.toLowerCase()} intake is high today. ` +
      `You have consumed about ${Number(value.toFixed(1))} ${unit}, ` +
      `compared with the daily limit of ${threshold} ${unit}.`;
  } else {
    message =
      primaryFinding.message ||
      `Your ${formattedNutrient.toLowerCase()} intake needs attention today.`;
  }

  return {
    nutrient,
    value,
    threshold,
    unit,
    severity,
    message
  };
}

async function evaluateDailyNutritionForUser({
  profile,
  dailyNutrition
}) {
  if (!profile) {
    throw new Error('User profile is required.');
  }

  if (!dailyNutrition) {
    throw new Error('Daily nutrition data is required.');
  }


  const conditionCodes = Array.isArray(profile.healthConditions)
    ? profile.healthConditions
    : [];

    const nutritionFindings =
    await evaluateDailyNutrientRules({
        conditionCodes,
        dailyNutrition: dailyNutrition.totals
    });


  const overallStatus = determineDailyStatus({
    nutritionFindings
  });


  const summary = generateDailySummary({
    nutritionFindings,
    overallStatus
  });


const primaryInsight = generatePrimaryInsight(nutritionFindings);

  return {
    overallStatus,
    summary,
    primaryInsight,
    date: dailyNutrition.date,
    timezone: dailyNutrition.timezone,
    nutrition: dailyNutrition.totals,
    foodCount: dailyNutrition.foodCount,
    nutritionFindings
  };
}


module.exports = {
  evaluateDailyNutritionForUser,
  generatePrimaryInsight
};