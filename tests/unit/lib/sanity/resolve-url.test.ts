import { describe, expect, it, vi } from 'vitest';

// Mock next-sanity
vi.mock('next-sanity', () => ({
  stegaClean: (value: string) => value,
}));

// Mock BASE_URL
vi.mock('@/lib/core/env', () => ({
  BASE_URL: 'https://example.com',
}));

import resolveUrl, { isRelativeUrl, resolveAnyUrl } from '@/lib/sanity/resolve-url';

describe('isRelativeUrl', () => {
  it('returns false for empty string', () => {
    expect(isRelativeUrl('')).toBe(false);
  });

  it('returns true for paths starting with /', () => {
    expect(isRelativeUrl('/about')).toBe(true);
    expect(isRelativeUrl('/blog/post-1')).toBe(true);
  });

  it('returns false for URLs with protocol', () => {
    expect(isRelativeUrl('https://example.com')).toBe(false);
    expect(isRelativeUrl('http://example.com')).toBe(false);
  });

  it('returns false for mailto links', () => {
    expect(isRelativeUrl('mailto:test@example.com')).toBe(false);
  });

  it('returns false for tel links', () => {
    expect(isRelativeUrl('tel:+1234567890')).toBe(false);
  });

  it('handles whitespace', () => {
    expect(isRelativeUrl('  /about  ')).toBe(true);
  });

  it('returns true for paths without protocol', () => {
    expect(isRelativeUrl('about')).toBe(true);
  });
});

describe('resolveAnyUrl', () => {
  it('returns / for empty string', () => {
    expect(resolveAnyUrl('')).toBe('/');
  });

  it('returns relative URL as-is by default', () => {
    expect(resolveAnyUrl('/about')).toBe('/about');
  });

  it('returns relative URL with base when base=true', () => {
    expect(resolveAnyUrl('/about', true)).toBe('https://example.com/about');
  });

  it('returns external URL as-is', () => {
    expect(resolveAnyUrl('https://google.com')).toBe('https://google.com');
  });

  it('returns external URL as-is even with base=true', () => {
    expect(resolveAnyUrl('https://google.com', true)).toBe('https://google.com');
  });
});

describe('resolveUrl', () => {
  it('returns / for undefined page', () => {
    expect(resolveUrl(undefined)).toBe('/');
  });

  it('returns / for null page', () => {
    expect(resolveUrl(null as any)).toBe('/');
  });

  it('resolves basic page with slug', () => {
    const page = {
      _type: 'page',
      metadata: { slug: { current: 'about' } },
    };
    expect(resolveUrl(page)).toBe('https://example.com/about');
  });

  it('resolves index page to base URL with trailing slash', () => {
    const page = {
      _type: 'page',
      metadata: { slug: { current: 'index' } },
    };
    expect(resolveUrl(page)).toBe('https://example.com/');
  });

  it('returns relative path when base=false', () => {
    const page = {
      _type: 'page',
      metadata: { slug: { current: 'contact' } },
    };
    expect(resolveUrl(page, { base: false })).toBe('/contact');
  });

  it('adds language prefix for non-English pages', () => {
    const page = {
      _type: 'page',
      language: 'nb',
      metadata: { slug: { current: 'about' } },
    };
    expect(resolveUrl(page, { base: false })).toBe('/nb/about');
  });

  it('does not add language prefix for English pages', () => {
    const page = {
      _type: 'page',
      language: 'en',
      metadata: { slug: { current: 'about' } },
    };
    expect(resolveUrl(page, { base: false })).toBe('/about');
  });

  it('resolves blog collection with collection slug', () => {
    const page = {
      _type: 'collection.blog',
      metadata: { slug: { current: 'my-post' } },
      collection: {
        metadata: { slug: { current: 'blog' } },
      },
    };
    expect(resolveUrl(page, { base: false })).toBe('/blog/my-post');
  });

  it('resolves changelog collection with collection slug', () => {
    const page = {
      _type: 'collection.changelog',
      metadata: { slug: { current: 'v1.0' } },
      collection: {
        metadata: { slug: { current: 'changelog' } },
      },
    };
    expect(resolveUrl(page, { base: false })).toBe('/changelog/v1.0');
  });

  it('resolves documentation collection with collection slug', () => {
    const page = {
      _type: 'collection.documentation',
      metadata: { slug: { current: 'getting-started' } },
      collection: {
        metadata: { slug: { current: 'docs' } },
      },
    };
    expect(resolveUrl(page, { base: false })).toBe('/docs/getting-started');
  });

  it('resolves newsletter collection with collection slug', () => {
    const page = {
      _type: 'collection.newsletter',
      metadata: { slug: { current: 'issue-1' } },
      collection: {
        metadata: { slug: { current: 'newsletter' } },
      },
    };
    expect(resolveUrl(page, { base: false })).toBe('/newsletter/issue-1');
  });

  it('handles collection without collection reference', () => {
    const page = {
      _type: 'collection.blog',
      metadata: { slug: { current: 'my-post' } },
    };
    expect(resolveUrl(page, { base: false })).toBe('/my-post');
  });

  it('appends query string from params object', () => {
    const page = {
      _type: 'page',
      metadata: { slug: { current: 'search' } },
    };
    expect(resolveUrl(page, { base: false, params: { q: 'test' } })).toBe('/search?q=test');
  });

  it('appends multiple params', () => {
    const page = {
      _type: 'page',
      metadata: { slug: { current: 'search' } },
    };
    expect(resolveUrl(page, { base: false, params: { q: 'test', page: '1' } })).toBe(
      '/search?q=test&page=1'
    );
  });

  it('handles array params', () => {
    const page = {
      _type: 'page',
      metadata: { slug: { current: 'filter' } },
    };
    expect(resolveUrl(page, { base: false, params: { tags: ['a', 'b'] } })).toBe(
      '/filter?tags=a&tags=b'
    );
  });

  it('filters params by allowList', () => {
    const page = {
      _type: 'page',
      metadata: { slug: { current: 'search' } },
    };
    expect(
      resolveUrl(page, {
        base: false,
        params: { q: 'test', secret: 'hidden' },
        allowList: ['q'],
      })
    ).toBe('/search?q=test');
  });

  it('handles string params', () => {
    const page = {
      _type: 'page',
      metadata: { slug: { current: 'page' } },
    };
    expect(resolveUrl(page, { base: false, params: '?custom=value' })).toBe('/page?custom=value');
  });

  it('skips undefined and null params', () => {
    const page = {
      _type: 'page',
      metadata: { slug: { current: 'page' } },
    };
    expect(resolveUrl(page, { base: false, params: { valid: 'yes', empty: undefined } })).toBe(
      '/page?valid=yes'
    );
  });
});
