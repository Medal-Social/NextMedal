import { describe, expect, it, vi } from 'vitest';

// Mock Sanity live client (must be before processMetadata import)
vi.mock('@/sanity/lib/live', () => ({
  sanityFetch: vi.fn(),
  SanityLive: () => null,
  fetchSanityLive: vi.fn(),
  fetchSanityStatic: vi.fn(),
}));

// Mock the env module (must match actual import path in process-metadata.ts)
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

import processMetadata from '@/lib/sanity/process-metadata';
import resolveUrl from '@/lib/sanity/resolve-url-server';

// Mock resolveUrl (must match actual import path in process-metadata.ts)
vi.mock('@/lib/sanity/resolve-url-server', () => ({
  default: vi.fn(async (page, options) => {
    const slug = page?.metadata?.slug?.current;
    let url = '';
    if (page?._type === 'collection.article') {
      const collectionSlug = page?.collection?.metadata?.slug?.current || 'articles';
      url = `https://example.com/${collectionSlug}/${slug}`;
    } else {
      url = slug === 'index' ? 'https://example.com/' : `https://example.com/${slug}`;
    }

    // Simple mock behavior for params if passed
    if (options?.params) {
      // Just appending for verification, strict logic is in resolveUrl unit tests
      // This mock just ensures we can verify the flow
      return url;
    }
    return url;
  }),
}));

