import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RssErrorResponseSchema, RssFeedResponseSchema } from './schemas/rss.schema';

// Mock external dependencies
vi.mock('@/lib/core/logger', () => ({
  logger: { error: vi.fn() },
}));

vi.mock('@/sanity/lib/client', () => ({
  client: {
    fetch: vi.fn(),
    withConfig: vi.fn(() => ({
      fetch: vi.fn(),
    })),
  },
}));

import { GET } from '@/app/(frontend)/[locale]/[collection]/rss.xml/route';
import { client } from '@/sanity/lib/client';

const mockWithConfig = vi.mocked(client.withConfig);

// The route's `getCollectionInfo` is synchronous (looks up a static registry),
// so the only Sanity call is `getCollectionItems`. Tests previously mocked a
// non-existent first "getCollectionPage" fetch which then consumed the items
// payload — leaving the real items call returning undefined. This helper
// makes mocking less error-prone.
function mockItems(items: unknown[]) {
  const mockFetch = vi.fn().mockResolvedValueOnce(items);
  mockWithConfig.mockReturnValue({ fetch: mockFetch } as any);
  return mockFetch;
}

describe('RSS Feed API Contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Response Schema Validation', () => {
    it('response matches RSS 2.0 schema with items', async () => {
      mockItems([
        {
          _id: 'post-1',
          title: 'First Post',
          slug: 'first-post',
          description: 'A great post',
          publishDate: '2025-01-15T10:00:00Z',
          authors: [{ name: 'John Doe' }],
          categories: [{ title: 'Tech' }],
        },
      ]);

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });
      const xml = await response.text();

      const result = RssFeedResponseSchema.safeParse(xml);

      if (!result.success) {
        console.error('Schema validation errors:', result.error.format());
      }

      expect(result.success).toBe(true);
    });

    it('returns application/xml content type', async () => {
      mockItems([]);

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });

      expect(response.headers.get('Content-Type')).toContain('application/xml');
    });
  });

  describe('RSS 2.0 Structure', () => {
    it('has XML declaration', async () => {
      mockItems([]);

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });
      const xml = await response.text();

      expect(xml).toMatch(/^<\?xml version="1\.0"/);
    });

    it('has XSL stylesheet reference', async () => {
      mockItems([]);

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });
      const xml = await response.text();

      expect(xml).toContain('<?xml-stylesheet');
      expect(xml).toContain('rss.xsl');
    });

    it('has Atom namespace for self link', async () => {
      mockItems([]);

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });
      const xml = await response.text();

      expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
      expect(xml).toContain('<atom:link');
    });
  });

  describe('Channel Elements', () => {
    it('channel has required elements', async () => {
      mockItems([]);

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });
      const xml = await response.text();

      expect(xml).toContain('<title>');
      expect(xml).toContain('<link>');
      expect(xml).toContain('<description>');
      expect(xml).toContain('<language>');
      expect(xml).toContain('<lastBuildDate>');
    });

    it('channel title uses collection title', async () => {
      mockItems([]);

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });
      const xml = await response.text();

      // Title comes from the static collection registry, not from a CMS fetch.
      // For `articles`, the registry name is "Articles".
      expect(xml).toContain('<title>Articles</title>');
    });
  });

  describe('Item Elements', () => {
    it('items have required RSS elements', async () => {
      mockItems([
        {
          _id: 'post-1',
          title: 'Great Article',
          slug: 'great-article',
          description: 'Summary here',
          publishDate: '2025-01-15T10:00:00Z',
        },
      ]);

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });
      const xml = await response.text();

      expect(xml).toContain('<item>');
      expect(xml).toContain('<title>Great Article</title>');
      expect(xml).toContain('<link>');
      expect(xml).toContain('<guid');
      expect(xml).toContain('<pubDate>');
    });

    it('guid has isPermaLink attribute', async () => {
      mockItems([
        {
          _id: 'post-1',
          title: 'Post',
          slug: 'post',
          publishDate: '2025-01-15T10:00:00Z',
        },
      ]);

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });
      const xml = await response.text();

      expect(xml).toContain('<guid isPermaLink="true">');
    });
  });

  describe('Error Responses', () => {
    it('returns 404 for non-collection pages', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce(null);
      mockWithConfig.mockReturnValue({ fetch: mockFetch } as any);

      const response = await GET(new Request('http://localhost:3000/en/about/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'about' }),
      });

      expect(response.status).toBe(404);
    });

    it('error response is still valid RSS', async () => {
      const mockFetch = vi.fn().mockRejectedValueOnce(new Error('CMS unavailable'));
      mockWithConfig.mockReturnValue({ fetch: mockFetch } as any);

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });
      const xml = await response.text();

      expect(response.status).toBe(503);

      const result = RssErrorResponseSchema.safeParse(xml);
      expect(result.success).toBe(true);
    });

    it('503 response has Retry-After header', async () => {
      const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
      mockWithConfig.mockReturnValue({ fetch: mockFetch } as any);

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });

      expect(response.status).toBe(503);
      expect(response.headers.get('Retry-After')).toBe('300');
    });
  });

  describe('Backward Compatibility', () => {
    it('maintains RSS 2.0 version attribute', async () => {
      mockItems([]);

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });
      const xml = await response.text();

      expect(xml).toContain('<rss version="2.0"');
    });
  });
});
