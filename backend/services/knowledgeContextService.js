const { retrieveKnowledge } = require('./knowledgeRetrievalService');

async function buildKnowledgeContext({ nutrient, conditionCode }) {
  const documents = await retrieveKnowledge({
    nutrient,
    conditionCode
  });

  return documents.map((doc) => ({
    title: doc.title,
    topic: doc.topic,
    category: doc.category,
    content: doc.content,
    source: doc.source,
    keywords: doc.keywords
  }));
}

module.exports = {
  buildKnowledgeContext
};