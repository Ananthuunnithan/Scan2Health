
const { GoogleGenAI } = require('@google/genai');

let ai;

function getClient() {
  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }

  return ai;
}

const { validateSources } = require('./sourceValidationService');

const MODEL_NAME = 'gemini-3.8-flash';
const MAX_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

const RETRYABLE_STATUS_CODES = new Set([
  408, // Request timeout
  429, // Rate limit
  500, // Internal server error
  502, // Bad gateway
  503, // Service unavailable
  504  // Gateway timeout
]);

function getErrorStatus(error) {
  const status = Number(
    error?.status ??
    error?.statusCode ??
    error?.response?.status
  );

  return Number.isFinite(status) && status > 0
    ? status
    : null;
}

function isDailyQuotaExhausted(error) {
  const details = [
    error?.message,
    error?.statusText,
    error?.response?.data,
    error?.errorDetails,
  ]
    .map((value) =>
      typeof value === 'string' ? value : JSON.stringify(value || '')
    )
    .join(' ')
    .toLowerCase();

  return /(?:daily|per[- ]day|day)\s+(?:quota|limit)|(?:quota|limit)\s+(?:daily|per[- ]day|day)/.test(
    details
  );
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createGeminiResponse(prompt) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await getClient().interactions.create({
        model: MODEL_NAME,
        input: prompt
      });
    } catch (error) {
      const status = getErrorStatus(error);
      const isRetryable =
        RETRYABLE_STATUS_CODES.has(status) && !isDailyQuotaExhausted(error);

      if (!isRetryable || attempt === MAX_ATTEMPTS) {
        console.error(
          `Gemini request failed (attempt ${attempt}/${MAX_ATTEMPTS}):`,
          status ?? error.message
        );

        throw error;
      }

      const delay =
        INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);

      console.warn(
        `Gemini returned HTTP ${status}. ` +
        `Retrying in ${delay}ms ` +
        `(attempt ${attempt + 1}/${MAX_ATTEMPTS}).`
      );

      await sleep(delay);
    }
  }

  throw new Error('Gemini request failed after all retry attempts.');
}

async function generateExplanation(ragContext) {
  if (!ragContext) {
    throw new Error('RAG context is required.');
  }

  const prompt = `
You are the nutrition explanation assistant for Scan2Health.

Your task is to explain an existing deterministic food assessment
using only the supplied assessment and knowledge context.

STRICT RULES:
1. Never change or override the supplied overallStatus, severity, or action.
2. If an allergy finding has action AVOID, clearly communicate that
   the product should be avoided for that recorded allergy.
3. Do not invent nutrition values, thresholds, health conditions,
   ingredients, or medical claims.
4. Distinguish product-level values from daily nutrition values.
5. Treat missing nutrition values as unknown, never as zero.
6. Use the supplied knowledge documents as supporting evidence.
7. Do not claim a source supports something it does not state.
8. If relevant knowledge is absent, explain only what the assessment
   supports and do not invent a citation.
9. Keep the explanation concise, clear, and understandable.
10. This is informational guidance, not a medical diagnosis.
11. Use the exact overallStatus, severity, and action provided
    in the assessment. Never invent or change them.
12. Describe findings using the supplied evidence. Do not add
    unsupported claims about medical risk, diagnosis, or outcomes.
13. Respect the rule operator and threshold. For example, if
    the operator is GTE, say "meets or exceeds" when appropriate;
    do not say "exceeds" when the value equals the threshold.

Return a JSON object with these fields:
{
  "explanation": "A concise explanation of the assessment",
  "keyPoints": ["Important point 1", "Important point 2"],
  "sources": [
    {
      "name": "Source name from supplied knowledge",
      "reference": "Reference from supplied knowledge"
    }
  ]
}

Use an empty keyPoints or sources array when appropriate.
Return valid JSON only.

ASSESSMENT AND RETRIEVED KNOWLEDGE:
${JSON.stringify(ragContext, null, 2)}
`;

  const response = await createGeminiResponse(prompt);
  const output = response.output_text;

  if (!output) {
    throw new Error('Gemini returned an empty explanation.');
  }

  let explanation;

  try {
    const cleanedOutput = output
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '');

    explanation = JSON.parse(cleanedOutput);
  } catch (error) {
    console.error('Gemini raw output:', output);
    console.error('JSON parsing error:', error.message);
    throw new Error('Gemini returned an invalid JSON explanation.');
  }

  if (
    typeof explanation.explanation !== 'string' ||
    !Array.isArray(explanation.keyPoints) ||
    !Array.isArray(explanation.sources)
  ) {
    throw new Error('Gemini returned an unexpected explanation format.');
  }

  // Keep only sources validated against retrieved knowledge.
  explanation.sources = validateSources(
    ragContext,
    explanation.sources
  );

  return explanation;
}

module.exports = {
  generateExplanation,
  // Exported for offline regression tests; application callers use
  // generateExplanation only.
  createGeminiResponse,
  isDailyQuotaExhausted,
  __setGeminiClientForTests(client) {
    ai = client;
  }
};
