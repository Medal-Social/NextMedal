import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Store original process.env
const originalEnv = { ...process.env };

describe('env.client', () => {
  beforeEach(() => {
    // Reset modules to get fresh env values
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  describe('env object', () => {
    it('exports env object with default values', async () => {
      const { env } = await import('@/lib/core/env.client');
      expect(env).toBeDefined();
      expect(typeof env).toBe('object');
    });

    it('has NEXT_PUBLIC_BASE_URL with default empty string', async () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;
      const { env } = await import('@/lib/core/env.client');
      expect(env.NEXT_PUBLIC_BASE_URL).toBe('');
    });

    it('reads NEXT_PUBLIC_BASE_URL from process.env', async () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://custom.com';
      const { env } = await import('@/lib/core/env.client');
      expect(env.NEXT_PUBLIC_BASE_URL).toBe('https://custom.com');
    });

    it('has VERCEL_URL', async () => {
      process.env.VERCEL_URL = 'https://vercel.app';
      const { env } = await import('@/lib/core/env.client');
      expect(env.VERCEL_URL).toBe('https://vercel.app');
    });

    it('has VERCEL_PROJECT_PRODUCTION_URL', async () => {
      process.env.VERCEL_PROJECT_PRODUCTION_URL = 'https://prod.vercel.app';
      const { env } = await import('@/lib/core/env.client');
      expect(env.VERCEL_PROJECT_PRODUCTION_URL).toBe('https://prod.vercel.app');
    });

    it('has NEXT_PUBLIC_SANITY_PROJECT_ID with default empty string', async () => {
      delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
      const { env } = await import('@/lib/core/env.client');
      expect(env.NEXT_PUBLIC_SANITY_PROJECT_ID).toBe('');
    });

    it('has NEXT_PUBLIC_SANITY_DATASET with default empty string', async () => {
      delete process.env.NEXT_PUBLIC_SANITY_DATASET;
      const { env } = await import('@/lib/core/env.client');
      expect(env.NEXT_PUBLIC_SANITY_DATASET).toBe('');
    });

    it('has NEXT_PUBLIC_SANITY_API_VERSION with default value', async () => {
      delete process.env.NEXT_PUBLIC_SANITY_API_VERSION;
      const { env } = await import('@/lib/core/env.client');
      expect(env.NEXT_PUBLIC_SANITY_API_VERSION).toBe('2025-12-23');
    });
  });

  describe('derived constants', () => {
    it('dev is true in development', async () => {
      (process.env as Record<string, string>).NODE_ENV = 'development';
      const { dev } = await import('@/lib/core/env.client');
      expect(dev).toBe(true);
    });

    it('dev is false in production', async () => {
      (process.env as Record<string, string>).NODE_ENV = 'production';
      const { dev } = await import('@/lib/core/env.client');
      expect(dev).toBe(false);
    });

    it('vercelPreview is true when VERCEL_ENV is preview', async () => {
      process.env.VERCEL_ENV = 'preview';
      const { vercelPreview } = await import('@/lib/core/env.client');
      expect(vercelPreview).toBe(true);
    });

    it('vercelPreview is false when VERCEL_ENV is production', async () => {
      process.env.VERCEL_ENV = 'production';
      const { vercelPreview } = await import('@/lib/core/env.client');
      expect(vercelPreview).toBe(false);
    });

    it('isStaging is true when NEXT_PUBLIC_APP_ENV is staging', async () => {
      process.env.NEXT_PUBLIC_APP_ENV = 'staging';
      const { isStaging } = await import('@/lib/core/env.client');
      expect(isStaging).toBe(true);
    });

    it('isPreview is true when NEXT_PUBLIC_APP_ENV is preview', async () => {
      process.env.NEXT_PUBLIC_APP_ENV = 'preview';
      const { isPreview } = await import('@/lib/core/env.client');
      expect(isPreview).toBe(true);
    });
  });

  describe('BASE_URL resolution', () => {
    it('returns localhost in development', async () => {
      (process.env as Record<string, string>).NODE_ENV = 'development';
      const { BASE_URL } = await import('@/lib/core/env.client');
      expect(BASE_URL).toBe('http://localhost:3000');
    });

    it('uses NEXT_PUBLIC_BASE_URL as first priority in production', async () => {
      (process.env as Record<string, string>).NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_BASE_URL = 'https://my-site.com';
      const { BASE_URL } = await import('@/lib/core/env.client');
      expect(BASE_URL).toBe('https://my-site.com');
    });

    it('uses VERCEL_PROJECT_PRODUCTION_URL as second priority', async () => {
      (process.env as Record<string, string>).NODE_ENV = 'production';
      delete process.env.NEXT_PUBLIC_BASE_URL;
      process.env.VERCEL_PROJECT_PRODUCTION_URL = 'https://prod.vercel.app';
      const { BASE_URL } = await import('@/lib/core/env.client');
      expect(BASE_URL).toContain('vercel.app');
    });

    it('uses VERCEL_URL as third priority', async () => {
      (process.env as Record<string, string>).NODE_ENV = 'production';
      delete process.env.NEXT_PUBLIC_BASE_URL;
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      process.env.VERCEL_URL = 'https://preview.vercel.app';
      const { BASE_URL } = await import('@/lib/core/env.client');
      expect(BASE_URL).toContain('vercel.app');
    });

    it('falls back to localhost when no URLs are set', async () => {
      (process.env as Record<string, string>).NODE_ENV = 'production';
      delete process.env.NEXT_PUBLIC_BASE_URL;
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      delete process.env.VERCEL_URL;
      const { BASE_URL } = await import('@/lib/core/env.client');
      expect(BASE_URL).toBe('http://localhost:3000');
    });
  });
});
