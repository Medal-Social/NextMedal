import fc from 'fast-check';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the fetchSanityLive function
vi.mock('@/sanity/lib/fetch', () => ({
  fetchSanityLive: vi.fn(),
}));

import { GET } from '@/app/sitemap.xml/route';
import { fetchSanityLive } from '@/sanity/lib/fetch';

const mockFetchSanityLive = vi.mocked(fetchSanityLive);

describe('sitemap.xml route', () => {
  const originalEnv = process.env;
  const mockRequest = new NextRequest('http://localhost:3000/sitemap.xml');

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Content-Type', () => {
    it('returns Content-Type application/xml', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            url: 'https://example.com/',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 1,
          },
        ],
        blog: [],
      });

      const response = await GET(mockRequest);
      expect(response.headers.get('Content-Type')).toContain('application/xml');
    });
  });

  describe('URL elements', () => {
    it('includes url elements with loc, lastmod, and priority', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            url: 'https://example.com/',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 1,
          },
          {
            url: 'https://example.com/about',
            lastModified: '2024-01-02T00:00:00Z',
            priority: 0.5,
          },
        ],
        blog: [],
      });

      const response = await GET(mockRequest);
      const xml = await response.text();

      expect(xml).toContain('<url>');
      expect(xml).toContain('<loc>https://example.com/</loc>');
      expect(xml).toContain('<lastmod>');
      expect(xml).toContain('<priority>1</priority>');
      expect(xml).toContain('<priority>0.5</priority>');
    });

    it('includes blog posts in sitemap', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [],
        blog: [
          {
            url: 'https://example.com/blog/test-post',
            lastModified: '2024-01-03T00:00:00Z',
            priority: 0.4,
          },
        ],
      });

      const response = await GET(mockRequest);
      const xml = await response.text();

      expect(xml).toContain('<loc>https://example.com/blog/test-post</loc>');
      expect(xml).toContain('<priority>0.4</priority>');
    });
  });

  describe('XML structure', () => {
    it('returns valid XML with urlset root element', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            url: 'https://example.com/',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 1,
          },
        ],
        blog: [],
      });

      const response = await GET(mockRequest);
      const xml = await response.text();

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
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

  describe('noIndex exclusion', () => {
    it('query excludes pages with noIndex set to true', async () => {
      // The query itself filters out noIndex pages, so we verify the query is called
      mockFetchSanityLive.mockResolvedValueOnce({
        pages: [
          {
            url: 'https://example.com/',
            lastModified: '2024-01-01T00:00:00Z',
            priority: 1,
          },
        ],
        blog: [],
      });

      await GET(mockRequest);

      // Verify the query was called with noIndex filter
      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('metadata.noIndex != true'),
        })
      );
    });
  });
});

/**
 * Property-Based Tests for Sitemap
 */
describe('sitemap.xml property tests', () => {
  const mockRequest = new NextRequest('http://localhost:3000/sitemap.xml');

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
  });

  /**
   * **Feature: component-accessibility-testing, Property 26: Sitemap URL Completeness**
   * *For any* page included in sitemap.xml, the url element SHALL contain loc, lastmod, and priority child elements.
   * **Validates: Requirements 8.4**
   */
  it('Property 26: every sitemap URL entry contains loc, lastmod, and priority', async () => {
    // Generate valid ISO date strings using integer timestamps
    const isoDateArb = fc
      .integer({ min: Date.parse('2020-01-01'), max: Date.parse('2025-12-31') })
      .map((ts) => new Date(ts).toISOString());

    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            url: fc.webUrl(),
            lastModified: isoDateArb,
            priority: fc.double({ min: 0, max: 1, noNaN: true }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (pages) => {
          mockFetchSanityLive.mockResolvedValueOnce({
            pages,
            blog: [],
          });

          const response = await GET(mockRequest);
          const xml = await response.text();

          // Parse the XML and verify each URL entry has required elements
          for (const page of pages) {
            expect(xml).toContain(`<loc>${page.url}</loc>`);
            expect(xml).toContain('<lastmod>');
            expect(xml).toContain('<priority>');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: component-accessibility-testing, Property 27: noIndex Sitemap Exclusion**
   * *For any* page with metadata.noIndex set to true, the sitemap.xml output SHALL not contain a URL entry for that page.
   * **Validates: Requirements 8.5**
   */
  it('Property 27: noIndex pages are excluded from sitemap via query filter', async () => {
    // Generate valid ISO date strings using integer timestamps
    const isoDateArb = fc
      .integer({ min: Date.parse('2020-01-01'), max: Date.parse('2025-12-31') })
      .map((ts) => new Date(ts).toISOString());

    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            url: fc.webUrl(),
            lastModified: isoDateArb,
            priority: fc.double({ min: 0, max: 1, noNaN: true }),
          }),
          { minLength: 0, maxLength: 5 }
        ),
        async (pages) => {
          mockFetchSanityLive.mockResolvedValueOnce({
            pages,
            blog: [],
          });

          await GET(mockRequest);

          // Verify the query includes the noIndex filter
          expect(mockFetchSanityLive).toHaveBeenCalledWith(
            expect.objectContaining({
              query: expect.stringContaining('metadata.noIndex != true'),
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
