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

describe('RSS Feed API Contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Response Schema Validation', () => {
    it('response matches RSS 2.0 schema with items', async () => {
      const mockFetch = vi.fn();
      mockWithConfig.mockReturnValue({ fetch: mockFetch } as any);

      // First call: getCollectionPage
      mockFetch.mockResolvedValueOnce({
        _id: 'page-1',
        title: 'Articles',
        slug: 'articles',
        description: 'Our articles',
        frontpageType: 'articles-frontpage',
      });

      // Second call: getCollectionItems
      mockFetch.mockResolvedValueOnce([
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
      const mockFetch = vi.fn();
      mockWithConfig.mockReturnValue({ fetch: mockFetch } as any);

      mockFetch.mockResolvedValueOnce({
        _id: 'page-1',
        title: 'Articles',
        slug: 'articles',
        frontpageType: 'articles-frontpage',
      });
      mockFetch.mockResolvedValueOnce([]);

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });

      expect(response.headers.get('Content-Type')).toContain('application/xml');
    });
  });

  describe('RSS 2.0 Structure', () => {
    it('has XML declaration', async () => {
      const mockFetch = vi.fn();
      mockWithConfig.mockReturnValue({ fetch: mockFetch } as any);

      mockFetch.mockResolvedValueOnce({
        _id: 'page-1',
        title: 'Articles',
        slug: 'articles',
        frontpageType: 'articles-frontpage',
      });
      mockFetch.mockResolvedValueOnce([]);

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });
      const xml = await response.text();

      expect(xml).toMatch(/^<\?xml version="1\.0"/);
    });

    it('has XSL stylesheet reference', async () => {
      const mockFetch = vi.fn();
      mockWithConfig.mockReturnValue({ fetch: mockFetch } as any);

      mockFetch.mockResolvedValueOnce({
        _id: 'page-1',
        title: 'Articles',
        slug: 'articles',
        frontpageType: 'articles-frontpage',
      });
      mockFetch.mockResolvedValueOnce([]);

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });
      const xml = await response.text();

      expect(xml).toContain('<?xml-stylesheet');
      expect(xml).toContain('rss.xsl');
    });

    it('has Atom namespace for self link', async () => {
      const mockFetch = vi.fn();
      mockWithConfig.mockReturnValue({ fetch: mockFetch } as any);

      mockFetch.mockResolvedValueOnce({
        _id: 'page-1',
        title: 'Articles',
        slug: 'articles',
        frontpageType: 'articles-frontpage',
      });
      mockFetch.mockResolvedValueOnce([]);

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
      const mockFetch = vi.fn();
      mockWithConfig.mockReturnValue({ fetch: mockFetch } as any);

      mockFetch.mockResolvedValueOnce({
        _id: 'page-1',
        title: 'Tech Articles',
        slug: 'articles',
        description: 'Latest tech updates',
        frontpageType: 'articles-frontpage',
      });
      mockFetch.mockResolvedValueOnce([]);

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
      const mockFetch = vi.fn();
      mockWithConfig.mockReturnValue({ fetch: mockFetch } as any);

      mockFetch.mockResolvedValueOnce({
        _id: 'page-1',
        title: 'My Awesome Articles',
        slug: 'articles',
        frontpageType: 'articles-frontpage',
      });
      mockFetch.mockResolvedValueOnce([]);

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });
      const xml = await response.text();

      expect(xml).toContain('<title>My Awesome Articles</title>');
    });
  });

  describe('Item Elements', () => {
    it('items have required RSS elements', async () => {
      const mockFetch = vi.fn();
      mockWithConfig.mockReturnValue({ fetch: mockFetch } as any);

      mockFetch.mockResolvedValueOnce({
        _id: 'page-1',
        title: 'Articles',
        slug: 'articles',
        frontpageType: 'articles-frontpage',
      });
      mockFetch.mockResolvedValueOnce([
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
      const mockFetch = vi.fn();
      mockWithConfig.mockReturnValue({ fetch: mockFetch } as any);

      mockFetch.mockResolvedValueOnce({
        _id: 'page-1',
        title: 'Articles',
        slug: 'articles',
        frontpageType: 'articles-frontpage',
      });
      mockFetch.mockResolvedValueOnce([
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
      const mockFetch = vi.fn();
      mockWithConfig.mockReturnValue({ fetch: mockFetch } as any);

      mockFetch.mockResolvedValueOnce(null);

      const response = await GET(new Request('http://localhost:3000/en/about/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'about' }),
      });

      expect(response.status).toBe(404);
    });

    it('error response is still valid RSS', async () => {
      const mockFetch = vi.fn();
      mockWithConfig.mockReturnValue({ fetch: mockFetch } as any);

      mockFetch.mockRejectedValueOnce(new Error('CMS unavailable'));

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });
      const xml = await response.text();

      expect(response.status).toBe(503);

      const result = RssErrorResponseSchema.safeParse(xml);
      expect(result.success).toBe(true);
    });

    it('503 response has Retry-After header', async () => {
      const mockFetch = vi.fn();
      mockWithConfig.mockReturnValue({ fetch: mockFetch } as any);

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });

      expect(response.status).toBe(503);
      expect(response.headers.get('Retry-After')).toBe('300');
    });
  });

  describe('Backward Compatibility', () => {
    it('maintains RSS 2.0 version attribute', async () => {
      const mockFetch = vi.fn();
      mockWithConfig.mockReturnValue({ fetch: mockFetch } as any);

      mockFetch.mockResolvedValueOnce({
        _id: 'page-1',
        title: 'Articles',
        slug: 'articles',
        frontpageType: 'articles-frontpage',
      });
      mockFetch.mockResolvedValueOnce([]);

      const response = await GET(new Request('http://localhost:3000/en/articles/rss.xml'), {
        params: Promise.resolve({ locale: 'en', collection: 'articles' }),
      });
      const xml = await response.text();

      expect(xml).toContain('<rss version="2.0"');
    });
  });
});
