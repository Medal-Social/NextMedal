import { z } from 'zod';
import { logger } from './logger';

const envSchema = z.object({
  // App
  NEXT_PUBLIC_BASE_URL: z.url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  NEXT_PUBLIC_APP_ENV: z.enum(['production', 'development', 'staging', 'preview']).optional(),

  // Sanity
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().optional().default('2025-12-23'),
  // Optional: enables client-side live preview (must be NEXT_PUBLIC_ to work in browser)
  NEXT_PUBLIC_SANITY_BROWSER_TOKEN: z.string().optional(),
  // Server-side write token for creating leads (NOT public - server only)
  SANITY_WRITE_TOKEN: z.string().optional(),

  // Optional: Analytics
  NEXT_PUBLIC_UMAMI_SCRIPT_URL: z.url().optional(),
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  // Optional: Image Optimization
  NEXT_PUBLIC_IMAGE_PROXY_URL: z.url().optional(),

  // Optional: Medal Social API
  MEDAL_SOCIAL_CLIENT_ID: z.string().min(1).optional(),
  MEDAL_SOCIAL_CLIENT_SECRET: z.string().min(1).optional(),
  MEDAL_API_ENDPOINT: z.url().optional(),
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
  NEXT_PUBLIC_SANITY_BROWSER_TOKEN: process.env.NEXT_PUBLIC_SANITY_BROWSER_TOKEN,
  SANITY_WRITE_TOKEN: process.env.SANITY_WRITE_TOKEN,
  NEXT_PUBLIC_UMAMI_SCRIPT_URL: process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL,
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  SENTRY_ORG: process.env.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  NEXT_PUBLIC_IMAGE_PROXY_URL: process.env.NEXT_PUBLIC_IMAGE_PROXY_URL,
  MEDAL_SOCIAL_CLIENT_ID: process.env.MEDAL_SOCIAL_CLIENT_ID,
  MEDAL_SOCIAL_CLIENT_SECRET: process.env.MEDAL_SOCIAL_CLIENT_SECRET,
  MEDAL_API_ENDPOINT: process.env.MEDAL_API_ENDPOINT,
});

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

if (!parsedEnv.success) {
  if (isBuildTime) {
    // biome-ignore lint/suspicious/noConsole: Intentional build-time warning
    console.warn(
      '⚠️ Building with missing or invalid environment variables. Some pre-rendered pages might be affected.'
    );
  } else {
    logger.error({ err: z.treeifyError(parsedEnv.error) }, '❌ Invalid environment variables');
    throw new Error('Invalid environment variables');
  }
}

// During build time we allow partial data, otherwise it's guaranteed by throw above
export const env = (
  parsedEnv.success
    ? parsedEnv.data
    : (parsedEnv as { data?: z.infer<typeof envSchema> }).data || {}
) as z.infer<typeof envSchema>;

export const dev = env.NODE_ENV === 'development';
export const vercelPreview = env.VERCEL_ENV === 'preview';
export const isStaging = env.NEXT_PUBLIC_APP_ENV === 'staging';
export const isPreview = env.NEXT_PUBLIC_APP_ENV === 'preview';
export const BASE_URL =
  dev || !env.NEXT_PUBLIC_BASE_URL ? 'http://localhost:3000' : env.NEXT_PUBLIC_BASE_URL;
