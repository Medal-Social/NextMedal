import fc from 'fast-check';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n/config';

// Mock dependencies
vi.mock('@/lib/core/env', () => ({
  env: {
    NEXT_PUBLIC_BASE_URL: 'https://example.com',
    NODE_ENV: 'test' as const,
    NEXT_PUBLIC_SANITY_PROJECT_ID: 'test-project',
    NEXT_PUBLIC_SANITY_DATASET: 'test',
    NEXT_PUBLIC_SANITY_API_VERSION: '2025-12-23',
  },
  BASE_URL: 'https://example.com',
  dev: false,
  vercelPreview: false,
  isStaging: false,
  isPreview: false,
}));

vi.mock('@/lib/core/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock('@/sanity/lib/live', () => ({
  fetchSanityLive: vi.fn(),
}));

// Mock the generated collections file directly (used by getAllCollections)
vi.mock('@/lib/collections/generated/collections.generated', () => ({
  COLLECTION_SLUGS_BY_LOCALE: {
    en: {
      'collection.article': {
        type: 'collection.article',
        slug: 'articles',
        name: 'Articles',
      },
      'collection.changelog': {
        type: 'collection.changelog',
        slug: 'changelog',
        name: 'Changelog',
      },
      'collection.documentation': {
        type: 'collection.documentation',
        slug: 'docs',
        name: 'Documentation',
      },
      'collection.newsletter': {
        type: 'collection.newsletter',
        slug: 'newsletter',
        name: 'Newsletter',
      },
      'collection.events': {
        type: 'collection.events',
        slug: 'events',
        name: 'Events',
      },
    },
    nb: {
      'collection.article': {
        type: 'collection.article',
        slug: 'artikler',
        name: 'Articles',
      },
      'collection.changelog': {
        type: 'collection.changelog',
        slug: 'endringslogg',
        name: 'Changelog',
      },
      'collection.documentation': {
        type: 'collection.documentation',
        slug: 'dokumentasjon',
        name: 'Documentation',
      },
      'collection.newsletter': {
        type: 'collection.newsletter',
        slug: 'nyhetsbrev',
        name: 'Newsletter',
      },
      'collection.events': {
        type: 'collection.events',
        slug: 'hendelser',
        name: 'Events',
      },
    },
  },
  DEFAULT_COLLECTION_SLUGS: {
    'collection.article': 'articles',
    'collection.changelog': 'changelog',
    'collection.documentation': 'docs',
    'collection.newsletter': 'newsletter',
    'collection.events': 'events',
  },
  SLUG_TO_TYPE_MAP: {},
  GENERATION_METADATA: {
    generatedAt: '2025-01-01T00:00:00.000Z',
    locales: ['en', 'nb'],
    source: 'Test mock',
  },
}));

// Import from dynamic sitemap route
// Note: The actual route is at /sitemap/[locale] but rewritten from /sitemap-:locale.xml
import { GET } from '@/app/sitemap/[locale]/route';
import { fetchSanityLive } from '@/sanity/lib/live';

const mockFetchSanityLive = vi.mocked(fetchSanityLive);

// Helper to create route params
const createParams = (locale: string) => Promise.resolve({ locale });

