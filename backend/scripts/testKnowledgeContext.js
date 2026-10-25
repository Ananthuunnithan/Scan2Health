const mongoose = require('mongoose');
require('dotenv').config();

const { buildKnowledgeContext } = require('../services/knowledgeContextService');

async function runTest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected.');

    const context = await buildKnowledgeContext({
      nutrient: 'sodium',
      conditionCode: 'HYPERTENSION'
    });

    console.log('\n========== KNOWLEDGE CONTEXT ==========\n');
    console.log(JSON.stringify(context, null, 2));

    console.log('\n=======================================\n');
    console.log(`Knowledge context contains ${context.length} document(s).`);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

runTest();