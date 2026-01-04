import { beforeEach, describe, expect, it, vi } from 'vitest';

// Only mock external dependencies - NOT framework internals like NextResponse
// NextResponse works correctly in Vitest jsdom environment

// Mock logger to prevent console noise
vi.mock('@/lib/core/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock Sanity client - this is the actual external dependency
vi.mock('@/sanity/lib/client', () => ({
  client: {
    fetch: vi.fn(),
  },
}));

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  routing: {
    defaultLocale: 'en',
    locales: ['en', 'nb'],
  },
}));

// Mock withRetry to just call the function directly without retries
vi.mock('@/lib/utils', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    withRetry: vi.fn(async (fn) => await fn()),
  };
});

// Mock Next.js unstable_cache to bypass caching in tests
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn) => fn),
}));

// Mock the generated collections file directly (used by getAllCollections)
vi.mock('@/lib/collections/generated/collections.generated', () => ({
  COLLECTION_SLUGS_BY_LOCALE: {
    en: {
      'collection.article': {
        type: 'collection.article',
        slug: 'articles',
        name: 'Articles',
      },
      'collection.changelog': {
        type: 'collection.changelog',
        slug: 'changelog',
        name: 'Changelog',
      },
      'collection.documentation': {
        type: 'collection.documentation',
        slug: 'docs',
        name: 'Documentation',
      },
      'collection.newsletter': {
        type: 'collection.newsletter',
        slug: 'newsletter',
        name: 'Newsletter',
      },
      'collection.events': {
        type: 'collection.events',
        slug: 'events',
        name: 'Events',
      },
    },
    nb: {
      'collection.article': {
        type: 'collection.article',
        slug: 'artikler',
        name: 'Articles',
      },
      'collection.changelog': {
        type: 'collection.changelog',
        slug: 'endringslogg',
        name: 'Changelog',
      },
      'collection.documentation': {
        type: 'collection.documentation',
        slug: 'dokumentasjon',
        name: 'Documentation',
      },
      'collection.newsletter': {
        type: 'collection.newsletter',
        slug: 'nyhetsbrev',
        name: 'Newsletter',
      },
      'collection.events': {
        type: 'collection.events',
        slug: 'hendelser',
        name: 'Events',
      },
    },
  },
  DEFAULT_COLLECTION_SLUGS: {
    'collection.article': 'articles',
    'collection.changelog': 'changelog',
    'collection.documentation': 'docs',
    'collection.newsletter': 'newsletter',
    'collection.events': 'events',
  },
  SLUG_TO_TYPE_MAP: {},
  GENERATION_METADATA: {
    generatedAt: '2025-01-01T00:00:00.000Z',
    locales: ['en', 'nb'],
    source: 'Test mock',
  },
}));

import { GET } from '@/app/api/search/route';
import { client } from '@/sanity/lib/client';

// Get the mocked fetch function - use any to allow flexible mock data
const mockFetch = client.fetch as ReturnType<typeof vi.fn>;

// Helper to create a mock Request object
function createMockRequest(locale = 'en'): Request {
  return new Request(`http://localhost:3000/api/search?locale=${locale}`);
}

describe('Search API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when no data', async () => {
    mockFetch.mockResolvedValueOnce({
      pages: [],
      collections: [],
    });

    const response = await GET(createMockRequest());
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(0);
  });

  it('formats page results correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      pages: [{ _id: 'page-1', _type: 'page', title: 'About Us', slug: 'about' }],
      collections: [],
    });

    const response = await GET(createMockRequest());
    const data = await response.json();

    expect(data).toHaveLength(1);
    expect(data[0]).toEqual({
      _id: 'page-1',
      _type: 'page',
      title: 'About Us',
      slug: 'about',
      type: 'Page',
      href: '/about',
    });
  });

  it('formats article collection results correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      pages: [],
      collections: [
        {
          _id: 'post-1',
          _type: 'collection.article',
          title: 'Article',
          slug: 'my-post',
          description: 'A article',
          language: 'en',
        },
      ],
    });

    const response = await GET(createMockRequest());
    const data = await response.json();

    expect(data).toHaveLength(1);
    expect(data[0].type).toBe('Articles');
    expect(data[0].href).toBe('/articles/my-post');
  });

  it('formats changelog collection results correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      pages: [],
      collections: [
        {
          _id: 'changelog-1',
          _type: 'collection.changelog',
          title: 'Version 1.0',
          slug: 'v1',
          language: 'en',
        },
      ],
    });

    const response = await GET(createMockRequest());
    const data = await response.json();

    expect(data[0].type).toBe('Changelog');
  });

  it('formats documentation collection results correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      pages: [],
      collections: [
        {
          _id: 'doc-1',
          _type: 'collection.documentation',
          title: 'Getting Started',
          slug: 'getting-started',
          language: 'en',
        },
      ],
    });

    const response = await GET(createMockRequest());
    const data = await response.json();

    expect(data[0].type).toBe('Docs');
  });

  it('formats newsletter collection results correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      pages: [],
      collections: [
        {
          _id: 'newsletter-1',
          _type: 'collection.newsletter',
          title: 'Weekly Update',
          slug: 'weekly-1',
          language: 'en',
        },
      ],
    });

    const response = await GET(createMockRequest());
    const data = await response.json();

    expect(data[0].type).toBe('Newsletter');
  });

  it('filters out unknown collection types', async () => {
    mockFetch.mockResolvedValueOnce({
      pages: [],
      collections: [
        {
          _id: 'unknown-1',
          _type: 'collection.unknown',
          title: 'Unknown Type',
          slug: 'unknown',
          language: 'en',
        },
      ],
    });

    const response = await GET(createMockRequest());
    const data = await response.json();

    // Unknown collection types are filtered out (no collection slug in registry)
    expect(data).toHaveLength(0);
  });

  it('handles collection without item slug', async () => {
    mockFetch.mockResolvedValueOnce({
      pages: [],
      collections: [
        {
          _id: 'item-1',
          _type: 'collection.article',
          title: 'Item',
          slug: null,
          language: 'en',
        },
      ],
    });

    const response = await GET(createMockRequest());
    const data = await response.json();

    // Item will be filtered out because item slug is null
    expect(data).toHaveLength(0);
  });

  it('returns 500 on error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const response = await GET(createMockRequest());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Search is temporarily unavailable. Please try again in a moment.');
  });

  it('combines pages and collections', async () => {
    mockFetch.mockResolvedValueOnce({
      pages: [{ _id: 'page-1', _type: 'page', title: 'Home', slug: 'index' }],
      collections: [
        {
          _id: 'post-1',
          _type: 'collection.article',
          title: 'Post',
          slug: 'post',
          language: 'en',
        },
      ],
    });

    const response = await GET(createMockRequest());
    const data = await response.json();

    expect(data).toHaveLength(2);
  });

  it('handles missing pages array', async () => {
    mockFetch.mockResolvedValueOnce({
      collections: [
        {
          _id: 'post-1',
          _type: 'collection.article',
          title: 'Post',
          slug: 'post',
          language: 'en',
        },
      ],
    });

    const response = await GET(createMockRequest());
    const data = await response.json();

    expect(data).toHaveLength(1);
  });

  it('handles missing collections array', async () => {
    mockFetch.mockResolvedValueOnce({
      pages: [{ _id: 'page-1', _type: 'page', title: 'Home', slug: 'index' }],
    });

    const response = await GET(createMockRequest());
    const data = await response.json();

    expect(data).toHaveLength(1);
  });
});
