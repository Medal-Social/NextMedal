import { describe, expect, it, vi } from 'vitest';

// Mock next-sanity
vi.mock('next-sanity', () => ({
  stegaClean: (value: string) => value,
}));

// Mock BASE_URL
vi.mock('@/lib/core/env', () => ({
  BASE_URL: 'https://example.com',
}));

import { isRelativeUrl, resolveAnyUrl, resolveUrlSync } from '@/lib/sanity/resolve-url';

// Type for test page fixtures
interface TestPage {
  _type: string;
  _id: string;
  _rev: string;
  _createdAt: string;
  _updatedAt: string;
  language?: string;
  metadata: {
    slug: { current: string };
    title: string;
    description: string;
    noIndex: boolean;
  };
  collection?: {
    metadata: { slug: { current: string } };
  };
}

// Helper to create test page fixtures with minimal required fields
function createPage(slug: string, type = 'page', language?: string): TestPage {
  return {
    _type: type,
    _id: 'test-id',
    _rev: 'test-rev',
    _createdAt: '2024-01-01T00:00:00Z',
    _updatedAt: '2024-01-01T00:00:00Z',
    language,
    metadata: {
      slug: { current: slug },
      title: 'Test',
      description: 'Test',
      noIndex: false,
    },
  };
}

function _createPageWithCollection(
  slug: string,
  collectionSlug: string,
  type = 'collection.article'
): TestPage {
  return {
    _type: type,
    _id: 'test-id',
    _rev: 'test-rev',
    _createdAt: '2024-01-01T00:00:00Z',
    _updatedAt: '2024-01-01T00:00:00Z',
    metadata: {
      slug: { current: slug },
      title: 'Test',
      description: 'Test',
      noIndex: false,
    },
    collection: {
      metadata: { slug: { current: collectionSlug } },
    },
  };
}

describe('isRelativeUrl', () => {
  it('returns false for empty string', () => {
    expect(isRelativeUrl('')).toBe(false);
  });

  it('returns true for paths starting with /', () => {
    expect(isRelativeUrl('/about')).toBe(true);
    expect(isRelativeUrl('/articles/post-1')).toBe(true);
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

describe('resolveUrlSync', () => {
  it('returns / for undefined page', () => {
    expect(resolveUrlSync(undefined)).toBe('/');
  });

  it('returns / for null page', () => {
    expect(resolveUrlSync(null as unknown as TestPage)).toBe('/');
  });

  it('resolves basic page with slug', () => {
    const page = createPage('about');
    expect(resolveUrlSync(page)).toBe('https://example.com/about');
  });

  it('resolves index page to base URL with trailing slash', () => {
    const page = createPage('index');
    expect(resolveUrlSync(page)).toBe('https://example.com/');
  });

  it('returns relative path when base=false', () => {
    const page = createPage('contact');
    expect(resolveUrlSync(page, { base: false })).toBe('/contact');
  });

  it('adds language prefix for non-English pages', () => {
    const page = createPage('about', 'page', 'nb');
    expect(resolveUrlSync(page, { base: false })).toBe('/nb/about');
  });

  it('does not add language prefix for English pages', () => {
    const page = createPage('about', 'page', 'en');
    expect(resolveUrlSync(page, { base: false })).toBe('/about');
  });

  it('resolves article collection with default slug', () => {
    const page = createPage('my-post', 'collection.article');
    expect(resolveUrlSync(page, { base: false })).toBe('/articles/my-post');
  });

  it('resolves changelog collection with default slug', () => {
    const page = createPage('v1.0', 'collection.changelog');
    expect(resolveUrlSync(page, { base: false })).toBe('/changelog/v1.0');
  });

  it('resolves documentation collection with default slug', () => {
    const page = createPage('getting-started', 'collection.documentation');
    expect(resolveUrlSync(page, { base: false })).toBe('/docs/getting-started');
  });

  it('resolves newsletter collection with default slug', () => {
    const page = createPage('issue-1', 'collection.newsletter');
    expect(resolveUrlSync(page, { base: false })).toBe('/newsletter/issue-1');
  });

  it('resolves events collection with default slug', () => {
    const page = createPage('conference-2024', 'collection.events');
    expect(resolveUrlSync(page, { base: false })).toBe('/events/conference-2024');
  });

  it('appends query string from params object', () => {
    const page = createPage('search');
    expect(resolveUrlSync(page, { base: false, params: { q: 'test' } })).toBe('/search?q=test');
  });

  it('appends multiple params', () => {
    const page = createPage('search');
    expect(resolveUrlSync(page, { base: false, params: { q: 'test', page: '1' } })).toBe(
      '/search?q=test&page=1'
    );
  });

  it('handles array params', () => {
    const page = createPage('filter');
    expect(resolveUrlSync(page, { base: false, params: { tags: ['a', 'b'] } })).toBe(
      '/filter?tags=a&tags=b'
    );
  });

  it('filters params by allowList', () => {
    const page = createPage('search');
    expect(
      resolveUrlSync(page, {
        base: false,
        params: { q: 'test', secret: 'hidden' },
        allowList: ['q'],
      })
    ).toBe('/search?q=test');
  });

  it('handles string params', () => {
    const page = createPage('page');
    expect(resolveUrlSync(page, { base: false, params: '?custom=value' })).toBe(
      '/page?custom=value'
    );
  });

  it('skips undefined and null params', () => {
    const page = createPage('page');
    expect(resolveUrlSync(page, { base: false, params: { valid: 'yes', empty: undefined } })).toBe(
      '/page?valid=yes'
    );
  });
});
