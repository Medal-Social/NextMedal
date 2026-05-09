import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock fetchSanity before importing the module
vi.mock('@/sanity/lib/fetch', () => ({
  fetchSanity: vi.fn(),
}));

vi.mock('@/i18n/config', () => ({
  DEFAULT_LOCALE: 'en',
}));

vi.mock('@/lib/core/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { logger } from '@/lib/core/logger';
import { hasIndexInDefaultLocale } from '@/lib/sanity/page-fallback';
import { fetchSanity } from '@/sanity/lib/fetch';

const mockFetchSanity = vi.mocked(fetchSanity);
const mockLoggerError = vi.mocked(logger.error);

describe('hasIndexInDefaultLocale', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when default locale has an index page', async () => {
    // Mock successful response with an _id
    mockFetchSanity.mockResolvedValueOnce('some-page-id');

    const result = await hasIndexInDefaultLocale();

    expect(result).toBe(true);
    expect(mockFetchSanity).toHaveBeenCalledWith({
      query: expect.stringContaining("_type == 'page'"),
      params: { locale: 'en' },
    });
  });

  it('returns false when default locale has no index page', async () => {
    // Mock null response (no page found)
    mockFetchSanity.mockResolvedValueOnce(null);

    const result = await hasIndexInDefaultLocale();

    expect(result).toBe(false);
    expect(mockFetchSanity).toHaveBeenCalledWith({
      query: expect.stringContaining("_type == 'page'"),
      params: { locale: 'en' },
    });
  });

  it('handles Sanity query errors gracefully', async () => {
    // Mock query failure
    mockFetchSanity.mockRejectedValueOnce(new Error('Network error'));

    const result = await hasIndexInDefaultLocale();

    expect(result).toBe(false);
    // The implementation logs via the structured logger, not console.error.
    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.objectContaining({ err: expect.any(Error) }),
      'Error checking for default locale index'
    );
  });

  it('uses minimal query to check existence (only _id field)', async () => {
    mockFetchSanity.mockResolvedValueOnce('page-id');

    await hasIndexInDefaultLocale();

    expect(mockFetchSanity).toHaveBeenCalledWith({
      query: expect.stringContaining('[0]._id'),
      params: { locale: 'en' },
    });
  });

  it('queries for index slug and default locale', async () => {
    mockFetchSanity.mockResolvedValueOnce('page-id');

    await hasIndexInDefaultLocale();

    const call = mockFetchSanity.mock.calls[0][0];
    expect(call.query).toContain("metadata.slug.current == 'index'");
    expect(call.query).toContain('language == $locale');
    expect(call.params!.locale).toBe('en');
  });
});
