
const Product = require('../models/Product');
const ConsumedFood = require('../models/ConsumedFood');
const {
  calculateConsumedNutrition,
} = require('../services/nutritionConsumptionService');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runTest() {
  const product = new Product({
    barcode: 'TEST-NUTRITION-MAPPING',
    productName: 'Nutrition mapping test product',
    nutritionBasis: 'PER_100G',
    serving: { size: 52, unit: 'g' },
    nutrition: {
      calories: 385,
      totalFat: 7.69,
      saturatedFat: 1.92,
      transFat: 0,
      vitaminA: 0.0001155,
      vitaminC: 0,
    },
  });

  const nutritionConsumed = calculateConsumedNutrition(
    product.toObject(),
    1.5,
  );

  const record = new ConsumedFood({
    userId: 'test-user',
    productId: product._id,
    barcode: product.barcode,
    quantity: 1.5,
    servingConsumed: { value: 52, unit: 'g' },
    nutritionConsumed,
  });

  const validationError = record.validateSync();

  assert(!validationError, validationError?.message ?? 'Schema validation failed.');

  const savedNutrition = record.nutritionConsumed.toObject();

    assert(
    Math.abs(savedNutrition.total_fat - 5.9982) < 1e-9,
    `Unexpected total_fat: ${savedNutrition.total_fat}`
    );
  assert(
    Math.abs(savedNutrition.saturated_fat - 1.4976) < 1e-9,
    `Unexpected saturated_fat: ${savedNutrition.saturated_fat}`,
  );
  assert(
    savedNutrition.trans_fat === 0,
    'Zero trans fat was not preserved.',
  );
    assert(
    Math.abs(savedNutrition.vitamin_a - 0.00009009) < 1e-9,
    `Unexpected vitamin_a: ${savedNutrition.vitamin_a}`
    );
  assert(
    savedNutrition.vitamin_c === 0,
    'Zero vitamin C was not preserved.',
  );

  console.log('Mongoose nutrition field-persistence tests passed.');
  console.table({
    total_fat: savedNutrition.total_fat,
    saturated_fat: savedNutrition.saturated_fat,
    trans_fat: savedNutrition.trans_fat,
    vitamin_a: savedNutrition.vitamin_a,
    vitamin_c: savedNutrition.vitamin_c,
  });
}

try {
  runTest();
} catch (error) {
  console.error('Nutrition field-persistence test failed:', error.message);
  process.exitCode = 1;
}
