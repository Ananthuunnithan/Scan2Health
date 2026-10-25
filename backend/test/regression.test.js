const assert = require('node:assert/strict');
const test = require('node:test');

const {
  calculateConsumedNutrition,
  resolveServingConsumed,
} = require('../services/nutritionConsumptionService');
const {
  evaluateAllergyRules,
} = require('../services/allergyEvaluationService');
const {
  getISTDayRange,
  getDailyNutrition,
} = require('../services/dailyNutritionService');
const ConsumedFood = require('../models/ConsumedFood');
const NutritionalRule = require('../models/NutritionalRule');
const {
  evaluateNutrientRules,
  evaluateDailyNutrientRules,
} = require('../services/ruleEngineService');
const { validateSources } = require('../services/sourceValidationService');
const gemini = require('../services/geminiExplanationService');
const { findOrFetchProductByBarcode } = require('../services/productLookupService');

function product(overrides = {}) {
  return {
    nutritionBasis: 'PER_SERVING',
    serving: { size: 50, unit: 'g' },
    nutrition: { calories: 100, totalFat: 4, vitaminB12: 2 },
    ...overrides,
  };
}

test('consumed nutrition handles every supported basis and schema mapping', () => {
  assert.deepEqual(calculateConsumedNutrition(product(), 2), {
    calories: 200, protein: null, carbohydrates: null, total_fat: 8,
    saturated_fat: null, trans_fat: null, sugars: null, fiber: null,
    sodium: null, cholesterol: null, iron: null, calcium: null, potassium: null,
    vitamin_a: null, vitamin_c: null, vitamin_d: null, vitamin_b12: 4, folate: null,
  });
  assert.equal(calculateConsumedNutrition(product({ nutritionBasis: 'PER_100G' }), 2).calories, 100);
  assert.equal(calculateConsumedNutrition(product({ nutritionBasis: 'PER_100ML', serving: { size: 250, unit: 'ml' } }), 2).calories, 500);
});

test('custom consumed amounts calculate PER_100G nutrition and preserve missing nutrients', () => {
  const item = product({
    nutritionBasis: 'PER_100G',
    serving: { size: null, unit: null },
    nutrition: { calories: 539, sugars: 56, protein: null },
  });

  assert.deepEqual(calculateConsumedNutrition(item, 1, 30, 'g'), {
    calories: 161.7, protein: null, carbohydrates: null, total_fat: null,
    saturated_fat: null, trans_fat: null, sugars: 16.8, fiber: null,
    sodium: null, cholesterol: null, iron: null, calcium: null, potassium: null,
    vitamin_a: null, vitamin_c: null, vitamin_d: null, vitamin_b12: null, folate: null,
  });
  assert.deepEqual(resolveServingConsumed(item, 1, 30, 'g'), {
    value: 30,
    unit: 'g',
  });
});

test('custom consumed amounts calculate PER_100ML nutrition', () => {
  const item = product({
    nutritionBasis: 'PER_100ML',
    serving: { size: null, unit: null },
    nutrition: { calories: 48, protein: 3.2 },
  });

  assert.equal(calculateConsumedNutrition(item, 1, 250, 'ml').calories, 120);
  assert.equal(calculateConsumedNutrition(item, 1, 250, 'ml').protein, 8);
  assert.deepEqual(resolveServingConsumed(item, 1, 250, 'ml'), {
    value: 250,
    unit: 'ml',
  });
});

