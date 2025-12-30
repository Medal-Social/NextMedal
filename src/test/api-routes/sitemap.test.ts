import fc from 'fast-check';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@/lib/env', () => ({
  BASE_URL: 'https://example.com',
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock('@/sanity/lib/live', () => ({
  fetchSanityLive: vi.fn(),
}));

// Import from locale-specific sitemap route (not the sitemap index)
import { GET } from '@/app/sitemap-en.xml/route';
import { fetchSanityLive } from '@/sanity/lib/live';

const mockFetchSanityLive = vi.mocked(fetchSanityLive);

describe('sitemap-en.xml route', () => {
  const originalEnv = process.env;
  const mockRequest = new NextRequest('http://localhost:3000/sitemap-en.xml');

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Content-Type and Headers', () => {
    it('returns Content-Type application/xml', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            slug: 'index',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 1,
            language: 'en',
            translations: [],
          },
        ],
        blog: [],
        collections: [],
      });

      const response = await GET(mockRequest);
      expect(response.headers.get('Content-Type')).toContain('application/xml');
    });

    it('includes cache headers', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [],
        blog: [],
        collections: [],
      });

      const response = await GET(mockRequest);
      expect(response.headers.get('Cache-Control')).toContain('max-age=3600');
    });
  });

  describe('XSL Stylesheet', () => {
    it('includes XSL stylesheet reference', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            slug: 'index',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 1,
            language: 'en',
            translations: [],
          },
        ],
        blog: [],
        collections: [],
      });

      const response = await GET(mockRequest);
      const xml = await response.text();

      expect(xml).toContain('<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>');
    });
  });

  describe('URL elements', () => {
    it('includes url elements with loc, lastmod, and priority', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            slug: 'index',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 1,
            language: 'en',
            translations: [],
          },
          {
            slug: 'about',
            lastModified: '2024-01-02T00:00:00Z',
            priority: 0.5,
            language: 'en',
            translations: [],
          },
        ],
        blog: [],
        collections: [],
      });

      const response = await GET(mockRequest);
      const xml = await response.text();

      expect(xml).toContain('<url>');
      expect(xml).toContain('<loc>https://example.com</loc>');
      expect(xml).toContain('<loc>https://example.com/about</loc>');
      expect(xml).toContain('<lastmod>');
      expect(xml).toContain('<priority>1</priority>');
      expect(xml).toContain('<priority>0.5</priority>');
    });

    it('includes blog posts in sitemap', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [],
        blog: [
          {
            slug: 'test-post',
            lastModified: '2024-01-03T00:00:00Z',
            priority: 0.4,
            language: 'en',
            translations: [],
          },
        ],
        collections: [],
      });

      const response = await GET(mockRequest);
      const xml = await response.text();

      expect(xml).toContain('<loc>https://example.com/blog/test-post</loc>');
      expect(xml).toContain('<priority>0.4</priority>');
    });
  });

  describe('Multi-language support (hreflang)', () => {
    it('includes xhtml:link alternates for pages with translations', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            slug: 'about',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 0.8,
            language: 'en',
            translations: [{ slug: 'om-oss', language: 'nb' }],
          },
        ],
        blog: [],
        collections: [],
      });

      const response = await GET(mockRequest);
      const xml = await response.text();

      expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
      expect(xml).toContain(
        '<xhtml:link rel="alternate" hreflang="en" href="https://example.com/about"/>'
      );
      expect(xml).toContain(
        '<xhtml:link rel="alternate" hreflang="nb" href="https://example.com/nb/om-oss"/>'
      );
    });

    it('includes hreflang self-reference for English pages with Norwegian translation', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            slug: 'about',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 0.8,
            language: 'en',
            translations: [{ slug: 'om-oss', language: 'nb' }],
          },
        ],
        blog: [],
        collections: [],
      });

      const response = await GET(mockRequest);
      const xml = await response.text();

      // English sitemap includes English pages
      expect(xml).toContain('<loc>https://example.com/about</loc>');
      // Self-reference for English
      expect(xml).toContain(
        '<xhtml:link rel="alternate" hreflang="en" href="https://example.com/about"/>'
      );
      // Reference to Norwegian translation
      expect(xml).toContain(
        '<xhtml:link rel="alternate" hreflang="nb" href="https://example.com/nb/om-oss"/>'
      );
    });

    it('does not include alternates for pages without translations', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            slug: 'solo-page',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 0.5,
            language: 'en',
            translations: [],
          },
        ],
        blog: [],
        collections: [],
      });

      const response = await GET(mockRequest);
      const xml = await response.text();

      expect(xml).not.toContain('xhtml:link');
    });

    it('handles index page for default locale without prefix', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            slug: 'index',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 1,
            language: 'en',
            translations: [{ slug: 'index', language: 'nb' }],
          },
        ],
        blog: [],
        collections: [],
      });

      const response = await GET(mockRequest);
      const xml = await response.text();

      expect(xml).toContain('<loc>https://example.com</loc>');
      expect(xml).toContain(
        '<xhtml:link rel="alternate" hreflang="en" href="https://example.com"/>'
      );
      expect(xml).toContain(
        '<xhtml:link rel="alternate" hreflang="nb" href="https://example.com/nb"/>'
      );
    });
  });

  describe('XML structure', () => {
    it('returns valid XML with urlset root element', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            slug: 'index',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 1,
            language: 'en',
            translations: [],
          },
        ],
        blog: [],
        collections: [],
      });

      const response = await GET(mockRequest);
      const xml = await response.text();

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      expect(xml).toContain('</urlset>');
    });
  });

  describe('Error handling', () => {
    it('returns 503 status when Sanity CMS is unavailable', async () => {
      mockFetchSanityLive.mockRejectedValueOnce(new Error('CMS unavailable'));

      const response = await GET(mockRequest);

      expect(response.status).toBe(503);
      expect(response.headers.get('Content-Type')).toBe('text/plain');
    });

    it('returns error message when CMS fetch fails', async () => {
      mockFetchSanityLive.mockRejectedValueOnce(new Error('CMS unavailable'));

      const response = await GET(mockRequest);
      const text = await response.text();

      expect(text).toContain('Failed to fetch sitemap data');
    });
  });

  describe('Query validation', () => {
    it('uses SITEMAP_WITH_TRANSLATIONS_QUERY with noIndex filter', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [],
        blog: [],
        collections: [],
      });

      await GET(mockRequest);

      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('seo.noIndex != true'),
          stega: false,
        })
      );
    });

    it('query includes translations lookup', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [],
        blog: [],
        collections: [],
      });

      await GET(mockRequest);

      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('translation.metadata'),
        })
      );
    });
  });
});

