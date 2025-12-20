import { z } from 'zod';

const envSchema = z.object({
  // App
  NEXT_PUBLIC_BASE_URL: z.string().url().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),

  // Sanity
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().optional().default('2024-12-01'),
});

// Validate env vars at runtime
const parsedEnv = envSchema.safeParse({
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
});

if (!parsedEnv.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsedEnv.error.format(), null, 2)
  );
  // Throwing error here will stop the build/runtime
  throw new Error('Invalid environment variables');
}

export const env = parsedEnv.data;

export const dev = env.NODE_ENV === 'development';
export const vercelPreview = env.VERCEL_ENV === 'preview';
export const BASE_URL = dev ? 'http://localhost:3000' : env.NEXT_PUBLIC_BASE_URL;
