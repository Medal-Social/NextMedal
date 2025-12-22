import fc from 'fast-check';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the fetchSanityLive function
vi.mock('@/sanity/lib/live', () => ({
  fetchSanityLive: vi.fn(),
}));

// Mock resolveUrl
vi.mock('@/lib/resolveUrl', () => ({
  default: vi.fn((page) => `https://example.com/${page.metadata?.slug?.current || ''}`),
}));

// Mock urlFor
vi.mock('@/sanity/lib/image', () => ({
  urlFor: vi.fn(() => ({
    url: () => 'https://cdn.sanity.io/images/test/production/test-image.jpg',
  })),
}));

import { GET } from '@/app/(frontend)/[locale]/blog/rss.xml/route';
import { fetchSanityLive } from '@/sanity/lib/live';

const mockFetchSanityLive = vi.mocked(fetchSanityLive);

describe('RSS feed route', () => {
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

  const mockBlogPage = {
    _type: 'page',
    title: 'Blog',
    metadata: {
      title: 'Blog',
      description: 'Our blog posts',
      slug: { current: 'blog' },
    },
  };

  const mockPost = {
    _type: 'blog.post',
    publishDate: '2024-01-15T00:00:00Z',
    authors: [{ name: 'John Doe' }],
    metadata: {
      title: 'Test Post',
      description: 'A test blog post',
      slug: { current: 'test-post' },
    },
    body: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Hello world' }],
      },
    ],
    image: 'https://example.com/image.jpg',
  };

  describe('Content-Type', () => {
    it('returns Content-Type application/atom+xml', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        blog: mockBlogPage,
        posts: [mockPost],
        copyright: '© 2024 Example',
      });

      const response = await GET();
      expect(response.headers.get('Content-Type')).toBe('application/atom+xml');
    });
  });

  describe('Feed metadata', () => {
    it('includes feed title from blog page', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        blog: mockBlogPage,
        posts: [mockPost],
        copyright: '© 2024 Example',
      });

      const response = await GET();
      const xml = await response.text();

      expect(xml).toContain('<title>Blog</title>');
    });

    it('includes feed description', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        blog: mockBlogPage,
        posts: [mockPost],
        copyright: '© 2024 Example',
      });

      const response = await GET();
      const xml = await response.text();

      expect(xml).toContain('Our blog posts');
    });

    it('includes feed link', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        blog: mockBlogPage,
        posts: [mockPost],
        copyright: '© 2024 Example',
      });

      const response = await GET();
      const xml = await response.text();

      expect(xml).toContain('<link');
    });

    it('includes copyright information', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        blog: mockBlogPage,
        posts: [mockPost],
        copyright: '© 2024 Example',
      });

      const response = await GET();
      const xml = await response.text();

      expect(xml).toContain('© 2024 Example');
    });
  });

  describe('Item elements', () => {
    it('includes item elements for blog posts', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        blog: mockBlogPage,
        posts: [mockPost],
        copyright: '© 2024 Example',
      });

      const response = await GET();
      const xml = await response.text();

      expect(xml).toContain('<entry>');
      expect(xml).toContain('Test Post');
    });

    it('includes post title in item', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        blog: mockBlogPage,
        posts: [mockPost],
        copyright: '© 2024 Example',
      });

      const response = await GET();
      const xml = await response.text();

      expect(xml).toContain('Test Post');
    });

    it('includes post description in item', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        blog: mockBlogPage,
        posts: [mockPost],
        copyright: '© 2024 Example',
      });

      const response = await GET();
      const xml = await response.text();

      expect(xml).toContain('A test blog post');
    });

    it('includes published date in item', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        blog: mockBlogPage,
        posts: [mockPost],
        copyright: '© 2024 Example',
      });

      const response = await GET();
      const xml = await response.text();

      expect(xml).toContain('<published>');
    });
  });

  describe('Author information', () => {
    it('includes author information when post has authors', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        blog: mockBlogPage,
        posts: [mockPost],
        copyright: '© 2024 Example',
      });

      const response = await GET();
      const xml = await response.text();

      expect(xml).toContain('<author>');
      expect(xml).toContain('John Doe');
    });

    it('handles posts without authors', async () => {
      const postWithoutAuthor = { ...mockPost, authors: undefined };
      mockFetchSanityLive.mockResolvedValueOnce({
        blog: mockBlogPage,
        posts: [postWithoutAuthor],
        copyright: '© 2024 Example',
      });

      const response = await GET();
      expect(response.status).toBe(200);
    });
  });

  describe('Image handling', () => {
    it('escapes images in content properly', async () => {
      const postWithImage = {
        ...mockPost,
        body: [
          {
            _type: 'image',
            alt: 'Test image',
            asset: { _ref: 'image-123' },
          },
        ],
      };

      mockFetchSanityLive.mockResolvedValueOnce({
        blog: mockBlogPage,
        posts: [postWithImage],
        copyright: '© 2024 Example',
      });

      const response = await GET();
      const xml = await response.text();

      // The image should be rendered with proper escaping
      expect(xml).toContain('<img');
      expect(xml).toContain('alt=');
    });
  });

  describe('Error handling', () => {
    it('returns 500 status when Sanity CMS is unavailable', async () => {
      mockFetchSanityLive.mockRejectedValueOnce(new Error('CMS unavailable'));

      const response = await GET();

      expect(response.status).toBe(500);
    });

    it('returns 500 when blog page is missing', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        blog: null,
        posts: [mockPost],
        copyright: '© 2024 Example',
      });

      const response = await GET();

      expect(response.status).toBe(500);
    });

    it('returns 500 when posts are missing', async () => {
      mockFetchSanityLive.mockResolvedValueOnce({
        blog: mockBlogPage,
        posts: null,
        copyright: '© 2024 Example',
      });

      const response = await GET();

      expect(response.status).toBe(500);
    });
  });

  describe('Posts without metadata', () => {
    it('skips posts without metadata', async () => {
      const postWithoutMetadata = { ...mockPost, metadata: undefined };
      mockFetchSanityLive.mockResolvedValueOnce({
        blog: mockBlogPage,
        posts: [postWithoutMetadata, mockPost],
        copyright: '© 2024 Example',
      });

      const response = await GET();
      const xml = await response.text();

      // Should only include the post with metadata
      expect(response.status).toBe(200);
      expect(xml).toContain('Test Post');
    });
  });
});

