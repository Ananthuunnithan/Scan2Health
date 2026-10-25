
const {
  calculateConsumedNutrition,
} = require('../services/nutritionConsumptionService');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function expectError(callback, expectedText) {
  try {
    callback();
  } catch (error) {
    assert(
      error.message.includes(expectedText),
      `Unexpected error: ${error.message}`,
    );
    return;
  }

  throw new Error(`Expected an error containing: ${expectedText}`);
}

function runTests() {
  // Test 1: Missing serving size for PER_100G.
  expectError(
    () => calculateConsumedNutrition({
      nutritionBasis: 'PER_100G',
      nutrition: { calories: 400 },
      serving: {},
    }, 1),
    'serving size is missing',
  );

  // Test 2: Missing serving size for PER_100ML.
  expectError(
    () => calculateConsumedNutrition({
      nutritionBasis: 'PER_100ML',
      nutrition: { calories: 50 },
      serving: {},
    }, 1),
    'serving size is missing',
  );

  // Test 3: Missing nutrients remain unknown.
  const missingNutrition = calculateConsumedNutrition({
    nutritionBasis: 'PER_SERVING',
    nutrition: {
      calories: 200,
      protein: null,
    },
  }, 1);

  assert(missingNutrition.calories === 200, 'Calories calculation failed.');
  assert(missingNutrition.protein === null, 'Missing protein was not preserved.');

  // Test 4: Valid serving size calculates correctly.
  const validNutrition = calculateConsumedNutrition({
    nutritionBasis: 'PER_100G',
    nutrition: {
      calories: 400,
      protein: 10,
    },
    serving: {
      size: 50,
      unit: 'g',
    },
  }, 2);

  assert(validNutrition.calories === 400, 'Expected 400 kcal for two 50 g servings.');
  assert(validNutrition.protein === 10, 'Expected 10 g protein for two 50 g servings.');

  // Test 5: Fat and vitamin fields map to the ConsumedFood schema.
  const mappedNutrition = calculateConsumedNutrition({
    nutritionBasis: 'PER_SERVING',
    nutrition: {
      totalFat: 12,
      saturatedFat: 4,
      transFat: 0.5,
      vitaminA: 100,
      vitaminC: 20,
      vitaminD: 5,
      vitaminB12: 2,
      folate: 40,
    },
  }, 2);

  assert(mappedNutrition.total_fat === 24, 'totalFat -> total_fat mapping failed.');
  assert(mappedNutrition.saturated_fat === 8, 'saturatedFat -> saturated_fat mapping failed.');
  assert(mappedNutrition.trans_fat === 1, 'transFat -> trans_fat mapping failed.');
  assert(mappedNutrition.vitamin_a === 200, 'vitaminA -> vitamin_a mapping failed.');
  assert(mappedNutrition.vitamin_c === 40, 'vitaminC -> vitamin_c mapping failed.');
  assert(mappedNutrition.vitamin_d === 10, 'vitaminD -> vitamin_d mapping failed.');
  assert(mappedNutrition.vitamin_b12 === 4, 'vitaminB12 -> vitamin_b12 mapping failed.');
  assert(mappedNutrition.folate === 80, 'Folate calculation failed.');

  // Test 6: Missing mapped nutrients remain null.
  const missingMappedNutrition = calculateConsumedNutrition({
    nutritionBasis: 'PER_SERVING',
    nutrition: {
      totalFat: null,
      vitaminA: undefined,
    },
  }, 1);

  assert(missingMappedNutrition.total_fat === null, 'Missing total fat was not preserved.');
  assert(missingMappedNutrition.vitamin_a === null, 'Missing vitamin A was not preserved.');

  // Test 7: Invalid quantity is rejected.
  expectError(
    () => calculateConsumedNutrition({
      nutritionBasis: 'PER_SERVING',
      nutrition: { calories: 200 },
    }, 0),
    'Quantity must be greater than zero',
  );

  console.log('All nutrition-consumption tests passed.');
}

try {
  runTests();
} catch (error) {
  console.error('Nutrition-consumption test failed:', error.message);
  process.exitCode = 1;
}
