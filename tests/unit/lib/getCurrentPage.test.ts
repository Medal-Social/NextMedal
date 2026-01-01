import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock functions need to be declared before vi.mock calls
const mockLoggerError = vi.fn();

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('next-sanity', () => ({
  groq: (strings: TemplateStringsArray, ...values: unknown[]) =>
    strings.reduce((acc, str, i) => acc + str + (values[i] || ''), ''),
}));

// Mock must match actual import path in get-current-page.ts
vi.mock('@/lib/core/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
  },
}));

vi.mock('@/sanity/lib/fetch', () => ({
  fetchSanityLive: vi.fn(),
}));

vi.mock('@/sanity/lib/queries', () => ({
  TRANSLATIONS_QUERY: '"translations": *[_id == ^._id][0]',
  CURRENT_PAGE_QUERY:
    "*[(_type == 'page' || _type == 'collection.article') && metadata.slug.current == $slug && language == $locale][0]{ ..., translations }",
}));

vi.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'nb'],
    defaultLocale: 'en',
  },
}));

// Import after mocks
import { headers } from 'next/headers';
import { getCurrentPage } from '@/lib/sanity/get-current-page';
import { fetchSanityLive } from '@/sanity/lib/fetch';

const mockHeaders = vi.mocked(headers);
const mockFetchSanityLive = vi.mocked(fetchSanityLive);

