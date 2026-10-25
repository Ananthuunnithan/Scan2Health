
require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env')
});
const mongoose = require('mongoose');

const NutritionalRule = require('../models/NutritionalRule');
const {
  evaluateDailyNutrientRules
} = require('../services/ruleEngineService');

function getTriggerValue(rule) {
  switch (rule.operator) {
    case 'GREATER_THAN':
      return rule.threshold + 1;

    case 'GREATER_THAN_OR_EQUAL':
      return rule.threshold;

    case 'LESS_THAN':
      return rule.threshold - 1;

    case 'LESS_THAN_OR_EQUAL':
      return rule.threshold;

    case 'EQUAL':
      return rule.threshold;

    default:
      throw new Error(`Unsupported operator: ${rule.operator}`);
  }
}

async function runTest() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected.');

  try {
    const rules = await NutritionalRule.find({
      ruleType: 'NUTRIENT_THRESHOLD',
      conditionCode: { $in: ['HYPERTENSION', 'DIABETES'] },
      basis: 'DAILY',
      active: true,
      nutrient: { $in: ['sodium', 'fiber'] }
    }).lean();

    console.log(
      'Relevant daily rules:',
      rules.map((rule) => ({
        conditionCode: rule.conditionCode,
        nutrient: rule.nutrient,
        operator: rule.operator,
        threshold: rule.threshold,
        unit: rule.unit,
        severity: rule.severity,
        action: rule.action
      }))
    );

    const sodiumRule = rules.find(
      (rule) =>
        rule.conditionCode === 'HYPERTENSION' &&
        rule.nutrient === 'sodium'
    );

    const fiberRule = rules.find(
      (rule) =>
        rule.conditionCode === 'DIABETES' &&
        rule.nutrient === 'fiber'
    );

    if (!sodiumRule || !fiberRule) {
      throw new Error(
        'Expected active DAILY sodium and fiber rules were not found. ' +
        'Inspect the printed rules before changing anything.'
      );
    }

    const testCases = [
      {
        name: 'Daily sodium',
        rule: sodiumRule,
        conditionCode: 'HYPERTENSION'
      },
      {
        name: 'Daily fiber',
        rule: fiberRule,
        conditionCode: 'DIABETES'
      }
    ];

    for (const testCase of testCases) {
      const { rule, conditionCode, name } = testCase;
      const value = getTriggerValue(rule);

      const findings = await evaluateDailyNutrientRules({
        conditionCodes: [conditionCode],
        dailyNutrition: {
          [rule.nutrient]: value
        }
      });

      const matchingFinding = findings.find(
        (finding) =>
          finding.nutrient === rule.nutrient &&
          finding.conditionCode === conditionCode
      );

      console.log(`\n${name} test:`);
      console.log('Test value:', value, rule.unit);
      console.log('Expected threshold:', rule.threshold, rule.unit);
      console.log('Findings:', findings);

      if (!matchingFinding) {
        throw new Error(`${name} rule did not trigger as expected.`);
      }

      if (
        matchingFinding.severity !== rule.severity ||
        matchingFinding.action !== rule.action
      ) {
        throw new Error(`${name} finding does not preserve rule metadata.`);
      }

      console.log(`${name} test passed.`);
    }

    console.log('\nDaily rule evaluation tests passed.');
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

runTest().catch((error) => {
  console.error('Daily rule evaluation test failed:', error.message);
  process.exitCode = 1;
});
