
function validateSources(ragContext, aiSources) {
  if (!Array.isArray(aiSources)) {
    return [];
  }

  const retrievedSources = (ragContext?.knowledge || [])
    .flatMap((group) => group.documents || [])
    .map((document) => document.source)
    .filter(
      (source) =>
        source &&
        typeof source.name === 'string' &&
        typeof source.reference === 'string'
    );

  return aiSources.filter(
    (aiSource) =>
      aiSource &&
      typeof aiSource.name === 'string' &&
      typeof aiSource.reference === 'string' &&
      retrievedSources.some(
        (source) =>
          source.name === aiSource.name &&
          source.reference === aiSource.reference
      )
  );
}

module.exports = { validateSources };
