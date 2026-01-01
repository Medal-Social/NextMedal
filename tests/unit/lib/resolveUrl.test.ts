import { describe, expect, it, vi } from 'vitest';
import resolveUrl from '@/lib/sanity/resolve-url';

// Mock must match the actual import path in resolve-url.ts
vi.mock('@/lib/core/env', () => ({
  BASE_URL: 'https://example.com',
}));

describe('resolveUrl', () => {
  const mockPage = {
    _type: 'page',
    metadata: { slug: { current: 'test-page' } },
  } as any;

  it('should resolve basic page URL', () => {
    const url = resolveUrl(mockPage);
    expect(url).toBe('https://example.com/test-page');
  });

  it('should include allowed query parameters', () => {
    const url = resolveUrl(mockPage, {
      params: { page: '2', category: 'news', ignored: 'value' },
      allowList: ['page', 'category'],
    });
    expect(url).toBe('https://example.com/test-page?page=2&category=news');
  });

  it('should handle array parameters', () => {
    const url = resolveUrl(mockPage, {
      params: { category: ['news', 'tech'] },
      allowList: ['category'],
    });
    // URLSearchParams sorts keys but order of values depends on append order
    expect(url).toBe('https://example.com/test-page?category=news&category=tech');
  });

  it('should ignore disallowed parameters', () => {
    const url = resolveUrl(mockPage, {
      params: { secret: 'hidden' },
      allowList: ['page'],
    });
    expect(url).toBe('https://example.com/test-page');
  });

  it('should return base URL for index slug', () => {
    const indexPage = { ...mockPage, metadata: { slug: { current: 'index' } } };
    const url = resolveUrl(indexPage);
    expect(url).toBe('https://example.com/');
  });

  it('should handle collection.article with collection reference', () => {
    const articlePost = {
      ...mockPage,
      _type: 'collection.article',
      metadata: { slug: { current: 'post-1' } },
      collection: {
        _id: 'page-123',
        metadata: { slug: { current: 'articles' } },
      },
    };
    const url = resolveUrl(articlePost);
    expect(url).toBe('https://example.com/articles/post-1');
  });
});
