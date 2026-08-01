import OpenAI from 'openai';
import { env } from './env';

// OpenAI-compatible AI provider (defaults to Groq). Swapping providers is just
// an env change (AI_API_KEY / AI_BASE_URL / AI_MODEL) — no code change.
export const ai = new OpenAI({
  apiKey: env.AI_API_KEY,
  baseURL: env.AI_BASE_URL,
  timeout: 60_000,
  maxRetries: 2,
});
