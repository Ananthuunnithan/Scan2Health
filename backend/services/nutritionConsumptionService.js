
const NUTRITION_FIELDS = [
  ['calories', 'calories'],
  ['protein', 'protein'],
  ['carbohydrates', 'carbohydrates'],
  ['totalFat', 'total_fat'],
  ['saturatedFat', 'saturated_fat'],
  ['transFat', 'trans_fat'],
  ['sugars', 'sugars'],
  ['fiber', 'fiber'],
  ['sodium', 'sodium'],
  ['cholesterol', 'cholesterol'],
  ['iron', 'iron'],
  ['calcium', 'calcium'],
  ['potassium', 'potassium'],
  ['vitaminA', 'vitamin_a'],
  ['vitaminC', 'vitamin_c'],
  ['vitaminD', 'vitamin_d'],
  ['vitaminB12', 'vitamin_b12'],
  ['folate', 'folate'],
];

function resolveServingConsumed(
  product,
  quantity,
  consumedAmount,
  consumedUnit
) {
  if (!product) {
    throw new Error('Product is required.');
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('Quantity must be greater than zero.');
  }

  const basis = product.nutritionBasis;

  if (basis === 'PER_100G' || basis === 'PER_100ML') {
    const expectedUnit = basis === 'PER_100G' ? 'g' : 'ml';

    if (
      consumedAmount !== null && consumedAmount !== undefined ||
      consumedUnit !== null && consumedUnit !== undefined
    ) {
      if (
        !Number.isFinite(consumedAmount) ||
        consumedAmount <= 0
      ) {
        throw new Error('Consumed amount must be greater than zero.');
      }

      if (
        typeof consumedUnit !== 'string' ||
        consumedUnit.trim().toLowerCase() !== expectedUnit
      ) {
        throw new Error(
          `${basis} products require consumed amounts in ${expectedUnit}.`
        );
      }

      return {
        value: consumedAmount,
        unit: expectedUnit,
      };
    }

    const servingSize = product.serving?.size;
    const servingUnit = product.serving?.unit;

    if (!Number.isFinite(servingSize) || servingSize <= 0) {
      throw new Error(
        `A consumed amount in ${expectedUnit} is required because the product serving size is missing.`
      );
    }

    if (
      typeof servingUnit !== 'string' ||
      servingUnit.trim().toLowerCase() !== expectedUnit
    ) {
      throw new Error(
        `${basis} products require serving sizes in ${expectedUnit}.`
      );
    }

    return {
      value: servingSize * quantity,
      unit: expectedUnit,
    };
  }

  if (basis === 'PER_SERVING') {
    if (
      consumedAmount !== null && consumedAmount !== undefined ||
      consumedUnit !== null && consumedUnit !== undefined
    ) {
      throw new Error(
        'Custom consumed amounts are only supported for PER_100G and PER_100ML products.'
      );
    }

    const servingSize = product.serving?.size;
    const servingUnit = product.serving?.unit;

    return {
      value:
        Number.isFinite(servingSize) &&
        servingSize > 0 &&
        typeof servingUnit === 'string' &&
        servingUnit.trim().length > 0
          ? servingSize * quantity
          : null,
      unit:
        Number.isFinite(servingSize) &&
        servingSize > 0 &&
        typeof servingUnit === 'string' &&
        servingUnit.trim().length > 0
          ? servingUnit
          : null,
    };
  }

  throw new Error(`Unsupported nutrition basis: ${basis}`);
}

/**
 * Calculates nutrition consumed using the product's
 * nutrition basis and quantity, mapping product fields
 * to the ConsumedFood schema's field names.
 */
function calculateConsumedNutrition(
  product,
  quantity,
  consumedAmount,
  consumedUnit
) {
  const servingConsumed = resolveServingConsumed(
    product,
    quantity,
    consumedAmount,
    consumedUnit
  );
  const nutrition = product.nutrition || {};
  const basis = product.nutritionBasis;
  const factor =
    basis === 'PER_SERVING'
      ? quantity
      : servingConsumed.value / 100;

  if (factor === null || !Number.isFinite(factor)) {
    throw new Error(`Unsupported nutrition basis: ${basis}`);
  }

  const result = {};

  for (const [productField, consumedField] of NUTRITION_FIELDS) {
    const value = nutrition[productField];

    result[consumedField] =
      typeof value !== 'number' || !Number.isFinite(value)
        ? null
        : value * factor;
  }

  return result;
}

module.exports = {
  calculateConsumedNutrition,
  resolveServingConsumed,
};
