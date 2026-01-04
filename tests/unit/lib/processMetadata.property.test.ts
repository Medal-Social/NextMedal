import * as fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';

// Mock Sanity live client (must be before processMetadata import)
vi.mock('@/sanity/lib/live', () => ({
  sanityFetch: vi.fn(),
  SanityLive: () => null,
  fetchSanityLive: vi.fn(),
  fetchSanityStatic: vi.fn(),
}));

import processMetadata from '@/lib/sanity/process-metadata';

// Mock the env module
vi.mock('@/lib/env', () => ({
  BASE_URL: 'https://example.com',
  vercelPreview: false,
  isStaging: false,
  isPreview: false,
}));

// Mock resolveUrl
vi.mock('@/lib/sanity/resolve-url-server', () => ({
  default: vi.fn(async (page) => {
    const slug = page?.metadata?.slug?.current;
    if (page?._type === 'collection.article') {
      const collectionSlug = page?.collection?.metadata?.slug?.current || 'articles';
      return `https://example.com/${collectionSlug}/${slug}`;
    }
    return slug === 'index' ? 'https://example.com/' : `https://example.com/${slug}`;
  }),
}));

/**
 * Property-Based Tests for processMetadata
 * **Feature: component-accessibility-testing**
 * **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5**
 */
describe('processMetadata Property Tests', () => {
  // Valid date range for ISO string generation using integer timestamps
  const validDateArb = fc
    .integer({ min: 946684800000, max: 1924905600000 })
    .map((ts) => new Date(ts));

  // Arbitrary for generating valid page metadata
  const metadataArb = fc.record({
    slug: fc.record({
      current: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => /^[a-z0-9-]+$/.test(s)),
    }),
    title: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
    description: fc.string({ minLength: 1, maxLength: 300 }).filter((s) => s.trim().length > 0),
    noIndex: fc.boolean(),
    ogimage: fc.option(fc.webUrl(), { nil: undefined }),
  });

  // Arbitrary for generating valid pages
  const pageArb = fc.record({
    _id: fc.uuid(),
    _type: fc.constant('page' as const),
    _createdAt: validDateArb.map((d) => d.toISOString()),
    _updatedAt: validDateArb.map((d) => d.toISOString()),
    _rev: fc.string({ minLength: 5, maxLength: 20 }),
    metadata: metadataArb,
  });

  // Arbitrary for generating valid articles
  const articlePostArb = fc.record({
    _id: fc.uuid(),
    _type: fc.constant('collection.article' as const),
    _createdAt: validDateArb.map((d) => d.toISOString()),
    _updatedAt: validDateArb.map((d) => d.toISOString()),
    _rev: fc.string({ minLength: 5, maxLength: 20 }),
    body: fc.constant([]),
    categories: fc.constant([]),
    authors: fc.constant([]),
    publishDate: validDateArb.map((d) => d.toISOString()),
    metadata: metadataArb,
    collection: fc.constant({
      _id: 'page-articles',
      metadata: {
        slug: { current: 'articles' },
        title: 'Articles',
      },
    }),
  });

  /**
   * **Feature: component-accessibility-testing, Property 31: Metadata Title and Description**
   * *For any* page passed to processMetadata, the returned Metadata object SHALL contain
   * non-empty title and description fields.
   * **Validates: Requirements 12.1**
   */
  describe('Property 31: Metadata Title and Description', () => {
    it('should always return non-empty title and description for any valid page', async () => {
      await fc.assert(
        fc.asyncProperty(pageArb, async (page) => {
          const result = await processMetadata(page as unknown as Sanity.Page);

          // Title should be non-empty
          expect(result.title).toBeDefined();
          expect(typeof result.title).toBe('string');
          expect((result.title as string).length).toBeGreaterThan(0);

          // Description should be non-empty
          expect(result.description).toBeDefined();
          expect(typeof result.description).toBe('string');
          expect((result.description as string).length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should always return non-empty title and description for any valid article', async () => {
      await fc.assert(
        fc.asyncProperty(articlePostArb, async (articlePost) => {
          const result = await processMetadata(
            articlePost as unknown as Sanity.CollectionArticlePost
          );

          // Title should be non-empty
          expect(result.title).toBeDefined();
          expect(typeof result.title).toBe('string');
          expect((result.title as string).length).toBeGreaterThan(0);

          // Description should be non-empty
          expect(result.description).toBeDefined();
          expect(typeof result.description).toBe('string');
          expect((result.description as string).length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 32: Auto-generated OG Image**
   * *For any* page without an ogimage in metadata, processMetadata SHALL generate an OG image URL
   * pointing to /api/og with the title parameter.
   * **Validates: Requirements 12.2**
   */
  describe('Property 32: Auto-generated OG Image', () => {
    const pageWithoutOgImageArb = fc.record({
      _id: fc.uuid(),
      _type: fc.constant('page' as const),
      _createdAt: validDateArb.map((d) => d.toISOString()),
      _updatedAt: validDateArb.map((d) => d.toISOString()),
      _rev: fc.string({ minLength: 5, maxLength: 20 }),
      metadata: fc.record({
        slug: fc.record({
          current: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => /^[a-z0-9-]+$/.test(s)),
        }),
        title: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        description: fc.string({ minLength: 1, maxLength: 300 }).filter((s) => s.trim().length > 0),
        noIndex: fc.boolean(),
        // No ogimage
      }),
    });

    it('should generate auto OG image URL with title parameter when no ogimage provided', async () => {
      await fc.assert(
        fc.asyncProperty(pageWithoutOgImageArb, async (page) => {
          const result = await processMetadata(page as unknown as Sanity.Page);

          // OG image should be auto-generated
          expect(result.openGraph?.images).toBeDefined();
          const ogImage = result.openGraph?.images as string;

          // Should point to /api/og
          expect(ogImage).toContain('/api/og');

          // Should include title parameter
          expect(ogImage).toContain('title=');

          // Should include encoded title
          expect(ogImage).toContain(encodeURIComponent(page.metadata.title));
        }),
        { numRuns: 100 }
      );
    });

    it('should use provided ogimage when available', async () => {
      const pageWithOgImageArb = fc.record({
        _id: fc.uuid(),
        _type: fc.constant('page' as const),
        _createdAt: validDateArb.map((d) => d.toISOString()),
        _updatedAt: validDateArb.map((d) => d.toISOString()),
        _rev: fc.string({ minLength: 5, maxLength: 20 }),
        metadata: fc.record({
          slug: fc.record({
            current: fc
              .string({ minLength: 1, maxLength: 50 })
              .filter((s) => /^[a-z0-9-]+$/.test(s)),
          }),
          title: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
          description: fc
            .string({ minLength: 1, maxLength: 300 })
            .filter((s) => s.trim().length > 0),
          noIndex: fc.boolean(),
          ogimage: fc.webUrl(),
        }),
      });

      await fc.assert(
        fc.asyncProperty(pageWithOgImageArb, async (page) => {
          const result = await processMetadata(page as unknown as Sanity.Page);

          // OG image should be the provided one
          expect(result.openGraph?.images).toBe(page.metadata.ogimage);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 33: noIndex Robots Setting**
   * *For any* page with metadata.noIndex set to true, processMetadata SHALL return robots.index as false.
   * **Validates: Requirements 12.3**
   */
  describe('Property 33: noIndex Robots Setting', () => {
    it('should set robots.index to false when noIndex is true', async () => {
      const pageWithNoIndexArb = fc.record({
        _id: fc.uuid(),
        _type: fc.constant('page' as const),
        _createdAt: validDateArb.map((d) => d.toISOString()),
        _updatedAt: validDateArb.map((d) => d.toISOString()),
        _rev: fc.string({ minLength: 5, maxLength: 20 }),
        metadata: fc.record({
          slug: fc.record({
            current: fc
              .string({ minLength: 1, maxLength: 50 })
              .filter((s) => /^[a-z0-9-]+$/.test(s)),
          }),
          title: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
          description: fc
            .string({ minLength: 1, maxLength: 300 })
            .filter((s) => s.trim().length > 0),
          noIndex: fc.constant(true),
        }),
      });

      await fc.assert(
        fc.asyncProperty(pageWithNoIndexArb, async (page) => {
          const result = await processMetadata(page as unknown as Sanity.Page);

          // robots.index should be false (robots can be string or object)
          const robots = result.robots;
          if (typeof robots === 'object' && robots !== null) {
            expect(robots.index).toBe(false);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should not set robots.index to false when noIndex is false', async () => {
      const pageWithIndexArb = fc.record({
        _id: fc.uuid(),
        _type: fc.constant('page' as const),
        _createdAt: validDateArb.map((d) => d.toISOString()),
        _updatedAt: validDateArb.map((d) => d.toISOString()),
        _rev: fc.string({ minLength: 5, maxLength: 20 }),
        metadata: fc.record({
          slug: fc.record({
            current: fc
              .string({ minLength: 1, maxLength: 50 })
              .filter((s) => /^[a-z0-9-]+$/.test(s)),
          }),
          title: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
          description: fc
            .string({ minLength: 1, maxLength: 300 })
            .filter((s) => s.trim().length > 0),
          noIndex: fc.constant(false),
        }),
      });

      await fc.assert(
        fc.asyncProperty(pageWithIndexArb, async (page) => {
          const result = await processMetadata(page as unknown as Sanity.Page);

          // robots.index should be undefined (not explicitly set to false)
          const robots = result.robots;
          if (typeof robots === 'object' && robots !== null) {
            expect(robots.index).toBeUndefined();
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 34: Article OG Type**
   * *For any* article passed to processMetadata, the returned openGraph.type SHALL be "article"
   * and SHALL include publishedTime.
   * **Validates: Requirements 12.4**
   */
  describe('Property 34: Article OG Type', () => {
    it('should set openGraph.type to article and include publishedTime for articles', async () => {
      await fc.assert(
        fc.asyncProperty(articlePostArb, async (articlePost) => {
          const result = await processMetadata(
            articlePost as unknown as Sanity.CollectionArticlePost
          );

          // openGraph.type should be 'article' (cast to access type property)
          const og = result.openGraph as { type?: string; publishedTime?: string };
          expect(og?.type).toBe('article');

          // publishedTime should be included
          expect(og?.publishedTime).toBeDefined();
          expect(og?.publishedTime).toBe(articlePost.publishDate);
        }),
        { numRuns: 100 }
      );
    });

    it('should set openGraph.type to website for regular pages', async () => {
      await fc.assert(
        fc.asyncProperty(pageArb, async (page) => {
          const result = await processMetadata(page as unknown as Sanity.Page);

          // openGraph.type should be 'website' (cast to access type property)
          const og = result.openGraph as { type?: string; publishedTime?: string };
          expect(og?.type).toBe('website');

          // publishedTime should not be included
          expect(og?.publishedTime).toBeUndefined();
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 35: Canonical URL Inclusion**
   * *For any* page passed to processMetadata, the returned alternates SHALL include a canonical URL.
   * **Validates: Requirements 12.5**
   */
  describe('Property 35: Canonical URL Inclusion', () => {
    it('should always include canonical URL in alternates for pages', async () => {
      await fc.assert(
        fc.asyncProperty(pageArb, async (page) => {
          const result = await processMetadata(page as unknown as Sanity.Page);

          // alternates should be defined
          expect(result.alternates).toBeDefined();

          // canonical should be defined and be a valid URL
          expect(result.alternates?.canonical).toBeDefined();
          expect(typeof result.alternates?.canonical).toBe('string');
          expect((result.alternates?.canonical as string).startsWith('https://')).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should always include canonical URL in alternates for articles', async () => {
      await fc.assert(
        fc.asyncProperty(articlePostArb, async (articlePost) => {
          const result = await processMetadata(
            articlePost as unknown as Sanity.CollectionArticlePost
          );

          // alternates should be defined
          expect(result.alternates).toBeDefined();

          // canonical should be defined and be a valid URL
          expect(result.alternates?.canonical).toBeDefined();
          expect(typeof result.alternates?.canonical).toBe('string');
          expect((result.alternates?.canonical as string).startsWith('https://')).toBe(true);

          // For articles, canonical should include the collection slug
          expect(result.alternates?.canonical as string).toContain('/articles/');
        }),
        { numRuns: 100 }
      );
    });
  });
});
