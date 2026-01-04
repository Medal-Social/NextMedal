import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock functions need to be declared before vi.mock calls
const mockLoggerError = vi.fn();

vi.mock('next-sanity', () => ({
  groq: (strings: TemplateStringsArray, ...values: unknown[]) =>
    strings.reduce((acc, str, i) => acc + str + (values[i] || ''), ''),
}));

vi.mock('@/lib/core/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
  },
}));

vi.mock('@/sanity/lib/fetch', () => ({
  fetchSanityLive: vi.fn(),
}));

vi.mock('@/lib/sanity/resolve-url-server', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/collections/registry', () => ({
  getCollectionTypeFromSlug: vi.fn(),
}));

vi.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'nb', 'ar'],
    defaultLocale: 'en',
  },
}));

import { getCollectionTypeFromSlug } from '@/lib/collections/registry';
import resolveUrl from '@/lib/sanity/resolve-url-server';
// Import after mocks
import { findAvailableTranslation } from '@/lib/sanity/translation-detector';
import { fetchSanityLive } from '@/sanity/lib/fetch';

describe('Translation Detector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parsePathname and URL building', () => {
    it('should detect homepage (root path)', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      // Mock homepage translations query
      mockFetchSanityLive.mockResolvedValueOnce([
        { language: 'nb', slug: 'index', _type: 'page' },
        { language: 'ar', slug: 'index', _type: 'page' },
      ]);

      // Mock URL building - called for each locale (en, nb, ar)
      mockResolveUrl.mockReturnValueOnce('/'); // en
      mockResolveUrl.mockReturnValueOnce('/nb'); // nb
      mockResolveUrl.mockReturnValueOnce('/ar'); // ar

      const result = await findAvailableTranslation('/', 'en', 'nb');

      expect(result.found).toBe(true);
      expect(result.redirectUrl).toBe('/nb');
      expect(result.strategy).toBe('exact-match');
      expect(result.availableLocales).toHaveLength(3); // en, nb, ar
    });

    it('should detect locale prefix in pathname', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce({
        _type: 'page',
        language: 'nb',
        metadata: { slug: { current: 'om' } },
        translations: [{ language: 'en', slug: 'about', _type: 'page' }],
      });

      mockResolveUrl.mockReturnValueOnce('/nb/om');
      mockResolveUrl.mockReturnValueOnce('/about');

      const result = await findAvailableTranslation('/nb/om', 'nb', 'en');

      expect(result.found).toBe(true);
      expect(result.redirectUrl).toBe('/about');
      expect(result.strategy).toBe('exact-match');
    });

    it('should handle collection paths correctly', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);
      const mockGetCollectionTypeFromSlug = vi.mocked(getCollectionTypeFromSlug);

      // Mock collection detection
      mockGetCollectionTypeFromSlug.mockReturnValue('collection.article');

      // Mock collection translations query
      mockFetchSanityLive.mockResolvedValueOnce([
        { language: 'en', slug: 'my-post', _type: 'collection.article' },
        { language: 'nb', slug: 'my-post', _type: 'collection.article' },
      ]);

      mockResolveUrl.mockReturnValueOnce('/articles/my-post');
      mockResolveUrl.mockReturnValueOnce('/nb/artikler/my-post');

      const result = await findAvailableTranslation('/articles/my-post', 'en', 'nb');

      expect(result.found).toBe(true);
      expect(result.redirectUrl).toBe('/nb/artikler/my-post');
      expect(result.strategy).toBe('exact-match');
    });
  });

  describe('Page translations (translation.metadata)', () => {
    it('should find translations for regular page', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce({
        _type: 'page',
        language: 'en',
        metadata: { slug: { current: 'about' } },
        translations: [
          { language: 'nb', slug: 'om', _type: 'page' },
          { language: 'ar', slug: 'about', _type: 'page' },
        ],
      });

      mockResolveUrl.mockReturnValueOnce('/about');
      mockResolveUrl.mockReturnValueOnce('/nb/om');
      mockResolveUrl.mockReturnValueOnce('/ar/about');

      const result = await findAvailableTranslation('/about', 'en', 'nb');

      expect(result.found).toBe(true);
      expect(result.availableLocales).toHaveLength(3);
      expect(result.availableLocales.map((l) => l.locale)).toContain('nb');
      expect(result.redirectUrl).toBe('/nb/om');
    });

    it('should return not-found when no translations exist', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce({
        _type: 'page',
        language: 'en',
        metadata: { slug: { current: 'about' } },
        translations: [],
      });

      mockResolveUrl.mockReturnValueOnce('/about');

      const result = await findAvailableTranslation('/about', 'en', 'nb');

      expect(result.found).toBe(false);
      expect(result.strategy).toBe('not-found');
      expect(result.availableLocales).toHaveLength(0); // Excludes current locale
    });

    it('should handle page with no metadata', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);

      mockFetchSanityLive.mockResolvedValueOnce(undefined);

      const result = await findAvailableTranslation('/nonexistent', 'en', 'nb');

      expect(result.found).toBe(false);
      expect(result.availableLocales).toHaveLength(0);
    });
  });

  describe('Collection translations (same slug, different locales)', () => {
    it('should find collection items in multiple locales', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);
      const mockGetCollectionTypeFromSlug = vi.mocked(getCollectionTypeFromSlug);

      mockGetCollectionTypeFromSlug.mockReturnValue('collection.article');

      mockFetchSanityLive.mockResolvedValueOnce([
        { language: 'en', slug: 'seo-guide', _type: 'collection.article' },
        { language: 'nb', slug: 'seo-guide', _type: 'collection.article' },
      ]);

      mockResolveUrl.mockReturnValueOnce('/articles/seo-guide');
      mockResolveUrl.mockReturnValueOnce('/nb/artikler/seo-guide');

      const result = await findAvailableTranslation('/articles/seo-guide', 'en', 'nb');

      expect(result.found).toBe(true);
      expect(result.availableLocales).toHaveLength(2);
    });

    it('should handle collection item that exists in one locale only', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);
      const mockGetCollectionTypeFromSlug = vi.mocked(getCollectionTypeFromSlug);

      mockGetCollectionTypeFromSlug.mockReturnValue('collection.documentation');

      mockFetchSanityLive.mockResolvedValueOnce([
        { language: 'en', slug: 'advanced-guide', _type: 'collection.documentation' },
      ]);

      mockResolveUrl.mockReturnValueOnce('/docs/advanced-guide');

      const result = await findAvailableTranslation('/docs/advanced-guide', 'en', 'nb');

      expect(result.found).toBe(false);
      expect(result.availableLocales).toHaveLength(0); // Excludes current locale
    });

    it('should handle different collection types', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);
      const mockGetCollectionTypeFromSlug = vi.mocked(getCollectionTypeFromSlug);

      // Test changelog collection
      mockGetCollectionTypeFromSlug.mockReturnValue('collection.changelog');

      mockFetchSanityLive.mockResolvedValueOnce([
        { language: 'en', slug: 'v2-release', _type: 'collection.changelog' },
        { language: 'nb', slug: 'v2-release', _type: 'collection.changelog' },
        { language: 'ar', slug: 'v2-release', _type: 'collection.changelog' },
      ]);

      mockResolveUrl.mockReturnValue('/changelog/v2-release');

      const result = await findAvailableTranslation('/changelog/v2-release', 'en', 'ar');

      expect(result.found).toBe(true);
      expect(result.availableLocales).toHaveLength(3);
    });
  });

  describe('Homepage special handling', () => {
    it('should use homepage query for index pages', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce([
        { language: 'nb', slug: 'index', _type: 'page' },
        { language: 'ar', slug: 'index', _type: 'page' },
      ]);

      mockResolveUrl.mockReturnValueOnce('/');
      mockResolveUrl.mockReturnValueOnce('/nb');
      mockResolveUrl.mockReturnValueOnce('/ar');

      const result = await findAvailableTranslation('/', 'en', 'nb');

      expect(result.found).toBe(true);
      expect(result.redirectUrl).toBe('/nb');
      expect(result.availableLocales).toHaveLength(3);
    });

    it('should handle /en homepage path', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce([
        { language: 'nb', slug: 'index', _type: 'page' },
        { language: 'ar', slug: 'index', _type: 'page' },
      ]);

      mockResolveUrl.mockReturnValueOnce('/');
      mockResolveUrl.mockReturnValueOnce('/nb');
      mockResolveUrl.mockReturnValueOnce('/ar');

      const result = await findAvailableTranslation('/en', 'en', 'nb');

      expect(result.found).toBe(true);
    });
  });

  describe('URL building', () => {
    it('should build correct URLs for each locale', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce({
        _type: 'page',
        language: 'en',
        metadata: { slug: { current: 'pricing' } },
        translations: [
          { language: 'nb', slug: 'priser', _type: 'page' },
          { language: 'ar', slug: 'pricing', _type: 'page' },
        ],
      });

      // Mock URL building for each locale
      mockResolveUrl.mockReturnValueOnce('/pricing'); // en
      mockResolveUrl.mockReturnValueOnce('/nb/priser'); // nb
      mockResolveUrl.mockReturnValueOnce('/ar/pricing'); // ar

      const result = await findAvailableTranslation('/pricing', 'en', 'nb');

      expect(result.availableLocales).toEqual([
        { locale: 'en', url: '/pricing' },
        { locale: 'nb', url: '/nb/priser' },
        { locale: 'ar', url: '/ar/pricing' },
      ]);
    });

    it('should filter out duplicates', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce({
        _type: 'page',
        language: 'en',
        metadata: { slug: { current: 'test' } },
        translations: [
          { language: 'en', slug: 'test', _type: 'page' }, // Duplicate
          { language: 'nb', slug: 'test', _type: 'page' },
        ],
      });

      mockResolveUrl.mockReturnValueOnce('/test');
      mockResolveUrl.mockReturnValueOnce('/nb/test');

      const result = await findAvailableTranslation('/test', 'en', 'nb');

      // Should have only 2 locales (duplicates removed)
      expect(result.availableLocales).toHaveLength(2);
      expect(result.availableLocales.filter((l) => l.locale === 'en')).toHaveLength(1);
    });

    it('should exclude current locale from availableLocales when not found', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce({
        _type: 'page',
        language: 'en',
        metadata: { slug: { current: 'test' } },
        translations: [{ language: 'ar', slug: 'test', _type: 'page' }],
      });

      mockResolveUrl.mockReturnValueOnce('/test');
      mockResolveUrl.mockReturnValueOnce('/ar/test');

      const result = await findAvailableTranslation('/test', 'en', 'nb');

      // Should not include 'en' in available locales since target is 'nb' which doesn't exist
      expect(result.found).toBe(false);
      expect(result.availableLocales.map((l) => l.locale)).not.toContain('en');
      expect(result.availableLocales).toHaveLength(1); // Only ar
    });
  });

  describe('Error handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);

      mockFetchSanityLive.mockRejectedValueOnce(new Error('Network error'));

      const result = await findAvailableTranslation('/error-page', 'en', 'nb');

      expect(result.found).toBe(false);
      expect(result.availableLocales).toHaveLength(0);
    });

    it('should handle null/undefined responses', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockGetCollectionTypeFromSlug = vi.mocked(getCollectionTypeFromSlug);

      mockGetCollectionTypeFromSlug.mockReturnValue(null as any);
      mockFetchSanityLive.mockResolvedValueOnce(null);

      const result = await findAvailableTranslation('/null-page', 'en', 'nb');

      expect(result.found).toBe(false);
    });

    it('should filter out invalid translation entries', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce({
        _type: 'page',
        language: 'en',
        metadata: { slug: { current: 'test' } },
        translations: [
          null as any, // Invalid entry
          { language: '', slug: 'test', _type: 'page' }, // Missing language
          { language: 'nb', slug: '', _type: 'page' }, // Missing slug
          { language: 'ar', slug: 'test', _type: 'page' }, // Valid
        ],
      });

      mockResolveUrl.mockReturnValueOnce('/test');
      mockResolveUrl.mockReturnValueOnce('/ar/test');

      const result = await findAvailableTranslation('/test', 'en', 'ar');

      // Should only include valid translations (en and ar)
      expect(result.availableLocales).toHaveLength(2);
    });
  });

  describe('Strategy detection', () => {
    it('should return exact-match when target locale exists', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce({
        _type: 'page',
        language: 'en',
        metadata: { slug: { current: 'test' } },
        translations: [{ language: 'nb', slug: 'test', _type: 'page' }],
      });

      mockResolveUrl.mockReturnValueOnce('/test');
      mockResolveUrl.mockReturnValueOnce('/nb/test');

      const result = await findAvailableTranslation('/test', 'en', 'nb');

      expect(result.strategy).toBe('exact-match');
    });

    it('should return not-found when target locale does not exist', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce({
        _type: 'page',
        language: 'en',
        metadata: { slug: { current: 'test' } },
        translations: [],
      });

      mockResolveUrl.mockReturnValueOnce('/test');

      const result = await findAvailableTranslation('/test', 'en', 'nb');

      expect(result.strategy).toBe('not-found');
    });
  });
});
