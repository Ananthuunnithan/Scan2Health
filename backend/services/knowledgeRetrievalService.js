const KnowledgeDocument = require('../models/KnowledgeDocument');


async function retrieveKnowledge({
  nutrient,
  conditionCode
}) {
  const query = {
    active: true
  };

  if (nutrient) {
    query.nutrients = nutrient;
  }

  if (conditionCode) {
    query.$or = [
      { conditionCodes: conditionCode },
      { conditionCodes: { $size: 0 } }
    ];
  }

  const documents = await KnowledgeDocument.find(query)
    .sort({
      topic: 1,
      title: 1
    })
    .lean();

  return documents;
}


module.exports = {
  retrieveKnowledge
};