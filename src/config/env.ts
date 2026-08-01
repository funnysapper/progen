import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AI_API_KEY: z.string().min(1),
  AI_BASE_URL: z.string().url().default('https://api.groq.com/openai/v1'),
  AI_MODEL: z.string().default('llama-3.3-70b-versatile'),
  JWT_ACCESS_TOKEN: z.string().min(10),
  JWT_REFRESH_TOKEN: z.string().min(10),
  PORT: z.coerce.number().default(3000),
  GOOGLE_CLIENT_ID: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid env:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;