test('custom amounts reject nonpositive values, incompatible units, and missing amounts', () => {
  const per100g = product({
    nutritionBasis: 'PER_100G',
    serving: { size: null, unit: null },
  });
  assert.throws(() => calculateConsumedNutrition(per100g, 1, 0, 'g'), /greater than zero/);
  assert.throws(() => calculateConsumedNutrition(per100g, 1, -2, 'g'), /greater than zero/);
  assert.throws(() => calculateConsumedNutrition(per100g, 1, Number.NaN, 'g'), /greater than zero/);
  assert.throws(() => calculateConsumedNutrition(per100g, 1, 30, 'ml'), /require consumed amounts in g/);
  assert.throws(() => calculateConsumedNutrition(per100g, 1), /amount in g is required/);
  assert.throws(() => calculateConsumedNutrition(product({
    nutritionBasis: 'PER_100ML',
    serving: { size: null, unit: null },
  }), 1, 30, 'g'), /require consumed amounts in ml/);
  assert.throws(() => calculateConsumedNutrition(product({
    nutritionBasis: 'PER_100G',
    serving: { size: 50, unit: 'ml' },
  }), 1), /require serving sizes in g/);
  assert.throws(() => calculateConsumedNutrition(product({
    nutritionBasis: null,
    serving: { size: null, unit: null },
  }), 1), /Unsupported nutrition basis/);
});

test('products with valid serving sizes retain serving-count calculations', () => {
  const item = product({
    nutritionBasis: 'PER_100G',
    serving: { size: 40, unit: 'g' },
    nutrition: { calories: 250 },
  });

  assert.equal(calculateConsumedNutrition(item, 2).calories, 200);
  assert.deepEqual(resolveServingConsumed(item, 2), {
    value: 80,
    unit: 'g',
  });
});

test('consumed nutrition preserves zero and rejects invalid quantity, serving, and basis', () => {
  assert.equal(calculateConsumedNutrition(product({ nutrition: { calories: 0 } }), 1).calories, 0);
  assert.equal(calculateConsumedNutrition(product({ nutrition: { calories: 'not-a-number' } }), 1).calories, null);
  assert.equal(calculateConsumedNutrition(product({ nutrition: { calories: Infinity } }), 1).calories, null);
  assert.throws(() => calculateConsumedNutrition(product(), 0), /greater than zero/);
  assert.throws(() => calculateConsumedNutrition(product(), Number.NaN), /greater than zero/);
  assert.throws(() => calculateConsumedNutrition(product({ nutritionBasis: 'PER_100G', serving: { size: 0 } }), 1), /serving size/);
  assert.throws(() => calculateConsumedNutrition(product({ nutritionBasis: 'UNKNOWN' }), 1), /Unsupported/);
});

test('allergy matching is normalized, critical, and does not infer unknown allergies', () => {
  assert.deepEqual(evaluateAllergyRules({ allergies: [' Milk ', 'Other'], product: { foodComponents: ['MILK'] } }), [{
    type: 'ALLERGY', allergy: ' Milk ', component: 'milk', severity: 'CRITICAL', action: 'AVOID', message: 'Product contains  milk .',
  }]);
  assert.deepEqual(evaluateAllergyRules({ allergies: ['Other'], product: { foodComponents: ['milk'] } }), []);
});

test('IST day range validates calendar dates and has the correct boundary', () => {
  const range = getISTDayRange('2026-10-20');
  assert.equal(range.start.toISOString(), '2026-10-19T18:30:00.000Z');
  assert.equal(range.end.toISOString(), '2026-10-20T18:30:00.000Z');
  assert.throws(() => getISTDayRange('2026-02-30'), /Invalid calendar date/);
  assert.throws(() => getISTDayRange('20-10-2026'), /YYYY-MM-DD/);
});

test('daily aggregation sums valid values while preserving unknown nutrients', async () => {
  const originalFind = ConsumedFood.find;
  ConsumedFood.find = () => ({ populate() { return this; }, sort() { return this; }, lean: async () => [
    { nutritionConsumed: { calories: 100, protein: null, sodium: Number.NaN } },
    { nutritionConsumed: { calories: 50, protein: 2, sodium: 0 } },
  ] });
  try {
    const daily = await getDailyNutrition('uid', '2026-10-20');
    assert.equal(daily.foodCount, 2);
    assert.equal(daily.totals.calories, 150);
    assert.equal(daily.totals.protein, 2);
    assert.equal(daily.totals.sodium, 0);
    assert.equal(daily.totals.fiber, null);
  } finally {
    ConsumedFood.find = originalFind;
  }
});

