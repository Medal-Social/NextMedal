import { z } from 'zod';
import { logger } from './logger';

const envSchema = z.object({
  // App
  NEXT_PUBLIC_BASE_URL: z.string().url().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  NEXT_PUBLIC_APP_ENV: z.enum(['production', 'development', 'test', 'staging']).optional(),

  // Sanity
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().optional().default('2025-12-23'),
  SANITY_API_READ_TOKEN: z.string().optional(),
  SANITY_REVALIDATE_SECRET: z.string().optional(),

  // Analytics
  NEXT_PUBLIC_UMAMI_SCRIPT_URL: z.string().url().optional(),
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
});

// Validate env vars at runtime
const parsedEnv = envSchema.safeParse({
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
  SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
  NEXT_PUBLIC_UMAMI_SCRIPT_URL: process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL,
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
});

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

if (!parsedEnv.success) {
  if (isBuildTime) {
    // biome-ignore lint/suspicious/noConsole: Intentional build-time warning
    console.warn(
      '⚠️ Building with missing or invalid environment variables. Some pre-rendered pages might be affected.'
    );
  } else {
    logger.error({ err: parsedEnv.error.format() }, '❌ Invalid environment variables');
    throw new Error('Invalid environment variables');
  }
}

// During build time we allow partial data, otherwise it's guaranteed by throw above
export const env = (parsedEnv.success ? parsedEnv.data : (parsedEnv as any).data || {}) as z.infer<
  typeof envSchema
>;

export const dev = env.NODE_ENV === 'development';
export const vercelPreview = env.VERCEL_ENV === 'preview';
export const BASE_URL =
  dev || !env.NEXT_PUBLIC_BASE_URL ? 'http://localhost:3000' : env.NEXT_PUBLIC_BASE_URL;