describe('getCurrentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('header handling', () => {
    it('returns undefined when no pathname header exists', async () => {
      mockHeaders.mockResolvedValue({
        get: () => null,
      } as any);

      const result = await getCurrentPage();

      expect(result).toBeUndefined();
      expect(mockFetchSanityLive).not.toHaveBeenCalled();
    });

    it('uses x-pathname header first', async () => {
      mockHeaders.mockResolvedValue({
        get: (name: string) => {
          if (name === 'x-pathname') return '/en/about';
          if (name === 'referer') return '/nb/other';
          return null;
        },
      } as any);
      mockFetchSanityLive.mockResolvedValue({ _id: 'page1' } as any);

      await getCurrentPage();

      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { slug: 'about', locale: 'en' },
        })
      );
    });

    it('falls back to referer header when x-pathname is missing', async () => {
      mockHeaders.mockResolvedValue({
        get: (name: string) => {
          if (name === 'x-pathname') return null;
          if (name === 'referer') return '/nb/contact';
          return null;
        },
      } as any);
      mockFetchSanityLive.mockResolvedValue({ _id: 'page1' } as any);

      await getCurrentPage();

      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { slug: 'contact', locale: 'nb' },
        })
      );
    });
  });

  describe('pathname parsing', () => {
    it('parses root path as en/index', async () => {
      mockHeaders.mockResolvedValue({
        get: () => '/',
      } as any);
      mockFetchSanityLive.mockResolvedValue({ _id: 'home' } as any);

      await getCurrentPage();

      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { slug: 'index', locale: 'en' },
        })
      );
    });

    it('parses /en as en/index', async () => {
      mockHeaders.mockResolvedValue({
        get: () => '/en',
      } as any);
      mockFetchSanityLive.mockResolvedValue({ _id: 'home' } as any);

      await getCurrentPage();

      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { slug: 'index', locale: 'en' },
        })
      );
    });

    it('parses /nb as nb/index', async () => {
      mockHeaders.mockResolvedValue({
        get: () => '/nb',
      } as any);
      mockFetchSanityLive.mockResolvedValue({ _id: 'home' } as any);

      await getCurrentPage();

      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { slug: 'index', locale: 'nb' },
        })
      );
    });

    it('parses /en/slug correctly', async () => {
      mockHeaders.mockResolvedValue({
        get: () => '/en/about',
      } as any);
      mockFetchSanityLive.mockResolvedValue({ _id: 'about' } as any);

      await getCurrentPage();

      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { slug: 'about', locale: 'en' },
        })
      );
    });

    it('parses /nb/slug correctly', async () => {
      mockHeaders.mockResolvedValue({
        get: () => '/nb/om-oss',
      } as any);
      mockFetchSanityLive.mockResolvedValue({ _id: 'about' } as any);

      await getCurrentPage();

      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { slug: 'om-oss', locale: 'nb' },
        })
      );
    });

    it('parses /slug without locale as en/slug', async () => {
      mockHeaders.mockResolvedValue({
        get: () => '/products',
      } as any);
      mockFetchSanityLive.mockResolvedValue({ _id: 'products' } as any);

      await getCurrentPage();

      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { slug: 'products', locale: 'en' },
        })
      );
    });

    it('handles article paths by stripping articles prefix', async () => {
      mockHeaders.mockResolvedValue({
        get: () => '/en/articles/my-post',
      } as any);
      mockFetchSanityLive.mockResolvedValue({ _id: 'post1' } as any);

      await getCurrentPage();

      // The implementation strips "articles" prefix for articles
      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { slug: 'my-post', locale: 'en' },
        })
      );
    });

    it('handles deeply nested paths', async () => {
      mockHeaders.mockResolvedValue({
        get: () => '/nb/category/sub/item',
      } as any);
      mockFetchSanityLive.mockResolvedValue({ _id: 'item1' } as any);

      await getCurrentPage();

      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { slug: 'category/sub/item', locale: 'nb' },
        })
      );
    });

    it('handles full URLs with origin', async () => {
      mockHeaders.mockResolvedValue({
        get: () => 'https://example.com/en/page',
      } as any);
      mockFetchSanityLive.mockResolvedValue({ _id: 'page1' } as any);

      await getCurrentPage();

      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { slug: 'page', locale: 'en' },
        })
      );
    });
  });

  describe('Sanity fetch', () => {
    it('returns page data on successful fetch', async () => {
      const mockPage = {
        _type: 'page',
        _id: 'page-123',
        language: 'en',
        metadata: { slug: { current: 'test' } },
      };

      mockHeaders.mockResolvedValue({
        get: () => '/en/test',
      } as any);
      mockFetchSanityLive.mockResolvedValue(mockPage as any);

      const result = await getCurrentPage();

      expect(result).toEqual(mockPage);
    });

    it('queries for both page and collection.article types', async () => {
      mockHeaders.mockResolvedValue({
        get: () => '/en/my-post',
      } as any);
      mockFetchSanityLive.mockResolvedValue(null as any);

      await getCurrentPage();

      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining("_type == 'page' || _type == 'collection.article'"),
        })
      );
    });

    it('includes translations query', async () => {
      mockHeaders.mockResolvedValue({
        get: () => '/en/about',
      } as any);
      mockFetchSanityLive.mockResolvedValue(null as any);

      await getCurrentPage();

      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('translations'),
        })
      );
    });
  });

  describe('error handling', () => {
    it('returns undefined on fetch error', async () => {
      mockHeaders.mockResolvedValue({
        get: () => '/en/error-page',
      } as any);
      mockFetchSanityLive.mockRejectedValue(new Error('Fetch failed'));

      const result = await getCurrentPage();

      expect(result).toBeUndefined();
    });

    it('logs error when fetch fails', async () => {
      const error = new Error('Network error');
      mockHeaders.mockResolvedValue({
        get: () => '/en/error-page',
      } as any);
      mockFetchSanityLive.mockRejectedValue(error);

      await getCurrentPage();

      expect(mockLoggerError).toHaveBeenCalledWith(
        { err: error },
        'Error fetching current page for translations'
      );
    });

    it('handles undefined page result gracefully', async () => {
      mockHeaders.mockResolvedValue({
        get: () => '/en/nonexistent',
      } as any);
      mockFetchSanityLive.mockResolvedValue(undefined as any);

      const result = await getCurrentPage();

      expect(result).toBeUndefined();
    });

    it('handles null page result gracefully', async () => {
      mockHeaders.mockResolvedValue({
        get: () => '/en/nonexistent',
      } as any);
      mockFetchSanityLive.mockResolvedValue(null as any);

      const result = await getCurrentPage();

      expect(result).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('handles trailing slashes', async () => {
      mockHeaders.mockResolvedValue({
        get: () => '/en/about/',
      } as any);
      mockFetchSanityLive.mockResolvedValue({ _id: 'about' } as any);

      await getCurrentPage();

      // The URL parser should handle trailing slashes
      expect(mockFetchSanityLive).toHaveBeenCalled();
    });

    it('handles empty path segments', async () => {
      mockHeaders.mockResolvedValue({
        get: () => '/en//about',
      } as any);
      mockFetchSanityLive.mockResolvedValue({ _id: 'about' } as any);

      await getCurrentPage();

      // Empty segments are filtered out
      expect(mockFetchSanityLive).toHaveBeenCalled();
    });

    it('handles paths with query strings', async () => {
      mockHeaders.mockResolvedValue({
        get: () => '/en/page?foo=bar',
      } as any);
      mockFetchSanityLive.mockResolvedValue({ _id: 'page' } as any);

      await getCurrentPage();

      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { slug: 'page', locale: 'en' },
        })
      );
    });

    it('handles paths with hash fragments', async () => {
      mockHeaders.mockResolvedValue({
        get: () => '/nb/section#anchor',
      } as any);
      mockFetchSanityLive.mockResolvedValue({ _id: 'section' } as any);

      await getCurrentPage();

      expect(mockFetchSanityLive).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { slug: 'section', locale: 'nb' },
        })
      );
    });
  });
});
