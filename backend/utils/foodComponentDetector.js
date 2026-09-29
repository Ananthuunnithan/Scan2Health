const COMPONENT_ALIASES = {
  peanut: [
    'peanut',
    'peanuts',
    'groundnut',
    'groundnuts',
    'peanut oil',
  ],

  soy: [
    'soy',
    'soybean',
    'soybeans',
    'soy protein',
    'soy protein isolate',
    'hydrolyzed soy protein',
    'soy lecithin',
    'soya',
    'soya protein',
  ],

  milk: [
    'milk',
    'milk powder',
    'skimmed milk',
    'skim milk',
    'whole milk',
    'milk solids',
    'milk protein',
    'whey',
    'whey protein',
    'casein',
    'caseinate',
  ],

  egg: [
    'egg',
    'eggs',
    'egg white',
    'egg yolk',
    'albumin',
    'albumen',
  ],

  lactose: [
    'lactose',
  ],

  gluten: [
    'gluten',
    'wheat gluten',
    'barley gluten',
    'rye gluten',
  ],
};


const detectFoodComponents = (ingredients = []) => {
  const detectedComponents = new Set();

  if (!Array.isArray(ingredients)) {
    return [];
  }

  for (const ingredient of ingredients) {
    if (!ingredient) {
      continue;
    }

    const text = String(ingredient).toLowerCase();

    for (const [component, aliases] of Object.entries(
      COMPONENT_ALIASES
    )) {
      for (const alias of aliases) {
        if (text.includes(alias)) {
          detectedComponents.add(component);
          break;
        }
      }
    }
  }

  return [...detectedComponents];
};


module.exports = {
  detectFoodComponents,
};