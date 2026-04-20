import OpenAI from 'openai';

export function createOpenAIClient(config) {
  return new OpenAI({
    apiKey: config.openai.apiKey,
  });
}

export async function classifyCandidateWindows(openai, config, candidateWindows, logger) {
  const results = [];

  for (const window of candidateWindows) {
    const firstPass = await classifyWindow(openai, config.openai.models.classify, window);
    let resolved = firstPass;

    if (!resolved || Number(resolved.confidence || 0) < 0.8) {
      logger.warn('Low-confidence classification, escalating', {
        startLineIndex: window.startLineIndex,
        endLineIndex: window.endLineIndex,
      });
      resolved = await classifyWindow(openai, config.openai.models.escalate, window);
    }

    if (!resolved) {
      continue;
    }

    results.push({
      ...resolved,
      window,
    });
  }

  return results;
}

async function classifyWindow(openai, model, window) {
  const response = await openai.responses.create({
    model,
    input: [
      {
        role: 'system',
        content: [
          {
            type: 'input_text',
            text:
              'You identify sponsor or advertisement segments in Bilibili subtitles. ' +
              'Return strict JSON only. Prefer precision over recall.',
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text:
              'Classify whether this subtitle window is a sponsor segment. ' +
              'Return isSponsor, startLineIndex, endLineIndex, confidence, label, reason.\n\n' +
              JSON.stringify(window.lines),
          },
        ],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'sponsor_window_result',
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['isSponsor', 'startLineIndex', 'endLineIndex', 'confidence', 'label', 'reason'],
          properties: {
            isSponsor: {
              type: 'boolean',
            },
            startLineIndex: {
              type: 'integer',
            },
            endLineIndex: {
              type: 'integer',
            },
            confidence: {
              type: 'number',
              minimum: 0,
              maximum: 1,
            },
            label: {
              type: 'string',
            },
            reason: {
              type: 'string',
            },
          },
        },
        strict: true,
      },
    },
  });

  const parsed = JSON.parse(response.output_text || '{}');
  if (!parsed || !parsed.isSponsor) {
    return null;
  }

  return parsed;
}