describe('sitemap-[locale].xml route', () => {
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

  describe('Locale validation', () => {
    it('redirects to sitemap index for invalid locale', async () => {
      const response = await GET(mockRequest, { params: createParams('invalid') });
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('https://example.com/sitemap.xml');
    });

    it.each(SUPPORTED_LOCALES)('accepts valid %s locale', async (locale) => {
      mockFetchSanityLive.mockResolvedValueOnce({ pages: [], articles: [], collections: [] });
      mockFetchSanityLive.mockResolvedValueOnce([]);

      const response = await GET(mockRequest, { params: createParams(locale) });
      expect(response.status).toBe(200);
    });
  });

  describe('Content-Type and Headers', () => {
    it('returns Content-Type application/xml', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            _id: 'page-1',
            slug: 'index',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 1,
            language: 'en',
          },
        ],
        articles: [],
        collections: [],
      });
      mockFetchSanityLive.mockResolvedValueOnce([]);

      const response = await GET(mockRequest, { params: createParams('en') });
      expect(response.headers.get('Content-Type')).toContain('application/xml');
    });

    it('includes cache headers', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({ pages: [], articles: [], collections: [] });
      mockFetchSanityLive.mockResolvedValueOnce([]);

      const response = await GET(mockRequest, { params: createParams('en') });
      expect(response.headers.get('Cache-Control')).toContain('max-age=3600');
    });
  });

  describe('XSL Stylesheet', () => {
    it('includes XSL stylesheet reference', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            _id: 'page-1',
            slug: 'index',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 1,
            language: 'en',
          },
        ],
        articles: [],
        collections: [],
      });
      mockFetchSanityLive.mockResolvedValueOnce([]);

      const response = await GET(mockRequest, { params: createParams('en') });
      const xml = await response.text();

      expect(xml).toContain('<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>');
    });
  });

  describe('URL elements', () => {
    it('includes url elements with loc, lastmod, and priority', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            _id: 'page-1',
            slug: 'index',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 1,
            language: 'en',
          },
          {
            _id: 'page-2',
            slug: 'about',
            lastModified: '2024-01-02T00:00:00Z',
            priority: 0.5,
            language: 'en',
          },
        ],
        articles: [],
        collections: [],
      });
      mockFetchSanityLive.mockResolvedValueOnce([]);

      const response = await GET(mockRequest, { params: createParams('en') });
      const xml = await response.text();

      expect(xml).toContain('<url>');
      expect(xml).toContain('<loc>https://example.com</loc>');
      expect(xml).toContain('<loc>https://example.com/about</loc>');
      expect(xml).toContain('<lastmod>');
      expect(xml).toContain('<priority>1</priority>');
      expect(xml).toContain('<priority>0.5</priority>');
    });

    it('includes articles in sitemap', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [],
        articles: [
          {
            _id: 'article-1',
            slug: 'test-post',
            lastModified: '2024-01-03T00:00:00Z',
            priority: 0.4,
            language: 'en',
          },
        ],
        collections: [],
      });
      mockFetchSanityLive.mockResolvedValueOnce([]);

      const response = await GET(mockRequest, { params: createParams('en') });
      const xml = await response.text();

      expect(xml).toContain('<loc>https://example.com/articles/test-post</loc>');
      expect(xml).toContain('<priority>0.4</priority>');
    });

    it('filters pages by locale parameter', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            _id: 'page-about',
            slug: 'about',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 0.8,
            language: 'en',
          },
          {
            _id: 'page-om-oss',
            slug: 'om-oss',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 0.8,
            language: 'nb',
          },
        ],
        articles: [],
        collections: [],
      });
      mockFetchSanityLive.mockResolvedValueOnce([]);

      const response = await GET(mockRequest, { params: createParams('en') });
      const xml = await response.text();

      // Should include English page
      expect(xml).toContain('<loc>https://example.com/about</loc>');
      // Should NOT include Norwegian page in English sitemap
      expect(xml).not.toContain('om-oss');
    });
  });

  describe('Multi-language support (hreflang)', () => {
    it('includes xhtml:link alternates for pages with translations', async () => {
      // First call: sitemap data (pages, articles, collections)
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            _id: 'page-about',
            slug: 'about',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 0.8,
            language: 'en',
          },
        ],
        articles: [],
        collections: [],
      });
      // Second call: translation metadata (note: translations must have 'value' wrapper)
      mockFetchSanityLive.mockResolvedValueOnce([
        {
          _id: 'translation-about',
          documentId: 'page-about',
          translations: [
            { value: { _id: 'page-about', _type: 'page', slug: 'about', language: 'en' } },
            { value: { _id: 'page-about-nb', _type: 'page', slug: 'om-oss', language: 'nb' } },
          ],
        },
      ]);

      const response = await GET(mockRequest, { params: createParams('en') });
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
      // First call: sitemap data
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            _id: 'page-about',
            slug: 'about',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 0.8,
            language: 'en',
          },
        ],
        articles: [],
        collections: [],
      });
      // Second call: translation metadata
      mockFetchSanityLive.mockResolvedValueOnce([
        {
          _id: 'translation-about',
          documentId: 'page-about',
          translations: [
            { value: { _id: 'page-about', _type: 'page', slug: 'about', language: 'en' } },
            { value: { _id: 'page-about-nb', _type: 'page', slug: 'om-oss', language: 'nb' } },
          ],
        },
      ]);

      const response = await GET(mockRequest, { params: createParams('en') });
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
      // First call: sitemap data
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            _id: 'page-solo',
            slug: 'solo-page',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 0.5,
            language: 'en',
          },
        ],
        articles: [],
        collections: [],
      });
      // Second call: translation metadata (empty - no translations)
      mockFetchSanityLive.mockResolvedValueOnce([]);

      const response = await GET(mockRequest, { params: createParams('en') });
      const xml = await response.text();

      expect(xml).not.toContain('xhtml:link');
    });

    it('handles index page for default locale without prefix', async () => {
      // First call: sitemap data
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            _id: 'page-index',
            slug: 'index',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 1,
            language: 'en',
          },
        ],
        articles: [],
        collections: [],
      });
      // Second call: translation metadata
      mockFetchSanityLive.mockResolvedValueOnce([
        {
          _id: 'translation-index',
          documentId: 'page-index',
          translations: [
            { value: { _id: 'page-index', _type: 'page', slug: 'index', language: 'en' } },
            { value: { _id: 'page-index-nb', _type: 'page', slug: 'index', language: 'nb' } },
          ],
        },
      ]);

      const response = await GET(mockRequest, { params: createParams('en') });
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

  describe('Non-default locale sitemaps', () => {
    // Test each non-default locale explicitly
    SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE).forEach((locale) => {
      it(`includes ${locale} pages with locale prefix`, async () => {
        // First call: sitemap data
        mockFetchSanityLive.mockResolvedValueOnce({
          pages: [
            {
              _id: `page-about-${locale}`,
              slug: 'about',
              lastModified: '2024-01-01T00:00:00Z',
              priority: 0.8,
              language: locale,
            },
          ],
          articles: [],
          collections: [],
        });
        // Second call: translation metadata
        mockFetchSanityLive.mockResolvedValueOnce([
          {
            _id: `translation-about-${locale}`,
            documentId: `page-about-${locale}`,
            translations: [
              { value: { _id: 'page-about', _type: 'page', slug: 'about', language: 'en' } },
              {
                value: {
                  _id: `page-about-${locale}`,
                  _type: 'page',
                  slug: 'about',
                  language: locale,
                },
              },
            ],
          },
        ]);

        const response = await GET(mockRequest, { params: createParams(locale) });
        const xml = await response.text();

        expect(xml).toContain(`<loc>https://example.com/${locale}/about</loc>`);
        expect(xml).toContain(
          `<xhtml:link rel="alternate" hreflang="${locale}" href="https://example.com/${locale}/about"/>`
        );
        expect(xml).toContain(
          '<xhtml:link rel="alternate" hreflang="en" href="https://example.com/about"/>'
        );
      });

      it(`handles ${locale} index page with locale prefix`, async () => {
        // First call: sitemap data
        mockFetchSanityLive.mockResolvedValueOnce({
          pages: [
            {
              _id: `page-index-${locale}`,
              slug: 'index',
              lastModified: '2024-01-01T00:00:00Z',
              priority: 1,
              language: locale,
            },
          ],
          articles: [],
          collections: [],
        });
        // Second call: translation metadata
        mockFetchSanityLive.mockResolvedValueOnce([
          {
            _id: 'translation-index',
            documentId: `page-index-${locale}`,
            translations: [
              { value: { _id: 'page-index', _type: 'page', slug: 'index', language: 'en' } },
              {
                value: {
                  _id: `page-index-${locale}`,
                  _type: 'page',
                  slug: 'index',
                  language: locale,
                },
              },
            ],
          },
        ]);

        const response = await GET(mockRequest, { params: createParams(locale) });
        const xml = await response.text();

        expect(xml).toContain(`<loc>https://example.com/${locale}</loc>`);
      });
    });
  });

  describe('XML structure', () => {
    it('returns valid XML with urlset root element', async () => {
      // First call: sitemap data
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            _id: 'page-index',
            slug: 'index',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 1,
            language: 'en',
          },
        ],
        articles: [],
        collections: [],
      });
      // Second call: translation metadata (empty - no translations)
      mockFetchSanityLive.mockResolvedValueOnce([]);

      const response = await GET(mockRequest, { params: createParams('en') });
      const xml = await response.text();

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      expect(xml).toContain('</urlset>');
    });
  });

  describe('Error handling', () => {
    it('returns 503 status when Sanity CMS is unavailable', async () => {
      mockFetchSanityLive.mockRejectedValueOnce(new Error('CMS unavailable'));

      const response = await GET(mockRequest, { params: createParams('en') });

      expect(response.status).toBe(503);
      expect(response.headers.get('Content-Type')).toBe('text/plain');
    });

    it('returns error message when CMS fetch fails', async () => {
      mockFetchSanityLive.mockRejectedValueOnce(new Error('CMS unavailable'));

      const response = await GET(mockRequest, { params: createParams('en') });
      const text = await response.text();

      expect(text).toContain('Failed to fetch sitemap data');
    });
  });

  describe('Query validation', () => {
    it('uses SITEMAP_WITH_TRANSLATIONS_QUERY with noIndex filter', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [],
        articles: [],
        collections: [],
      });

      await GET(mockRequest, { params: createParams('en') });

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
        articles: [],
        collections: [],
      });

      await GET(mockRequest, { params: createParams('en') });

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
describe('sitemap-[locale].xml property tests', () => {
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
            articles: [],
            collections: [],
          });

          const response = await GET(mockRequest, { params: createParams('en') });
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
      articles: [],
      collections: [],
    });

    await GET(mockRequest, { params: createParams('en') });

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
          articles: [],
          collections: [],
        });

        const enResponse = await GET(mockRequest, { params: createParams('en') });
        const enXml = await enResponse.text();
        // English pages appear without locale prefix (default locale)
        expect(enXml).toContain(`<loc>https://example.com/${slug}</loc>`);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * **Property 29: Non-default locale prefix**
   * Norwegian pages should have /nb prefix in URLs.
   */
  it('Property 29: non-default locale URLs are prefixed', async () => {
    const slugArb = fc.stringMatching(/^[a-z0-9-]+$/).filter((s) => s !== 'index' && s.length > 0);

    await fc.assert(
      fc.asyncProperty(slugArb, async (slug) => {
        mockFetchSanityLive.mockResolvedValueOnce({
          pages: [
            {
              slug,
              lastModified: '2024-01-01T00:00:00Z',
              priority: 0.5,
              language: 'nb',
              translations: [],
            },
          ],
          articles: [],
          collections: [],
        });

        const nbResponse = await GET(mockRequest, { params: createParams('nb') });
        const nbXml = await nbResponse.text();
        // Norwegian pages appear with /nb prefix
        expect(nbXml).toContain(`<loc>https://example.com/nb/${slug}</loc>`);
      }),
      { numRuns: 20 }
    );
  });
});
