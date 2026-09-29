/*
 * Evaluate user allergies against product food components.
 *
 * Important:
 * - Allergy matching is separate from nutrient rules.
 * - Matching is case-insensitive through normalization.
 * - "Other" is not evaluated because its actual allergen is unknown.
 * - No allergy is inferred from missing ingredient/component data.
 */

const ALLERGY_COMPONENT_MAP = {
  Peanut: 'peanut',
  Milk: 'milk',
  Egg: 'egg',
  Soy: 'soy',
  Gluten: 'gluten'
};


/*
 * Normalize a user's allergy value into
 * the canonical food-component vocabulary.
 */
function normalizeAllergy(allergy) {
  if (!allergy || typeof allergy !== 'string') {
    return null;
  }

  return ALLERGY_COMPONENT_MAP[allergy.trim()] || null;
}


/*
 * Evaluate the user's allergies against
 * the food components detected in a product.
 */
function evaluateAllergyRules({
  allergies,
  product
}) {
  const findings = [];

  if (!Array.isArray(allergies) || allergies.length === 0) {
    return findings;
  }

  const productComponents = Array.isArray(product?.foodComponents)
    ? product.foodComponents
    : [];

  if (productComponents.length === 0) {
    return findings;
  }

  const normalizedProductComponents = productComponents
    .map(component =>
      typeof component === 'string'
        ? component.trim().toLowerCase()
        : null
    )
    .filter(Boolean);

  for (const allergy of allergies) {
    const component = normalizeAllergy(allergy);

    /*
     * "Other" or unknown allergy values cannot be
     * automatically matched safely.
     */
    if (!component) {
      continue;
    }

    if (!normalizedProductComponents.includes(component)) {
      continue;
    }

    findings.push({
      type: 'ALLERGY',
      allergy,
      component,
      severity: 'CRITICAL',
      action: 'AVOID',
      message: `Product contains ${allergy.toLowerCase()}.`
    });
  }

  return findings;
}


module.exports = {
  evaluateAllergyRules
};