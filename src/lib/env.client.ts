/**
 * Client-safe environment variables.
 * Only NEXT_PUBLIC_* variables are available on the client.
 * No Zod validation to keep bundle small.
 */

export const env = {
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? '',
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV as
    | 'production'
    | 'development'
    | 'staging'
    | 'preview'
    | undefined,
  VERCEL_ENV: process.env.VERCEL_ENV as 'production' | 'preview' | 'development' | undefined,
  NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET ?? '',
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2025-12-23',
  NEXT_PUBLIC_UMAMI_SCRIPT_URL: process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL,
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_IMAGE_PROXY_URL: process.env.NEXT_PUBLIC_IMAGE_PROXY_URL,
  NEXT_PUBLIC_IMAGE_PROXY_KEY: process.env.NEXT_PUBLIC_IMAGE_PROXY_KEY,
  NEXT_PUBLIC_IMAGE_PROXY_SALT: process.env.NEXT_PUBLIC_IMAGE_PROXY_SALT,
} as const;

export const dev = env.NODE_ENV === 'development';
export const vercelPreview = env.VERCEL_ENV === 'preview';
export const isStaging = env.NEXT_PUBLIC_APP_ENV === 'staging';
export const isPreview = env.NEXT_PUBLIC_APP_ENV === 'preview';
export const BASE_URL =
  dev || !env.NEXT_PUBLIC_BASE_URL ? 'http://localhost:3000' : env.NEXT_PUBLIC_BASE_URL;
