import { OpenRouter } from '@openrouter/sdk';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.OPENROUTER_API_KEY || '';
const MODEL = process.env.OPENROUTER_MODEL || 'qwen/qwen3.6-plus:free';

let client;

export function assertOpenRouterConfigured() {
  if (!API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured in .env');
  }
}

function getClient() {
  assertOpenRouterConfigured();
  if (!client) {
    client = new OpenRouter({
      apiKey: API_KEY,
      httpReferer: process.env.OPENROUTER_HTTP_REFERER || process.env.BACKEND_URL || undefined,
      xTitle: process.env.OPENROUTER_X_TITLE || 'AcadBuddy',
    });
  }
  return client;
}

export function normalizeAssistantContent(content) {
  if (content == null) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (part && typeof part === 'object' && part.type === 'text' && typeof part.text === 'string') {
          return part.text;
        }
        return '';
      })
      .join('');
  }
  return '';
}

/**
 * @param {object} opts
 * @param {Array<{ role: string, content: unknown }>} opts.messages
 * @param {number} [opts.temperature]
 */
export async function openRouterChat({ messages, temperature, maxTokens }) {
  const openRouter = getClient();
  const completion = await openRouter.chat.send({
    model: MODEL,
    messages,
    temperature: temperature ?? 0.7,
    stream: false,
    ...(maxTokens != null && maxTokens > 0 ? { maxTokens } : {}),
  });
  const text = normalizeAssistantContent(completion?.choices?.[0]?.message?.content);
  if (!text?.trim()) {
    throw new Error('Empty or invalid response from OpenRouter');
  }
  return text.trim();
}

export async function testOpenRouterApiKey() {
  if (!API_KEY) {
    return {
      valid: false,
      error: 'OPENROUTER_API_KEY is not configured in .env',
    };
  }

  try {
    const openRouter = getClient();
    const completion = await openRouter.chat.send({
      model: MODEL,
      messages: [{ role: 'user', content: "Say 'test' if you can read this." }],
      temperature: 0,
      stream: false,
    });
    const text = normalizeAssistantContent(completion?.choices?.[0]?.message?.content);
    if (text) {
      return {
        valid: true,
        message: 'API key is valid and working via OpenRouter!',
      };
    }
    return {
      valid: false,
      error: 'Empty response from OpenRouter',
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    };
  }
}

export function getOpenRouterModelName() {
  return MODEL;
}
