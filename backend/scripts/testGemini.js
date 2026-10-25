require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

async function runTest() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is missing from backend/.env.');
    return;
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });

  try {
    const response = await ai.interactions.create({
      model: 'gemini-3.8-flash',
      input: 'Reply with exactly: Scan2Health Gemini connection successful.'
    });

    console.log('Gemini API request successful.');
    console.log('Model response:', response.output_text);
  } catch (error) {
    console.error('Gemini API test failed:', error.message);
  }
}

runTest();