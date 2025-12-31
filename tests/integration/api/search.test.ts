import { beforeEach, describe, expect, it, vi } from 'vitest';

// Only mock external dependencies - NOT framework internals like NextResponse
// NextResponse works correctly in Vitest jsdom environment

// Mock logger to prevent console noise
vi.mock('@/lib/core/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

// Mock Sanity client - this is the actual external dependency
vi.mock('@/sanity/lib/client', () => ({
  client: {
    fetch: vi.fn(),
  },
}));

import { GET } from '@/app/api/search/route';
import { client } from '@/sanity/lib/client';

// Get the mocked fetch function - use any to allow flexible mock data
const mockFetch = client.fetch as ReturnType<typeof vi.fn>;

describe('Search API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when no data', async () => {
    mockFetch.mockResolvedValueOnce({
      pages: [],
      collections: [],
    });

    const response = await GET();
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(0);
  });

  it('formats page results correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      pages: [{ _id: 'page-1', _type: 'page', title: 'About Us', slug: 'about' }],
      collections: [],
    });

    const response = await GET();
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

  it('formats blog collection results correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      pages: [],
      collections: [
        {
          _id: 'post-1',
          _type: 'collection.blog',
          title: 'Blog Post',
          slug: 'my-post',
          collectionSlug: 'blog',
          description: 'A blog post',
        },
      ],
    });

    const response = await GET();
    const data = await response.json();

    expect(data).toHaveLength(1);
    expect(data[0].type).toBe('Blog');
    expect(data[0].href).toBe('/blog/my-post');
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
          collectionSlug: 'changelog',
        },
      ],
    });

    const response = await GET();
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
          collectionSlug: 'docs',
        },
      ],
    });

    const response = await GET();
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
          collectionSlug: 'newsletter',
        },
      ],
    });

    const response = await GET();
    const data = await response.json();

    expect(data[0].type).toBe('Newsletter');
  });

  it('handles unknown collection type as Article', async () => {
    mockFetch.mockResolvedValueOnce({
      pages: [],
      collections: [
        {
          _id: 'unknown-1',
          _type: 'collection.unknown',
          title: 'Unknown Type',
          slug: 'unknown',
          collectionSlug: 'unknown',
        },
      ],
    });

    const response = await GET();
    const data = await response.json();

    expect(data[0].type).toBe('Article');
  });

  it('handles collection without collectionSlug', async () => {
    mockFetch.mockResolvedValueOnce({
      pages: [],
      collections: [
        {
          _id: 'item-1',
          _type: 'collection.blog',
          title: 'Item',
          slug: 'item',
          collectionSlug: null,
        },
      ],
    });

    const response = await GET();
    const data = await response.json();

    expect(data[0].href).toBe('/item');
  });

  it('returns 500 on error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const response = await GET();
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
          _type: 'collection.blog',
          title: 'Post',
          slug: 'post',
          collectionSlug: 'blog',
        },
      ],
    });

    const response = await GET();
    const data = await response.json();

    expect(data).toHaveLength(2);
  });

  it('handles missing pages array', async () => {
    mockFetch.mockResolvedValueOnce({
      collections: [
        {
          _id: 'post-1',
          _type: 'collection.blog',
          title: 'Post',
          slug: 'post',
          collectionSlug: 'blog',
        },
      ],
    });

    const response = await GET();
    const data = await response.json();

    expect(data).toHaveLength(1);
  });

  it('handles missing collections array', async () => {
    mockFetch.mockResolvedValueOnce({
      pages: [{ _id: 'page-1', _type: 'page', title: 'Home', slug: 'index' }],
    });

    const response = await GET();
    const data = await response.json();

    expect(data).toHaveLength(1);
  });
});
