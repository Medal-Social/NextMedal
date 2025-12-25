import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the env module
vi.mock('@/lib/env', () => ({
  BASE_URL: 'https://test.example.com',
  isStaging: false,
  isPreview: false,
  vercelPreview: false,
}));

import { GET } from '@/app/robots.txt/route';

describe('robots.txt route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Content-Type', () => {
    it('returns Content-Type text/plain', async () => {
      const response = await GET();
      expect(response.headers.get('Content-Type')).toBe('text/plain');
    });
  });

  describe('Directives', () => {
    it('includes User-agent directive', async () => {
      const response = await GET();
      const text = await response.text();
      expect(text).toContain('User-agent:');
    });

    it('includes Allow directive', async () => {
      const response = await GET();
      const text = await response.text();
      expect(text).toContain('Allow:');
    });

    it('includes Sitemap directive', async () => {
      const response = await GET();
      const text = await response.text();
      expect(text).toContain('Sitemap:');
    });

    it('includes sitemap URL pointing to sitemap.xml', async () => {
      const response = await GET();
      const text = await response.text();
      expect(text).toMatch(/Sitemap:.*\/sitemap\.xml/);
    });
  });

  describe('Site URL configuration', () => {
    it('uses BASE_URL from env', async () => {
      const response = await GET();
      const text = await response.text();
      expect(text).toContain('https://test.example.com');
    });
  });
});