/**
 * Property-Based Tests for Sitemap
 */
describe('sitemap-en.xml property tests', () => {
  const mockRequest = new NextRequest('http://localhost:3000/sitemap-en.xml');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Property 26: Sitemap URL Completeness**
   * For any page included in sitemap, the entry SHALL contain loc, lastmod, and priority.
   */
  it('Property 26: every sitemap URL entry contains loc, lastmod, and priority', async () => {
    const isoDateArb = fc
      .integer({ min: Date.parse('2020-01-01'), max: Date.parse('2025-12-31') })
      .map((ts) => new Date(ts).toISOString());

    const slugArb = fc.stringMatching(/^[a-z0-9-]+$/);

    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            slug: slugArb,
            lastModified: isoDateArb,
            priority: fc.double({ min: 0, max: 1, noNaN: true }),
            // Only generate English pages since we're testing sitemap-en.xml
            language: fc.constant('en'),
            translations: fc.constant([]),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (pages) => {
          mockFetchSanityLive.mockResolvedValueOnce({
            pages,
            blog: [],
            collections: [],
          });

          const response = await GET(mockRequest);
          const xml = await response.text();

          expect(xml).toContain('<loc>');
          expect(xml).toContain('<lastmod>');
          expect(xml).toContain('<priority>');
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * **Property 27: noIndex Sitemap Exclusion**
   * Query filter ensures noIndex pages are excluded.
   */
  it('Property 27: noIndex pages are excluded via query filter', async () => {
    mockFetchSanityLive.mockResolvedValueOnce({
      pages: [],
      blog: [],
      collections: [],
    });

    await GET(mockRequest);

    expect(mockFetchSanityLive).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.stringContaining('seo.noIndex != true'),
      })
    );
  });

  /**
   * **Property 28: Locale URL Construction**
   * Default locale URLs have no prefix, other locales are prefixed.
   */
  it('Property 28: locale URLs are correctly prefixed', async () => {
    const slugArb = fc.stringMatching(/^[a-z0-9-]+$/).filter((s) => s !== 'index' && s.length > 0);

    await fc.assert(
      fc.asyncProperty(slugArb, async (slug) => {
        // Test English (default locale - no prefix)
        // English sitemap only includes English pages
        mockFetchSanityLive.mockResolvedValueOnce({
          pages: [
            {
              slug,
              lastModified: '2024-01-01T00:00:00Z',
              priority: 0.5,
              language: 'en',
              translations: [],
            },
          ],
          blog: [],
          collections: [],
        });

        const enResponse = await GET(mockRequest);
        const enXml = await enResponse.text();
        // English pages appear without locale prefix (default locale)
        expect(enXml).toContain(`<loc>https://example.com/${slug}</loc>`);
      }),
      { numRuns: 20 }
    );
  });
});
