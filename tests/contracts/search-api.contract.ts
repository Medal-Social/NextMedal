import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Contract tests verify that API responses match expected schemas.
 * These tests ensure API stability and help catch breaking changes.
 *
 * Unlike integration tests which test behavior, contract tests validate
 * that the response SHAPE is correct regardless of content.
 */

// Mock only external dependencies
vi.mock('@/lib/core/logger', () => ({
  logger: { error: vi.fn() },
}));

vi.mock('@/sanity/lib/client', () => ({
  client: { fetch: vi.fn() },
}));

import { GET } from '@/app/api/search/route';
import { client } from '@/sanity/lib/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFetch = client.fetch as any;

describe('Search API Contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Response Schema Validation', () => {
    it('response matches SearchResponse schema with pages', async () => {
      mockFetch.mockResolvedValueOnce({
        pages: [
          { _id: 'page-1', _type: 'page', title: 'About', slug: 'about' },
          { _id: 'page-2', _type: 'page', title: 'Contact', slug: 'contact' },
        ],
        collections: [],
      });

      const request = new Request('http://localhost:3000/api/search');
      const response = await GET(request);
      const data = await response.json();

      // Contract: response must be an array
      expect(Array.isArray(data)).toBe(true);

      // Contract: each item must have required fields
      for (const item of data) {
        expect(item).toHaveProperty('_id');
        expect(item).toHaveProperty('_type');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('href');
        expect(item).toHaveProperty('type');
      }
    });

    it('response matches SearchResponse schema with collections', async () => {
      mockFetch.mockResolvedValueOnce({
        pages: [],
        collections: [
          {
            _id: 'post-1',
            _type: 'collection.article',
            title: 'Article',
            slug: 'post',
            collectionSlug: 'articles',
            description: 'A post',
            language: 'en',
          },
        ],
      });

      const request = new Request('http://localhost:3000/api/search');
      const response = await GET(request);
      const data = await response.json();

      // Contract: collection items have type and href
      expect(data[0]).toHaveProperty('type');
      expect(data[0]).toHaveProperty('href');
      expect(typeof data[0].href).toBe('string');
      expect(data[0].href.startsWith('/')).toBe(true);
    });

    it('error response matches error schema', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      const request = new Request('http://localhost:3000/api/search');
      const response = await GET(request);
      const data = await response.json();

      // Contract: error response has error field
      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('string');
      expect(response.status).toBe(500);
    });
  });

  describe('Schema Field Types', () => {
    it('_id is always a string', async () => {
      mockFetch.mockResolvedValueOnce({
        pages: [{ _id: 'page-123', _type: 'page', title: 'Test', slug: 'test' }],
        collections: [],
      });

      const request = new Request('http://localhost:3000/api/search');
      const response = await GET(request);
      const data = await response.json();

      expect(typeof data[0]._id).toBe('string');
    });

    it('title is always a string', async () => {
      mockFetch.mockResolvedValueOnce({
        pages: [{ _id: 'page-1', _type: 'page', title: 'My Title', slug: 'test' }],
        collections: [],
      });

      const request = new Request('http://localhost:3000/api/search');
      const response = await GET(request);
      const data = await response.json();

      expect(typeof data[0].title).toBe('string');
    });

    it('href is always a valid path', async () => {
      mockFetch.mockResolvedValueOnce({
        pages: [{ _id: 'page-1', _type: 'page', title: 'Test', slug: 'my-page' }],
        collections: [
          {
            _id: 'post-1',
            _type: 'collection.article',
            title: 'Post',
            slug: 'my-post',
            collectionSlug: 'articles',
            language: 'en',
          },
        ],
      });

      const request = new Request('http://localhost:3000/api/search');
      const response = await GET(request);
      const data = await response.json();

      for (const item of data) {
        expect(item.href).toMatch(/^\//); // Starts with /
        expect(item.href).not.toContain(' '); // No spaces
      }
    });
  });

  describe('Schema Backward Compatibility', () => {
    it('maintains required fields from v1 schema', async () => {
      // These fields must always be present for backward compatibility
      const requiredFields = ['_id', '_type', 'title', 'type', 'href'];

      mockFetch.mockResolvedValueOnce({
        pages: [{ _id: 'page-1', _type: 'page', title: 'Test', slug: 'test' }],
        collections: [],
      });

      const request = new Request('http://localhost:3000/api/search');
      const response = await GET(request);
      const data = await response.json();

      for (const field of requiredFields) {
        expect(data[0]).toHaveProperty(field);
      }
    });

    it('optional description field is string when present', async () => {
      mockFetch.mockResolvedValueOnce({
        pages: [],
        collections: [
          {
            _id: 'post-1',
            _type: 'collection.article',
            title: 'Post',
            slug: 'post',
            collectionSlug: 'articles',
            description: 'A description',
            language: 'en',
          },
        ],
      });

      const request = new Request('http://localhost:3000/api/search');
      const response = await GET(request);
      const data = await response.json();

      if (data[0].description !== undefined) {
        expect(typeof data[0].description).toBe('string');
      }
    });
  });
});
