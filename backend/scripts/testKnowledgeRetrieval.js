require('dotenv').config();

const mongoose = require('mongoose');

const {
  retrieveKnowledge
} = require('../services/knowledgeRetrievalService');


async function testKnowledgeRetrieval() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected.');

    const documents = await retrieveKnowledge({
      nutrient: 'sodium',
      conditionCode: 'HYPERTENSION'
    });

    console.log('\n========== RETRIEVED KNOWLEDGE ==========\n');

    console.log(
      JSON.stringify(
        documents,
        null,
        2
      )
    );

    console.log(
      '\n=========================================\n'
    );

    console.log(
      `Retrieved ${documents.length} knowledge document(s).`
    );

  } catch (error) {
    console.error(
      'Knowledge retrieval test failed:',
      error
    );

  } finally {
    await mongoose.connection.close();

    console.log(
      'MongoDB connection closed.'
    );
  }
}


testKnowledgeRetrieval();