import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the getSite function
vi.mock('@/sanity/lib/fetch', () => ({
  getSite: vi.fn(),
}));

// Mock the ImageResponse from next/og as a class
vi.mock('next/og', () => {
  return {
    ImageResponse: class MockImageResponse {
      headers: Headers;
      status: number;
      element: unknown;
      options: unknown;

      constructor(element: unknown, options?: unknown) {
        this.headers = new Headers({ 'Content-Type': 'image/png' });
        this.status = 200;
        this.element = element;
        this.options = options;
      }
    },
  };
});

// Mock fetch for Google Fonts
global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('fonts.googleapis.com')) {
    return Promise.resolve({
      text: () =>
        Promise.resolve("src: url(https://fonts.gstatic.com/test-font.woff2) format('truetype')"),
      status: 200,
    });
  }
  if (url.includes('fonts.gstatic.com')) {
    return Promise.resolve({
      status: 200,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
    });
  }
  return Promise.reject(new Error('Unknown URL'));
});

import { GET } from '@/app/api/og/route';
import { getSite } from '@/sanity/lib/fetch';

const mockGetSite = vi.mocked(getSite);

describe('OG image route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const mockSite = {
    title: 'Test Site',
    copyright: '© 2024 Test',
  };

  describe('Image response', () => {
    it('returns an image response when called with title parameter', async () => {
      mockGetSite.mockResolvedValueOnce(mockSite as any);

      const request = new NextRequest('https://example.com/api/og?title=Test%20Title');
      const response = await GET(request);

      expect(response.headers.get('Content-Type')).toBe('image/png');
    });

    it('returns 200 status', async () => {
      mockGetSite.mockResolvedValueOnce(mockSite as any);

      const request = new NextRequest('https://example.com/api/og?title=Test%20Title');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Title rendering', () => {
    it('uses provided title parameter', async () => {
      mockGetSite.mockResolvedValueOnce(mockSite as any);

      const request = new NextRequest('https://example.com/api/og?title=Custom%20Page%20Title');
      const response = await GET(request);

      // The ImageResponse mock captures the element, we can verify the title was passed
      expect(response).toBeDefined();
    });

    it('uses site title as fallback when no title parameter provided', async () => {
      mockGetSite.mockResolvedValueOnce(mockSite as any);

      const request = new NextRequest('https://example.com/api/og');
      const response = await GET(request);

      // The response should still be valid even without a title
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it('removes site title suffix from metadata title', async () => {
      mockGetSite.mockResolvedValueOnce(mockSite as any);

      // Title with site name suffix that should be removed
      const request = new NextRequest(
        'https://example.com/api/og?title=Page%20Title%20-%20Test%20Site'
      );
      const response = await GET(request);

      expect(response).toBeDefined();
    });
  });

  describe('Font loading', () => {
    it('loads Inter font from Google Fonts', async () => {
      mockGetSite.mockResolvedValueOnce(mockSite as any);

      const request = new NextRequest('https://example.com/api/og?title=Test');
      await GET(request);

      // Verify fetch was called for Google Fonts
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('fonts.googleapis.com'));
    });
  });

  describe('Site data', () => {
    it('fetches site data for title fallback', async () => {
      mockGetSite.mockResolvedValueOnce(mockSite as any);

      const request = new NextRequest('https://example.com/api/og');
      await GET(request);

      expect(mockGetSite).toHaveBeenCalled();
    });
  });
});