test('daily aggregation includes nutrition calculated from a custom amount', async () => {
  const originalFind = ConsumedFood.find;
  const nutritionConsumed = calculateConsumedNutrition(product({
    nutritionBasis: 'PER_100G',
    serving: { size: null, unit: null },
    nutrition: { calories: 300, protein: null },
  }), 1, 30, 'g');
  ConsumedFood.find = () => ({
    populate() { return this; },
    sort() { return this; },
    lean: async () => [{ nutritionConsumed }],
  });
  try {
    const daily = await getDailyNutrition('uid', '2026-10-20');
    assert.equal(daily.foodCount, 1);
    assert.equal(daily.totals.calories, 90);
    assert.equal(daily.totals.protein, null);
  } finally {
    ConsumedFood.find = originalFind;
  }
});

test('product and daily rules evaluate only valid values for their matching basis', async () => {
  const originalFind = NutritionalRule.find;
  NutritionalRule.find = () => ({ sort() { return this; }, lean: async () => [{
    ruleType: 'NUTRIENT_THRESHOLD', conditionCode: 'DIABETES', nutrient: 'sugars',
    basis: 'PER_100G', operator: 'GREATER_THAN_OR_EQUAL', threshold: 10,
    unit: 'g', severity: 'WARNING', action: 'LIMIT', active: true,
  }] });
  try {
    const findings = await evaluateNutrientRules({ conditionCodes: ['DIABETES'], product: product({ nutritionBasis: 'PER_100G', nutrition: { sugars: '10' } }) });
    assert.equal(findings.length, 1);
    assert.equal((await evaluateNutrientRules({ conditionCodes: ['DIABETES'], product: product({ nutritionBasis: 'PER_SERVING', nutrition: { sugars: 30 } }) })).length, 0);
    assert.equal((await evaluateNutrientRules({ conditionCodes: ['DIABETES'], product: product({ nutritionBasis: 'PER_100G', nutrition: { sugars: null } }) })).length, 0);
  } finally { NutritionalRule.find = originalFind; }
  NutritionalRule.find = () => ({ sort() { return this; }, lean: async () => [{
    conditionCode: 'DIABETES', nutrient: 'sodium', basis: 'DAILY', operator: 'GREATER_THAN', threshold: 2000, unit: 'mg', severity: 'CRITICAL', action: 'AVOID', active: true,
  }] });
  try {
    assert.equal((await evaluateDailyNutrientRules({ conditionCodes: ['DIABETES'], dailyNutrition: { sodium: 2100 } })).length, 1);
    assert.equal((await evaluateDailyNutrientRules({ conditionCodes: ['DIABETES'], dailyNutrition: { sodium: null } })).length, 0);
  } finally { NutritionalRule.find = originalFind; }
});

test('source validation rejects fabricated citations', () => {
  const context = { knowledge: [{ documents: [{ source: { name: 'WHO', reference: 'ref-1' } }] }] };
  assert.deepEqual(validateSources(context, [{ name: 'WHO', reference: 'ref-1' }, { name: 'Fake', reference: 'x' }]), [{ name: 'WHO', reference: 'ref-1' }]);
});

test('Gemini does not retry a daily quota exhaustion and validates JSON output', async () => {
  let calls = 0;
  gemini.__setGeminiClientForTests({ interactions: { create: async () => {
    calls += 1;
    throw Object.assign(new Error('Daily quota limit exceeded'), { status: 429 });
  } } });
  await assert.rejects(() => gemini.createGeminiResponse('prompt'), /Daily quota/);
  assert.equal(calls, 1);
  gemini.__setGeminiClientForTests({ interactions: { create: async () => ({ output_text: '{not-json}' }) } });
  await assert.rejects(() => gemini.generateExplanation({ knowledge: [] }), /invalid JSON/);
});

test('empty barcode is rejected without a database or Open Food Facts request', async () => {
  await assert.rejects(() => findOrFetchProductByBarcode('  '), (error) => error.statusCode === 400);
});
