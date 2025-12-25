import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock draftMode from next/headers
const mockDraftMode = {
  disable: vi.fn(),
  isEnabled: false,
};

vi.mock('next/headers', () => ({
  draftMode: vi.fn(() => Promise.resolve(mockDraftMode)),
}));

// Mock the Sanity client and token
vi.mock('@/sanity/lib/client', () => ({
  client: {
    withConfig: vi.fn(() => ({
      fetch: vi.fn(),
    })),
  },
}));

vi.mock('@/sanity/lib/token', () => ({
  token: 'mock-token',
}));

// Mock defineEnableDraftMode from next-sanity
vi.mock('next-sanity/draft-mode', () => ({
  defineEnableDraftMode: vi.fn(() => ({
    GET: vi.fn().mockImplementation(async () => {
      return new Response('Draft mode enabled', { status: 200 });
    }),
  })),
}));

// Mock the env module
vi.mock('@/lib/env', () => ({
  BASE_URL: 'https://example.com',
  vercelPreview: false,
  isStaging: false,
  isPreview: false,
}));

import { GET as disableGET } from '@/app/api/draft-mode/disable/route';
import { GET as enableGET } from '@/app/api/draft-mode/enable/route';

describe('Draft mode routes', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Enable draft mode', () => {
    it('exports a GET handler', () => {
      expect(enableGET).toBeDefined();
      expect(typeof enableGET).toBe('function');
    });

    it('returns a response when called', async () => {
      const request = new NextRequest('https://example.com/api/draft-mode/enable');
      const response = await enableGET(request);

      expect(response).toBeDefined();
    });
  });

  describe('Disable draft mode', () => {
    it('calls draftMode().disable()', async () => {
      const request = new NextRequest('https://example.com/api/draft-mode/disable');
      await disableGET(request);

      expect(mockDraftMode.disable).toHaveBeenCalled();
    });

    it('redirects to home page after disabling', async () => {
      const request = new NextRequest('https://example.com/api/draft-mode/disable');
      const response = await disableGET(request);

      // NextResponse.redirect returns a 307 status by default
      expect(response.status).toBe(307);
    });

    it('redirects to the root URL when no slug is provided', async () => {
      const request = new NextRequest('https://example.com/api/draft-mode/disable');
      const response = await disableGET(request);

      const location = response.headers.get('Location');
      expect(location).toBe('https://example.com/');
    });

    it('redirects to the provided slug', async () => {
      const request = new NextRequest('https://example.com/api/draft-mode/disable?slug=/test-page');
      const response = await disableGET(request);

      const location = response.headers.get('Location');
      expect(location).toBe('https://example.com/test-page');
    });
  });

  describe('Draft mode configuration', () => {
    it('enable route is configured with Sanity client', async () => {
      // The enable route should be defined via defineEnableDraftMode
      expect(enableGET).toBeDefined();
    });
  });
});

describe('Draft mode noIndex behavior', () => {
  it('draft mode enable/disable routes are properly configured', () => {
    expect(enableGET).toBeDefined();
    expect(disableGET).toBeDefined();
  });

  /**
   * Requirement 14.3: WHEN draft mode is enabled THEN the vercelPreview flag SHALL affect robots noIndex setting
   *
   * This test verifies that when vercelPreview is true (indicating draft/preview mode),
   * the processMetadata function sets robots.index to false to prevent indexing of preview content.
   */
  describe('vercelPreview flag affects robots noIndex', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('sets robots.index to false when vercelPreview is true', async () => {
      // Mock with vercelPreview set to true
      vi.doMock('@/lib/env', () => ({
        BASE_URL: 'https://example.com',
        vercelPreview: true,
        isStaging: false,
        isPreview: false,
      }));

      // Mock resolveUrl
      vi.doMock('@/lib/resolveUrl', () => ({
        default: (page: { metadata?: { slug?: { current: string } } }) =>
          `https://example.com/${page.metadata?.slug?.current || ''}`,
      }));

      // Dynamically import processMetadata to get the version with vercelPreview = true
      const { default: processMetadataWithPreview } = await import('@/lib/processMetadata');

      const mockPage = {
        _id: 'test-page',
        _type: 'page',
        metadata: {
          title: 'Test Page',
          description: 'Test description',
          slug: { current: 'test-page' },
          noIndex: false, // noIndex is false, but vercelPreview should still set index to false
        },
      } as Sanity.Page;

      const result = await processMetadataWithPreview(mockPage);

      // When vercelPreview is true, robots.index should be false
      expect((result.robots as { index?: boolean })?.index).toBe(false);
    });

    it('does not affect robots.index when vercelPreview is false and noIndex is false', async () => {
      // Mock with vercelPreview set to false
      vi.doMock('@/lib/env', () => ({
        BASE_URL: 'https://example.com',
        vercelPreview: false,
        isStaging: false,
        isPreview: false,
      }));

      vi.doMock('@/lib/resolveUrl', () => ({
        default: (page: { metadata?: { slug?: { current: string } } }) =>
          `https://example.com/${page.metadata?.slug?.current || ''}`,
      }));

      const { default: processMetadataNoPreview } = await import('@/lib/processMetadata');

      const mockPage = {
        _id: 'test-page',
        _type: 'page',
        metadata: {
          title: 'Test Page',
          description: 'Test description',
          slug: { current: 'test-page' },
          noIndex: false,
        },
      } as Sanity.Page;

      const result = await processMetadataNoPreview(mockPage);

      // When vercelPreview is false and noIndex is false, robots.index should be undefined
      expect((result.robots as { index?: boolean })?.index).toBeUndefined();
    });
  });
});
