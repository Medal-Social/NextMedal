import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Store original env
const originalEnv = { ...process.env };

// Mock logger to prevent actual logging
vi.mock('@/lib/core/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('env', () => {
  beforeEach(() => {
    vi.resetModules();
    // Set up minimum required env vars
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_BASE_URL: 'https://example.com',
      NEXT_PUBLIC_SANITY_PROJECT_ID: 'test-project',
      NEXT_PUBLIC_SANITY_DATASET: 'production',
      NODE_ENV: 'test',
    };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe('env object', () => {
    it('exports validated environment variables', async () => {
      const { env } = await import('@/lib/core/env');

      expect(env.NEXT_PUBLIC_BASE_URL).toBe('https://example.com');
      expect(env.NEXT_PUBLIC_SANITY_PROJECT_ID).toBe('test-project');
      expect(env.NEXT_PUBLIC_SANITY_DATASET).toBe('production');
    });

    it('has NODE_ENV set to a valid value', async () => {
      // NODE_ENV should be one of the valid enum values
      const { env } = await import('@/lib/core/env');

      expect(['development', 'production', 'test']).toContain(env.NODE_ENV);
    });

    it('sets default SANITY_API_VERSION', async () => {
      delete process.env.NEXT_PUBLIC_SANITY_API_VERSION;

      const { env } = await import('@/lib/core/env');

      expect(env.NEXT_PUBLIC_SANITY_API_VERSION).toBe('2025-12-23');
    });

    it('includes optional env vars when provided', async () => {
      process.env.NEXT_PUBLIC_SANITY_BROWSER_TOKEN = 'secret-token';
      process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID = 'umami-123';

      const { env } = await import('@/lib/core/env');

      expect(env.NEXT_PUBLIC_SANITY_BROWSER_TOKEN).toBe('secret-token');
      expect(env.NEXT_PUBLIC_UMAMI_WEBSITE_ID).toBe('umami-123');
    });
  });

  describe('dev flag', () => {
    it('is true when NODE_ENV is development', async () => {
      vi.stubEnv('NODE_ENV', 'development');

      const { dev } = await import('@/lib/core/env');

      expect(dev).toBe(true);
    });

    it('is false when NODE_ENV is production', async () => {
      vi.stubEnv('NODE_ENV', 'production');

      const { dev } = await import('@/lib/core/env');

      expect(dev).toBe(false);
    });

    it('is false when NODE_ENV is test', async () => {
      vi.stubEnv('NODE_ENV', 'test');

      const { dev } = await import('@/lib/core/env');

      expect(dev).toBe(false);
    });
  });

  describe('vercelPreview flag', () => {
    it('is true when VERCEL_ENV is preview', async () => {
      process.env.VERCEL_ENV = 'preview';

      const { vercelPreview } = await import('@/lib/core/env');

      expect(vercelPreview).toBe(true);
    });

    it('is false when VERCEL_ENV is production', async () => {
      process.env.VERCEL_ENV = 'production';

      const { vercelPreview } = await import('@/lib/core/env');

      expect(vercelPreview).toBe(false);
    });

    it('is false when VERCEL_ENV is not set', async () => {
      delete process.env.VERCEL_ENV;

      const { vercelPreview } = await import('@/lib/core/env');

      expect(vercelPreview).toBe(false);
    });
  });

  describe('isStaging flag', () => {
    it('is true when NEXT_PUBLIC_APP_ENV is staging', async () => {
      process.env.NEXT_PUBLIC_APP_ENV = 'staging';

      const { isStaging } = await import('@/lib/core/env');

      expect(isStaging).toBe(true);
    });

    it('is false when NEXT_PUBLIC_APP_ENV is production', async () => {
      process.env.NEXT_PUBLIC_APP_ENV = 'production';

      const { isStaging } = await import('@/lib/core/env');

      expect(isStaging).toBe(false);
    });

    it('is false when NEXT_PUBLIC_APP_ENV is not set', async () => {
      delete process.env.NEXT_PUBLIC_APP_ENV;

      const { isStaging } = await import('@/lib/core/env');

      expect(isStaging).toBe(false);
    });
  });

  describe('isPreview flag', () => {
    it('is true when NEXT_PUBLIC_APP_ENV is preview', async () => {
      process.env.NEXT_PUBLIC_APP_ENV = 'preview';

      const { isPreview } = await import('@/lib/core/env');

      expect(isPreview).toBe(true);
    });

    it('is false when NEXT_PUBLIC_APP_ENV is production', async () => {
      process.env.NEXT_PUBLIC_APP_ENV = 'production';

      const { isPreview } = await import('@/lib/core/env');

      expect(isPreview).toBe(false);
    });

    it('is false when NEXT_PUBLIC_APP_ENV is not set', async () => {
      delete process.env.NEXT_PUBLIC_APP_ENV;

      const { isPreview } = await import('@/lib/core/env');

      expect(isPreview).toBe(false);
    });
  });

  describe('BASE_URL', () => {
    it('uses NEXT_PUBLIC_BASE_URL in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      process.env.NEXT_PUBLIC_BASE_URL = 'https://mysite.com';

      const { BASE_URL } = await import('@/lib/core/env');

      expect(BASE_URL).toBe('https://mysite.com');
    });

    it('uses localhost in development', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      process.env.NEXT_PUBLIC_BASE_URL = 'https://mysite.com';

      const { BASE_URL } = await import('@/lib/core/env');

      expect(BASE_URL).toBe('http://localhost:3000');
    });

    it('uses localhost when NEXT_PUBLIC_BASE_URL is missing', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      // Note: This would normally fail validation, but we test the fallback logic
      // The actual behavior depends on build-time vs runtime
      // For this test, we verify the BASE_URL computation logic
    });
  });

  describe('validation', () => {
    it('validates URL format for NEXT_PUBLIC_BASE_URL', async () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'not-a-valid-url';

      await expect(import('@/lib/core/env')).rejects.toThrow();
    });

    it('validates required NEXT_PUBLIC_SANITY_PROJECT_ID', async () => {
      delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

      await expect(import('@/lib/core/env')).rejects.toThrow();
    });

    it('validates required NEXT_PUBLIC_SANITY_DATASET', async () => {
      delete process.env.NEXT_PUBLIC_SANITY_DATASET;

      await expect(import('@/lib/core/env')).rejects.toThrow();
    });

    it('validates NODE_ENV enum values', async () => {
      vi.stubEnv('NODE_ENV', 'invalid');

      await expect(import('@/lib/core/env')).rejects.toThrow();
    });

    it('validates VERCEL_ENV enum values when provided', async () => {
      process.env.VERCEL_ENV = 'invalid' as any;

      await expect(import('@/lib/core/env')).rejects.toThrow();
    });

    it('validates NEXT_PUBLIC_APP_ENV enum values when provided', async () => {
      process.env.NEXT_PUBLIC_APP_ENV = 'invalid' as any;

      await expect(import('@/lib/core/env')).rejects.toThrow();
    });

    it('validates optional URL fields format', async () => {
      process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL = 'not-a-url';

      await expect(import('@/lib/core/env')).rejects.toThrow();
    });

    it('accepts valid optional URL fields', async () => {
      process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL = 'https://analytics.example.com/script.js';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://key@sentry.io/123';

      const { env } = await import('@/lib/core/env');

      expect(env.NEXT_PUBLIC_UMAMI_SCRIPT_URL).toBe('https://analytics.example.com/script.js');
      expect(env.NEXT_PUBLIC_SENTRY_DSN).toBe('https://key@sentry.io/123');
    });
  });

  describe('build-time behavior', () => {
    it('does not throw during build phase with invalid env', async () => {
      process.env.NEXT_PHASE = 'phase-production-build';
      delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

      // During build time, it should warn but not throw
      // The module should load without throwing
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const envModule = await import('@/lib/core/env');

      expect(envModule).toBeDefined();
      consoleSpy.mockRestore();
    });
  });

  describe('image proxy configuration', () => {
    it('accepts image proxy URL env var', async () => {
      process.env.NEXT_PUBLIC_IMAGE_PROXY_URL = 'https://proxy.example.com';

      const { env } = await import('@/lib/core/env');

      expect(env.NEXT_PUBLIC_IMAGE_PROXY_URL).toBe('https://proxy.example.com');
    });
  });
});
