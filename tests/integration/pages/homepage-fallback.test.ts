/**
 * Integration tests for homepage locale fallback behavior
 * Tests the full redirect flow when index pages are missing in non-default locales
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock server-only dependencies
vi.mock('server-only', () => ({}));

// Mock Sanity live (server-only)
vi.mock('@/sanity/lib/live', () => ({
  sanityFetch: vi.fn(),
  SanityLive: () => null,
  fetchSanityLive: vi.fn(),
  fetchSanityStatic: vi.fn(),
}));

// Mock the dependencies before importing the page component
vi.mock('@/sanity/lib/fetch', () => ({
  fetchSanity: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    // Next.js redirect throws an error to halt execution
    throw new Error(`NEXT_REDIRECT: ${url}`);
  }),
}));

vi.mock('@/i18n/config', () => ({
  DEFAULT_LOCALE: 'en',
  SUPPORTED_LOCALES: ['en', 'nb', 'ar'],
}));

vi.mock('@/lib/sanity/page-fallback', () => ({
  hasIndexInDefaultLocale: vi.fn(),
}));

vi.mock('@/lib/sanity/process-metadata', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/sanity/placement', () => ({
  groupPlacements: vi.fn((_placements) => ({ top: null, bottom: null })),
}));

vi.mock('@/contexts', () => ({
  PageProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/components/blocks/modules', () => ({
  Modules: () => null,
}));

vi.mock('@/components/EmptyPage', () => ({
  EmptyPage: () => 'EmptyPage',
}));

import { redirect } from 'next/navigation';
// Import after mocks are set up
import Page from '@/app/(frontend)/[locale]/page';
import { hasIndexInDefaultLocale } from '@/lib/sanity/page-fallback';
import { fetchSanity } from '@/sanity/lib/fetch';

const mockFetchSanity = vi.mocked(fetchSanity);
const mockRedirect = vi.mocked(redirect);
const mockHasIndexInDefaultLocale = vi.mocked(hasIndexInDefaultLocale);

describe('Homepage Locale Fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Default locale (en)', () => {
    const defaultLocaleProps = {
      params: Promise.resolve({ locale: 'en' }),
      searchParams: Promise.resolve({}),
    };

    it('shows EmptyPage when no index exists', async () => {
      // Mock no page found
      mockFetchSanity.mockResolvedValueOnce(null);

      const result = await Page(defaultLocaleProps);

      // Should render EmptyPage without calling hasIndexInDefaultLocale
      expect(mockHasIndexInDefaultLocale).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.type.name).toBe('EmptyPage');
    });

    it('renders page when index exists', async () => {
      // Mock page exists
      const mockPage = {
        _id: 'page-id',
        _type: 'page',
        metadata: { slug: { current: 'index' } },
        modules: [],
        placements: [],
      };
      mockFetchSanity.mockResolvedValueOnce(mockPage);

      const result = await Page(defaultLocaleProps);

      // Should render page with PageProvider
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.type.name).toBe('PageProvider');
    });
  });

  describe('Non-default locale (nb, ar)', () => {
    const norwegianLocaleProps = {
      params: Promise.resolve({ locale: 'nb' }),
      searchParams: Promise.resolve({}),
    };

    it('redirects to default locale when no index exists but default has one', async () => {
      // Mock no page in nb locale
      mockFetchSanity.mockResolvedValueOnce(null);
      // Mock default locale has index
      mockHasIndexInDefaultLocale.mockResolvedValueOnce(true);

      let redirectError: unknown;
      try {
        await Page(norwegianLocaleProps);
      } catch (error) {
        redirectError = error;
      }

      expect(mockHasIndexInDefaultLocale).toHaveBeenCalledOnce();
      expect(mockRedirect).toHaveBeenCalledWith('/');
      // Next.js redirect throws an error to halt execution
      expect(redirectError).toBeDefined();
    });

    it('shows EmptyPage when no index exists in any locale', async () => {
      // Mock no page in nb locale
      mockFetchSanity.mockResolvedValueOnce(null);
      // Mock default locale also has no index
      mockHasIndexInDefaultLocale.mockResolvedValueOnce(false);

      const result = await Page(norwegianLocaleProps);

      expect(mockHasIndexInDefaultLocale).toHaveBeenCalledOnce();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.type.name).toBe('EmptyPage');
    });

    it('renders page when index exists in current locale', async () => {
      // Mock page exists in nb locale
      const mockPage = {
        _id: 'page-id-nb',
        _type: 'page',
        metadata: { slug: { current: 'index' } },
        modules: [],
        placements: [],
      };
      mockFetchSanity.mockResolvedValueOnce(mockPage);

      const result = await Page(norwegianLocaleProps);

      // Should render page without checking default locale
      expect(mockHasIndexInDefaultLocale).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.type.name).toBe('PageProvider');
    });

    it('handles Arabic locale correctly', async () => {
      const arabicLocaleProps = {
        params: Promise.resolve({ locale: 'ar' }),
        searchParams: Promise.resolve({}),
      };

      // Mock no page in ar locale
      mockFetchSanity.mockResolvedValueOnce(null);
      // Mock default locale has index
      mockHasIndexInDefaultLocale.mockResolvedValueOnce(true);

      let redirectError: unknown;
      try {
        await Page(arabicLocaleProps);
      } catch (error) {
        redirectError = error;
      }

      expect(mockHasIndexInDefaultLocale).toHaveBeenCalledOnce();
      expect(mockRedirect).toHaveBeenCalledWith('/');
      expect(redirectError).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('handles query errors gracefully in non-default locale', async () => {
      const norwegianLocaleProps = {
        params: Promise.resolve({ locale: 'nb' }),
        searchParams: Promise.resolve({}),
      };

      // Mock query failure
      mockFetchSanity.mockResolvedValueOnce(null);
      // Mock hasIndexInDefaultLocale returns false on error
      mockHasIndexInDefaultLocale.mockResolvedValueOnce(false);

      const result = await Page(norwegianLocaleProps);

      // Should show EmptyPage when default locale check fails
      expect(result).toBeDefined();
      expect(result.type.name).toBe('EmptyPage');
    });
  });
});
