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

  // Optional: Grafana Faro analytics
  NEXT_PUBLIC_FARO_URL: z.url().optional(),
  NEXT_PUBLIC_FARO_APP_NAME: z.string().optional(),
  NEXT_PUBLIC_FARO_APP_VERSION: z.string().optional(),
  NEXT_PUBLIC_FARO_APP_ENVIRONMENT: z.string().optional(),

  // Optional: Image Optimization
  NEXT_PUBLIC_IMAGE_PROXY_URL: z.url().optional(),

  // Optional: Medal Social API (single bearer key in SDK 1.x;
  // legacy CLIENT_ID/CLIENT_SECRET pair was removed when the SDK
  // switched to bearer-token auth)
  MEDAL_API_KEY: z.string().min(1).optional(),
  MEDAL_API_ENDPOINT: z.url().optional(),
});

// CI/CD systems expose *unset* secrets as empty strings rather than omitting
// them (e.g. GitHub Actions `${{ secrets.MISSING }}` expands to ""). An empty
// string is not `undefined`, so it slips past `.optional()` and then fails
// `url()` / `min(1)` validation — taking the whole site down at runtime with
// "Invalid environment variables". Coerce "" to undefined so optional vars
// validate as absent. (Mirrors @t3-oss/env's `emptyStringAsUndefined`.)
const rawEnv: Record<string, string | undefined> = {
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  NEXT_PUBLIC_SANITY_BROWSER_TOKEN: process.env.NEXT_PUBLIC_SANITY_BROWSER_TOKEN,
  SANITY_WRITE_TOKEN: process.env.SANITY_WRITE_TOKEN,
  NEXT_PUBLIC_FARO_URL: process.env.NEXT_PUBLIC_FARO_URL,
  NEXT_PUBLIC_FARO_APP_NAME: process.env.NEXT_PUBLIC_FARO_APP_NAME,
  NEXT_PUBLIC_FARO_APP_VERSION: process.env.NEXT_PUBLIC_FARO_APP_VERSION,
  NEXT_PUBLIC_FARO_APP_ENVIRONMENT: process.env.NEXT_PUBLIC_FARO_APP_ENVIRONMENT,
  NEXT_PUBLIC_IMAGE_PROXY_URL: process.env.NEXT_PUBLIC_IMAGE_PROXY_URL,
  MEDAL_API_KEY: process.env.MEDAL_API_KEY,
  MEDAL_API_ENDPOINT: process.env.MEDAL_API_ENDPOINT,
};
for (const key in rawEnv) {
  if (rawEnv[key] === '') rawEnv[key] = undefined;
}

// Validate env vars at runtime
const parsedEnv = envSchema.safeParse(rawEnv);

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