/**
 * Property-Based Tests for RSS Feed
 */
describe('RSS feed property tests', () => {
  const mockBlogPage = {
    _type: 'page',
    title: 'Blog',
    metadata: {
      title: 'Blog',
      description: 'Our blog posts',
      slug: { current: 'blog' },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
  });

  // Generator for safe alphanumeric strings (no special chars that need escaping)
  const safeStringArb = fc
    .string({ minLength: 3, maxLength: 30 })
    .filter((s) => /^[a-zA-Z][a-zA-Z0-9 ]*[a-zA-Z0-9]$/.test(s) && !/\s{2,}/.test(s));

  // Generator for valid ISO date strings
  const isoDateArb = fc
    .date({
      min: new Date('2020-01-01T00:00:00.000Z'),
      max: new Date('2024-12-31T23:59:59.999Z'),
      noInvalidDate: true,
    })
    .map((d) => d.toISOString());

  // Generator for valid slug strings
  const slugArb = fc
    .string({ minLength: 3, maxLength: 30 })
    .filter((s) => /^[a-z][a-z0-9-]*[a-z0-9]$/.test(s));

  // Generator for valid blog post with safe strings
  const blogPostArb = fc.record({
    _type: fc.constant('blog.post'),
    publishDate: isoDateArb,
    authors: fc.option(
      fc.array(
        fc.record({
          name: safeStringArb,
        }),
        { minLength: 1, maxLength: 3 }
      ),
      { nil: undefined }
    ),
    metadata: fc.record({
      title: safeStringArb,
      description: safeStringArb,
      slug: fc.record({
        current: slugArb,
      }),
    }),
    body: fc.constant([
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Content' }],
      },
    ]),
    image: fc.option(fc.webUrl(), { nil: undefined }),
  });

  /**
   * **Feature: component-accessibility-testing, Property 28: RSS Item Completeness**
   * *For any* blog post included in the RSS feed, the feed item SHALL contain title, description, link, published date, and content fields.
   * **Validates: Requirements 9.3**
   */
  it('Property 28: every RSS item contains title, description, link, published date, and content', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(blogPostArb, { minLength: 1, maxLength: 5 }), async (posts) => {
        mockFetchSanityLive.mockResolvedValueOnce({
          blog: mockBlogPage,
          posts,
          copyright: '© 2024 Example',
        });

        const response = await GET();
        const xml = await response.text();

        // Verify structural elements are present for each entry
        const entryCount = (xml.match(/<entry>/g) || []).length;
        expect(entryCount).toBe(posts.length);

        // Verify each post's data appears in the feed
        for (const post of posts) {
          // Title should be present
          expect(xml).toContain(post.metadata.title);
          // Description should be present
          expect(xml).toContain(post.metadata.description);
        }

        // Verify required elements are present
        expect(xml).toContain('<link');
        expect(xml).toContain('<published>');
        expect(xml).toContain('<content');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: component-accessibility-testing, Property 29: RSS Author Inclusion**
   * *For any* blog post with authors defined, the RSS feed item SHALL include author information for each author.
   * **Validates: Requirements 9.4**
   */
  it('Property 29: posts with authors include author information in feed', async () => {
    // Generator for posts that always have authors with safe names
    const postWithAuthorsArb = fc.record({
      _type: fc.constant('blog.post'),
      publishDate: isoDateArb,
      authors: fc.array(
        fc.record({
          name: safeStringArb,
        }),
        { minLength: 1, maxLength: 3 }
      ),
      metadata: fc.record({
        title: safeStringArb,
        description: safeStringArb,
        slug: fc.record({
          current: slugArb,
        }),
      }),
      body: fc.constant([
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Content' }],
        },
      ]),
    });

    await fc.assert(
      fc.asyncProperty(
        fc.array(postWithAuthorsArb, { minLength: 1, maxLength: 3 }),
        async (posts) => {
          mockFetchSanityLive.mockResolvedValueOnce({
            blog: mockBlogPage,
            posts,
            copyright: '© 2024 Example',
          });

          const response = await GET();
          const xml = await response.text();

          // Verify author element is present
          expect(xml).toContain('<author>');

          // Verify each author name appears in the feed
          for (const post of posts) {
            if (post.authors) {
              for (const author of post.authors) {
                expect(xml).toContain(author.name);
              }
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: component-accessibility-testing, Property 30: RSS Image Escaping**
   * *For any* blog post body containing images, the RSS feed content SHALL include properly escaped img elements with alt attributes.
   * **Validates: Requirements 9.5**
   */
  it('Property 30: images in post body are properly escaped with alt attributes', async () => {
    // Generator for image asset refs
    const assetRefArb = fc
      .string({ minLength: 5, maxLength: 20 })
      .filter((s) => /^[a-z][a-z0-9-]*[a-z0-9]$/.test(s));

    // Generator for posts with images in body using safe alt text
    const postWithImageArb = fc.record({
      _type: fc.constant('blog.post'),
      publishDate: isoDateArb,
      authors: fc.constant([{ name: 'Author' }]),
      metadata: fc.record({
        title: safeStringArb,
        description: safeStringArb,
        slug: fc.record({
          current: slugArb,
        }),
      }),
      body: fc.array(
        fc.record({
          _type: fc.constant('image'),
          alt: safeStringArb,
          asset: fc.record({
            _ref: assetRefArb,
          }),
        }),
        { minLength: 1, maxLength: 3 }
      ),
    });

    await fc.assert(
      fc.asyncProperty(postWithImageArb, async (post) => {
        mockFetchSanityLive.mockResolvedValueOnce({
          blog: mockBlogPage,
          posts: [post],
          copyright: '© 2024 Example',
        });

        const response = await GET();
        const xml = await response.text();

        // Verify img elements are present with alt attributes
        expect(xml).toContain('<img');
        expect(xml).toContain('alt=');

        // Verify each image's alt text appears in the feed
        for (const block of post.body) {
          if (block._type === 'image' && block.alt) {
            expect(xml).toContain(block.alt);
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});
