import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/robots.txt/route';

describe('robots.txt route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
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
    it('uses NEXT_PUBLIC_SITE_URL environment variable when set', async () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-site.com';
      const response = await GET();
      const text = await response.text();
      expect(text).toContain('https://custom-site.com');
    });

    it('uses default URL when NEXT_PUBLIC_SITE_URL is not set', async () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      const response = await GET();
      const text = await response.text();
      expect(text).toContain('https://www.nextmedal.com');
    });
  });
});
