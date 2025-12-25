import { describe, expect, it, vi } from 'vitest';
import resolveUrl from '@/lib/resolveUrl';

vi.mock('@/lib/env', () => ({
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

  it('should handle blog post path', () => {
    const blogPost = { ...mockPage, _type: 'blog.post', metadata: { slug: { current: 'post-1' } } };
    const url = resolveUrl(blogPost);
    expect(url).toBe('https://example.com/blog/post-1');
  });
});
