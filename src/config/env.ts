import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  // AI provider config. Defaults target Google Gemini's OpenAI-compatible
  // endpoint, so the standard `openai` SDK works unchanged. Swap provider by
  // editing these env vars only (e.g. Groq / OpenRouter) — no code changes.
  AI_API_KEY: z.string().min(1),
  AI_BASE_URL: z.string().url().default('https://generativelanguage.googleapis.com/v1beta/openai/'),
  AI_MODEL: z.string().default('gemini-2.0-flash'),
  JWT_ACCESS_TOKEN: z.string().min(10),
  JWT_REFRESH_TOKEN: z.string().min(10),
  PORT: z.coerce.number().default(3000),
  GOOGLE_CLIENT_ID: z.string().min(1),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid env:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;