/**
 * processMetadata Unit Tests
 * Tests title/description generation, auto OG image, noIndex robots, article type, canonical URL
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */
describe('processMetadata', () => {
  const createMockPage = (overrides: Partial<Sanity.Page> = {}): Sanity.Page => ({
    _id: 'page-1',
    _type: 'page',
    _createdAt: '2024-01-01T00:00:00Z',
    _updatedAt: '2024-01-01T00:00:00Z',
    _rev: 'rev-1',
    metadata: {
      slug: { current: 'test-page' },
      title: 'Test Page Title',
      description: 'This is a test page description for SEO purposes.',
      noIndex: false,
    },
    ...overrides,
  });

  const createMockArticlePost = (
    overrides: Partial<Sanity.CollectionArticlePost> = {}
  ): Sanity.CollectionArticlePost => ({
    _id: 'article-1',
    _type: 'collection.article',
    _createdAt: '2024-01-01T00:00:00Z',
    _updatedAt: '2024-01-01T00:00:00Z',
    _rev: 'rev-1',
    body: [],
    categories: [],
    authors: [],
    publishDate: '2024-06-15T10:00:00Z',
    metadata: {
      slug: { current: 'test-article-post' },
      title: 'Test Article Title',
      description: 'This is a test article description.',
      noIndex: false,
    },
    collection: {
      _id: 'page-articles',
      metadata: {
        slug: { current: 'articles' },
        title: 'Articles',
      },
    },
    ...overrides,
  });

  describe('Title and Description Generation (Requirement 12.1)', () => {
    it('should return metadata with title from page', async () => {
      const page = createMockPage();
      const result = await processMetadata(page);

      expect(result.title).toBe('Test Page Title');
    });

    it('should return metadata with description from page', async () => {
      const page = createMockPage();
      const result = await processMetadata(page);

      expect(result.description).toBe('This is a test page description for SEO purposes.');
    });

    it('should throw error when page has no metadata or seo', async () => {
      const page = {
        ...createMockPage(),
        metadata: undefined,
        seo: undefined,
      } as unknown as Sanity.Page;

      await expect(processMetadata(page)).rejects.toThrow('Page SEO metadata is required');
    });

    it('should include title in openGraph', async () => {
      const page = createMockPage();
      const result = await processMetadata(page);

      expect(result.openGraph?.title).toBe('Test Page Title');
    });

    it('should include description in openGraph', async () => {
      const page = createMockPage();
      const result = await processMetadata(page);

      expect(result.openGraph?.description).toBe(
        'This is a test page description for SEO purposes.'
      );
    });
  });

  describe('Auto-generated OG Image (Requirement 12.2)', () => {
    it('should generate auto OG image URL when no ogimage provided', async () => {
      const page = createMockPage();
      const result = await processMetadata(page);

      expect(result.openGraph?.images).toBe('https://example.com/api/og?title=Test%20Page%20Title');
    });

    it('should use uploaded ogimage when provided', async () => {
      const page = createMockPage({
        metadata: {
          slug: { current: 'test-page' },
          title: 'Test Page Title',
          description: 'Test description',
          noIndex: false,
          ogimage: 'https://cdn.example.com/custom-og-image.jpg',
        },
      });
      const result = await processMetadata(page);

      expect(result.openGraph?.images).toBe('https://cdn.example.com/custom-og-image.jpg');
    });

    it('should encode special characters in auto-generated OG image URL', async () => {
      const page = createMockPage({
        metadata: {
          slug: { current: 'test-page' },
          title: 'Test & Special "Characters"',
          description: 'Test description',
          noIndex: false,
        },
      });
      const result = await processMetadata(page);

      expect(result.openGraph?.images).toContain('api/og?title=');
      expect(result.openGraph?.images).toContain(encodeURIComponent('Test & Special "Characters"'));
    });
  });

  describe('noIndex Robots Setting (Requirement 12.3)', () => {
    it('should not set robots.index when noIndex is false', async () => {
      const page = createMockPage({
        metadata: {
          slug: { current: 'test-page' },
          title: 'Test Page',
          description: 'Test description',
          noIndex: false,
        },
      });
      const result = await processMetadata(page);
      const robots = result.robots as { index?: boolean } | undefined;

      expect(robots?.index).toBeUndefined();
    });

    it('should set robots.index to false when noIndex is true', async () => {
      const page = createMockPage({
        metadata: {
          slug: { current: 'test-page' },
          title: 'Test Page',
          description: 'Test description',
          noIndex: true,
        },
      });
      const result = await processMetadata(page);
      const robots = result.robots as { index?: boolean } | undefined;

      expect(robots?.index).toBe(false);
    });
  });

  describe('Article OG Type (Requirement 12.4)', () => {
    it('should set openGraph.type to article for articles', async () => {
      const articlePost = createMockArticlePost();
      const result = await processMetadata(articlePost);
      const openGraph = result.openGraph as { type?: string; publishedTime?: string } | undefined;

      expect(openGraph?.type).toBe('article');
    });

    it('should set openGraph.type to website for regular pages', async () => {
      const page = createMockPage();
      const result = await processMetadata(page);
      const openGraph = result.openGraph as { type?: string; publishedTime?: string } | undefined;

      expect(openGraph?.type).toBe('website');
    });

    it('should include publishedTime for articles', async () => {
      const articlePost = createMockArticlePost({
        publishDate: '2024-06-15T10:00:00Z',
      });
      const result = await processMetadata(articlePost);
      const openGraph = result.openGraph as { type?: string; publishedTime?: string } | undefined;

      expect(openGraph?.publishedTime).toBe('2024-06-15T10:00:00Z');
    });

    it('should not include publishedTime for regular pages', async () => {
      const page = createMockPage();
      const result = await processMetadata(page);
      const openGraph = result.openGraph as { type?: string; publishedTime?: string } | undefined;

      expect(openGraph?.publishedTime).toBeUndefined();
    });
  });

  describe('Canonical URL Inclusion (Requirement 12.5)', () => {
    it('should include canonical URL in alternates', async () => {
      const page = createMockPage();
      const result = await processMetadata(page);

      expect(result.alternates?.canonical).toBeDefined();
      expect(result.alternates?.canonical).toBe('https://example.com/test-page');
    });

    it('should include canonical URL for articles', async () => {
      const articlePost = createMockArticlePost();
      const result = await processMetadata(articlePost);

      expect(result.alternates?.canonical).toBeDefined();
      expect(result.alternates?.canonical).toContain('test-article-post');
    });

    it('should include RSS feed type in alternates', async () => {
      const page = createMockPage();
      const result = await processMetadata(page);

      expect(result.alternates?.types).toBeDefined();
      expect(result.alternates?.types?.['application/rss+xml']).toBe('/articles/rss.xml');
    });

    it('should pass searchParams and allowList to resolveUrl', async () => {
      const page = createMockPage();
      const searchParams = { page: '2', category: 'news', ignored: 'value' };
      await processMetadata(page, searchParams);

      expect(resolveUrl).toHaveBeenCalledWith(
        expect.objectContaining({ _id: page._id }),
        expect.objectContaining({
          params: searchParams,
          allowList: ['page', 'category'],
        })
      );
    });
  });

  describe('Metadata Base URL', () => {
    it('should set metadataBase to BASE_URL', async () => {
      const page = createMockPage();
      const result = await processMetadata(page);

      expect(result.metadataBase).toEqual(new URL('https://example.com'));
    });
  });

  describe('OpenGraph URL', () => {
    it('should include url in openGraph', async () => {
      const page = createMockPage();
      const result = await processMetadata(page);

      expect(result.openGraph?.url).toBeDefined();
    });
  });
});
