import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('next-sanity', () => ({
  groq: (strings: TemplateStringsArray, ...values: unknown[]) =>
    strings.reduce((acc, str, i) => acc + str + (values[i] || ''), ''),
}));

vi.mock('@/lib/core/logger', () => ({
  logger: {
    error: vi.fn(),
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

// Import after mocks
import { checkTranslationAvailability } from '@/app/actions/check-translation';
import { getCollectionTypeFromSlug } from '@/lib/collections/registry';
import resolveUrl from '@/lib/sanity/resolve-url-server';
import { fetchSanityLive } from '@/sanity/lib/fetch';

describe('Language Switcher Auto-Redirect Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Server Action Integration', () => {
    it('should call translation detector and return result', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce({
        _type: 'page',
        language: 'en',
        metadata: { slug: { current: 'about' } },
        translations: [{ language: 'nb', slug: 'om', _type: 'page' }],
      });

      mockResolveUrl.mockReturnValueOnce('/about');
      mockResolveUrl.mockReturnValueOnce('/nb/om');

      const result = await checkTranslationAvailability('/about', 'en', 'nb');

      expect(result.found).toBe(true);
      expect(result.redirectUrl).toBe('/nb/om');
      expect(mockFetchSanityLive).toHaveBeenCalledTimes(1);
    });

    it('should handle missing translations correctly', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce({
        _type: 'page',
        language: 'en',
        metadata: { slug: { current: 'about' } },
        translations: [],
      });

      mockResolveUrl.mockReturnValueOnce('/about');

      const result = await checkTranslationAvailability('/about', 'en', 'nb');

      expect(result.found).toBe(false);
      expect(result.redirectUrl).toBeUndefined();
      expect(result.availableLocales).toHaveLength(0);
    });
  });

  describe('Page Translation Detection', () => {
    it('should detect page translations across all locales', async () => {
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

      mockResolveUrl.mockReturnValueOnce('/pricing');
      mockResolveUrl.mockReturnValueOnce('/nb/priser');
      mockResolveUrl.mockReturnValueOnce('/ar/pricing');

      const result = await checkTranslationAvailability('/pricing', 'en', 'nb');

      expect(result.found).toBe(true);
      expect(result.availableLocales).toHaveLength(3);
      expect(result.availableLocales.map((l) => l.locale)).toEqual(['en', 'nb', 'ar']);
    });

    it('should handle page without translation metadata', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);

      mockFetchSanityLive.mockResolvedValueOnce(undefined);

      const result = await checkTranslationAvailability('/nonexistent', 'en', 'nb');

      expect(result.found).toBe(false);
      expect(result.availableLocales).toHaveLength(0);
    });
  });

  describe('Collection Translation Detection', () => {
    it('should detect collection items across locales', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);
      const mockGetCollectionTypeFromSlug = vi.mocked(getCollectionTypeFromSlug);

      mockGetCollectionTypeFromSlug.mockReturnValue('collection.article');

      mockFetchSanityLive.mockResolvedValueOnce([
        { language: 'en', slug: 'seo-guide', _type: 'collection.article' },
        { language: 'nb', slug: 'seo-guide', _type: 'collection.article' },
        { language: 'ar', slug: 'seo-guide', _type: 'collection.article' },
      ]);

      mockResolveUrl.mockReturnValueOnce('/articles/seo-guide');
      mockResolveUrl.mockReturnValueOnce('/nb/artikler/seo-guide');
      mockResolveUrl.mockReturnValueOnce('/ar/articles/seo-guide');

      const result = await checkTranslationAvailability('/articles/seo-guide', 'en', 'nb');

      expect(result.found).toBe(true);
      expect(result.availableLocales).toHaveLength(3);
    });

    it('should handle collection with partial translations', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);
      const mockGetCollectionTypeFromSlug = vi.mocked(getCollectionTypeFromSlug);

      mockGetCollectionTypeFromSlug.mockReturnValue('collection.documentation');

      mockFetchSanityLive.mockResolvedValueOnce([
        { language: 'en', slug: 'advanced', _type: 'collection.documentation' },
      ]);

      mockResolveUrl.mockReturnValueOnce('/docs/advanced');

      const result = await checkTranslationAvailability('/docs/advanced', 'en', 'nb');

      expect(result.found).toBe(false);
      expect(result.availableLocales).toHaveLength(0); // Excludes current locale
    });
  });

  describe('Homepage Translation Detection', () => {
    it('should detect homepage translations', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce([
        { language: 'nb', slug: 'index', _type: 'page' },
        { language: 'ar', slug: 'index', _type: 'page' },
      ]);

      mockResolveUrl.mockReturnValueOnce('/');
      mockResolveUrl.mockReturnValueOnce('/nb');
      mockResolveUrl.mockReturnValueOnce('/ar');

      const result = await checkTranslationAvailability('/', 'en', 'nb');

      expect(result.found).toBe(true);
      expect(result.redirectUrl).toBe('/nb');
      expect(result.availableLocales).toHaveLength(3);
    });

    it('should handle homepage in different locales', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce([
        { language: 'en', slug: 'index', _type: 'page' },
        { language: 'ar', slug: 'index', _type: 'page' },
      ]);

      mockResolveUrl.mockReturnValueOnce('/nb');
      mockResolveUrl.mockReturnValueOnce('/');
      mockResolveUrl.mockReturnValueOnce('/ar');

      const result = await checkTranslationAvailability('/nb', 'nb', 'en');

      expect(result.found).toBe(true);
      expect(result.redirectUrl).toBe('/');
    });
  });

  describe('URL Building Integration', () => {
    it('should build correct URLs for all locales', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce({
        _type: 'page',
        language: 'en',
        metadata: { slug: { current: 'contact' } },
        translations: [
          { language: 'nb', slug: 'kontakt', _type: 'page' },
          { language: 'ar', slug: 'contact', _type: 'page' },
        ],
      });

      mockResolveUrl.mockReturnValueOnce('/contact');
      mockResolveUrl.mockReturnValueOnce('/nb/kontakt');
      mockResolveUrl.mockReturnValueOnce('/ar/contact');

      const result = await checkTranslationAvailability('/contact', 'en', 'nb');

      expect(result.availableLocales).toEqual([
        { locale: 'en', url: '/contact' },
        { locale: 'nb', url: '/nb/kontakt' },
        { locale: 'ar', url: '/ar/contact' },
      ]);
    });

    it('should handle collection URL building with locale-specific slugs', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);
      const mockGetCollectionTypeFromSlug = vi.mocked(getCollectionTypeFromSlug);

      mockGetCollectionTypeFromSlug.mockReturnValue('collection.article');

      mockFetchSanityLive.mockResolvedValueOnce([
        { language: 'en', slug: 'news', _type: 'collection.article' },
        { language: 'nb', slug: 'news', _type: 'collection.article' },
      ]);

      // Collection slug varies per locale (articles vs artikler)
      mockResolveUrl.mockReturnValueOnce('/articles/news');
      mockResolveUrl.mockReturnValueOnce('/nb/artikler/news');

      const result = await checkTranslationAvailability('/articles/news', 'en', 'nb');

      expect(result.availableLocales[0].url).toBe('/articles/news');
      expect(result.availableLocales[1].url).toBe('/nb/artikler/news');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle Sanity fetch errors gracefully', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);

      mockFetchSanityLive.mockRejectedValueOnce(new Error('Network error'));

      const result = await checkTranslationAvailability('/error-page', 'en', 'nb');

      expect(result.found).toBe(false);
      expect(result.availableLocales).toHaveLength(0);
    });

    it('should handle invalid translation data', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce({
        _type: 'page',
        language: 'en',
        metadata: { slug: { current: 'test' } },
        translations: [
          null as any,
          { language: '', slug: 'test', _type: 'page' },
          { language: 'nb', slug: '', _type: 'page' },
          { language: 'ar', slug: 'test', _type: 'page' },
        ],
      });

      mockResolveUrl.mockReturnValueOnce('/test');
      mockResolveUrl.mockReturnValueOnce('/ar/test');

      const result = await checkTranslationAvailability('/test', 'en', 'ar');

      // Should only include valid translations (en and ar)
      expect(result.availableLocales).toHaveLength(2);
    });
  });

  describe('Locale Switching Scenarios', () => {
    it('should handle en -> nb switch on regular page', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce({
        _type: 'page',
        language: 'en',
        metadata: { slug: { current: 'features' } },
        translations: [{ language: 'nb', slug: 'funksjoner', _type: 'page' }],
      });

      mockResolveUrl.mockReturnValueOnce('/features');
      mockResolveUrl.mockReturnValueOnce('/nb/funksjoner');

      const result = await checkTranslationAvailability('/features', 'en', 'nb');

      expect(result.found).toBe(true);
      expect(result.strategy).toBe('exact-match');
      expect(result.redirectUrl).toBe('/nb/funksjoner');
    });

    it('should handle nb -> en switch on article', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);
      const mockGetCollectionTypeFromSlug = vi.mocked(getCollectionTypeFromSlug);

      mockGetCollectionTypeFromSlug.mockReturnValue('collection.article');

      mockFetchSanityLive.mockResolvedValueOnce([
        { language: 'en', slug: 'update', _type: 'collection.article' },
        { language: 'nb', slug: 'update', _type: 'collection.article' },
      ]);

      mockResolveUrl.mockReturnValueOnce('/articles/update');
      mockResolveUrl.mockReturnValueOnce('/nb/artikler/update');

      const result = await checkTranslationAvailability('/nb/artikler/update', 'nb', 'en');

      expect(result.found).toBe(true);
      expect(result.redirectUrl).toBe('/articles/update');
    });

    it('should handle ar -> en switch with missing translation', async () => {
      const mockFetchSanityLive = vi.mocked(fetchSanityLive);
      const mockResolveUrl = vi.mocked(resolveUrl);

      mockFetchSanityLive.mockResolvedValueOnce({
        _type: 'page',
        language: 'ar',
        metadata: { slug: { current: 'test' } },
        translations: [],
      });

      mockResolveUrl.mockReturnValueOnce('/ar/test');

      const result = await checkTranslationAvailability('/ar/test', 'ar', 'en');

      expect(result.found).toBe(false);
      expect(result.strategy).toBe('not-found');
    });
  });
});
