
const {
  validateSources
} = require('../services/sourceValidationService');

const ragContext = {
  knowledge: [
    {
      nutrient: 'sodium',
      conditionCode: 'HYPERTENSION',
      documents: [
        {
          source: {
            name: 'WHO',
            reference: 'Sodium reduction'
          }
        }
      ]
    }
  ]
};

const aiSources = [
  { name: 'WHO', reference: 'Sodium reduction' },
  {
    name: 'Unknown Organization',
    reference: 'Unsupported nutrition report'
  },
  { name: 'WHO', reference: 'Unrelated report' }
];

const validatedSources = validateSources(ragContext, aiSources);

console.log('AI sources:', aiSources.length);
console.log(
  'Validated sources:',
  JSON.stringify(validatedSources, null, 2)
);

if (
  validatedSources.length !== 1 ||
  validatedSources[0].name !== 'WHO' ||
  validatedSources[0].reference !== 'Sodium reduction'
) {
  throw new Error('Source validation test failed.');
}

// Also verify that malformed input is handled safely.
if (validateSources(ragContext, null).length !== 0) {
  throw new Error('Invalid source input test failed.');
}

console.log('Source validation tests passed.');
