const { buildKnowledgeContext } = require('./knowledgeContextService');

async function buildRagContext({ assessment, dailyAssessment }) {
  if (!assessment) {
    throw new Error('Assessment is required.');
  }

  const findings = [];

  // Collect product-level nutrition findings.
  for (const finding of assessment.nutritionFindings || []) {
    findings.push({
      scope: 'PRODUCT',
      conditionCode: finding.conditionCode,
      nutrient: finding.nutrient,
      value: finding.value,
      threshold: finding.threshold,
      unit: finding.unit,
      basis: finding.basis,
      severity: finding.severity,
      action: finding.action,
      message: finding.message
    });
  }

  // Collect allergy findings without treating them as nutrient findings.
  const allergyFindings = (assessment.allergyFindings || []).map(
    (finding) => ({
      ...finding
    })
  );

  // Collect daily nutrition findings separately.
  for (const finding of dailyAssessment?.nutritionFindings || []) {
    findings.push({
      scope: 'DAILY',
      conditionCode: finding.conditionCode,
      nutrient: finding.nutrient,
      value: finding.value,
      threshold: finding.threshold,
      unit: finding.unit,
      basis: finding.basis,
      severity: finding.severity,
      action: finding.action,
      message: finding.message
    });
  }

  // Retrieve supporting knowledge for each distinct nutrient-condition pair.
  const pairs = new Map();

  for (const finding of findings) {
    if (!finding.nutrient) continue;

    const key = `${finding.nutrient}:${finding.conditionCode || ''}`;

    if (!pairs.has(key)) {
      pairs.set(key, {
        nutrient: finding.nutrient,
        conditionCode: finding.conditionCode
      });
    }
  }

  const knowledgeResults = await Promise.all(
    Array.from(pairs.values()).map(async ({ nutrient, conditionCode }) => ({
      nutrient,
      conditionCode,
      documents: await buildKnowledgeContext({
        nutrient,
        conditionCode
      })
    }))
  );

  return {
    product: assessment.product,
    overallStatus: assessment.overallStatus,
    summary: assessment.summary,
    findings,
    allergyFindings,
    knowledge: knowledgeResults
  };
}

module.exports = {
  buildRagContext
};