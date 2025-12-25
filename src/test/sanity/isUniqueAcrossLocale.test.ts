import type { SlugValidationContext } from 'sanity';
import { describe, expect, it, vi } from 'vitest';

import { isUniqueAcrossLocale, toSafeGroqPath } from '@/sanity/lib/isUniqueAcrossLocale';

describe('toSafeGroqPath', () => {
  it('should handle simple string paths', () => {
    expect(toSafeGroqPath(['slug'])).toBe('slug');
    expect(toSafeGroqPath(['metadata', 'slug'])).toBe('metadata.slug');
  });

  it('should handle numeric segments', () => {
    expect(toSafeGroqPath(['array', 0, 'slug'])).toBe('array[0].slug');
    expect(toSafeGroqPath(['items', 5])).toBe('items[5]');
  });

  it('should handle keyed segments', () => {
    expect(toSafeGroqPath(['sections', { _key: 'abc123' }, 'title'])).toBe(
      'sections[_key == "abc123"].title'
    );
  });

  it('should sanitize keyed segments to prevent injection', () => {
    // Malicious key attempting to break out of quotes
    expect(toSafeGroqPath(['sections', { _key: 'abc" || true || "' }, 'title'])).toBe(
      'sections[_key == "abc || true || "].title'
    );
  });

  it('should throw on invalid string segments', () => {
    // Malicious field name with space
    expect(() => toSafeGroqPath(['slug == "malicious"'])).toThrow(
      'Invalid GROQ path segment: "slug == "malicious""'
    );

    // Malicious field name with special characters
    expect(() => toSafeGroqPath(['slug; DROP TABLE users;'])).toThrow(
      'Invalid GROQ path segment: "slug; DROP TABLE users;"'
    );
  });

  it('should handle empty paths', () => {
    expect(toSafeGroqPath([])).toBe('');
  });
});

describe('isUniqueAcrossLocale', () => {
  const mockContext = {
    document: { _id: 'doc123', _type: 'post', language: 'en' },
    getClient: vi.fn(),
    defaultIsUnique: vi.fn(),
    path: ['slug'],
  } as unknown as SlugValidationContext;

  it('should call fetch with safe query and params', async () => {
    const mockFetch = vi.fn().mockResolvedValue(true);
    (mockContext.getClient as any).mockReturnValue({ fetch: mockFetch });

    const result = await isUniqueAcrossLocale('my-slug', mockContext);

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('language == $language &&'),
      expect.objectContaining({
        slug: 'my-slug',
        language: 'en',
      })
    );
    // Verify that _type == $type is NOT present in the query
    const query = mockFetch.mock.calls[0][0];
    expect(query).not.toContain('_type == $type');
  });

  it('should return false if toSafeGroqPath fails', async () => {
    const contextWithInvalidPath = {
      ...mockContext,
      path: ['invalid segment!'],
    } as unknown as SlugValidationContext;

    const result = await isUniqueAcrossLocale('my-slug', contextWithInvalidPath);

    expect(result).toBe(false);
  });

  it('should fallback to defaultIsUnique if no language is present', async () => {
    const contextNoLanguage = {
      ...mockContext,
      document: { _id: 'doc123', _type: 'post' },
    } as unknown as SlugValidationContext;

    await isUniqueAcrossLocale('my-slug', contextNoLanguage);

    expect(contextNoLanguage.defaultIsUnique).toHaveBeenCalled();
  });
});
