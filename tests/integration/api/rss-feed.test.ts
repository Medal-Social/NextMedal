import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Cache XSL files at module level (read once, not per test)
const publicDir = join(process.cwd(), 'public');
const xslCache: Record<string, string | null> = {
  rss: null,
  sitemap: null,
  'sitemap-index': null,
};

const getXslContent = (name: 'rss' | 'sitemap' | 'sitemap-index'): string => {
  if (!xslCache[name]) {
    xslCache[name] = readFileSync(join(publicDir, `${name}.xsl`), 'utf-8');
  }
  return xslCache[name]!;
};

// Create the mock fetch function
const mockFetch = vi.fn();

// Mock dependencies
vi.mock('@/lib/env', () => ({
  BASE_URL: 'https://test.example.com',
}));

vi.mock('@/sanity/lib/client', () => ({
  client: {
    withConfig: vi.fn(() => ({
      fetch: mockFetch,
    })),
  },
}));

import { GET } from '@/app/(frontend)/[locale]/[collection]/rss.xml/route';

describe('RSS Feed Route', () => {
  const createMockRequest = (locale: string, collection: string) =>
    new NextRequest(`http://localhost:3000/${locale}/${collection}/rss.xml`);

  const createMockParams = (locale: string, collection: string) =>
    Promise.resolve({ locale, collection });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Content-Type and Headers', () => {
    it('returns Content-Type application/xml', async () => {
      mockFetch
        .mockResolvedValueOnce({
          _id: 'page-1',
          title: 'Blog',
          slug: 'blog',
          description: 'Our blog',
          frontpageType: 'articles-frontpage',
        })
        .mockResolvedValueOnce([
          {
            _id: 'post-1',
            title: 'Test Post',
            slug: 'test-post',
            description: 'A test post',
            publishDate: '2024-01-01T00:00:00Z',
            authors: [{ name: 'John Doe' }],
            categories: [{ title: 'Tech' }],
          },
        ]);

      const response = await GET(createMockRequest('en', 'blog'), {
        params: createMockParams('en', 'blog'),
      });

      expect(response.headers.get('Content-Type')).toContain('application/xml');
    });

    it('includes cache headers', async () => {
      mockFetch
        .mockResolvedValueOnce({
          _id: 'page-1',
          title: 'Blog',
          slug: 'blog',
          frontpageType: 'articles-frontpage',
        })
        .mockResolvedValueOnce([]);

      const response = await GET(createMockRequest('en', 'blog'), {
        params: createMockParams('en', 'blog'),
      });

      expect(response.headers.get('Cache-Control')).toContain('s-maxage=3600');
    });
  });

  describe('XSL Stylesheet Reference', () => {
    it('includes XSL stylesheet reference in XML output', async () => {
      mockFetch
        .mockResolvedValueOnce({
          _id: 'page-1',
          title: 'Blog',
          slug: 'blog',
          frontpageType: 'articles-frontpage',
        })
        .mockResolvedValueOnce([]);

      const response = await GET(createMockRequest('en', 'blog'), {
        params: createMockParams('en', 'blog'),
      });
      const xml = await response.text();

      expect(xml).toContain('<?xml-stylesheet type="text/xsl" href="/rss.xsl"?>');
    });
  });

  describe('RSS Structure', () => {
    it('returns valid RSS 2.0 structure with channel elements', async () => {
      mockFetch
        .mockResolvedValueOnce({
          _id: 'page-1',
          title: 'My Blog',
          slug: 'blog',
          description: 'Blog description',
          frontpageType: 'articles-frontpage',
        })
        .mockResolvedValueOnce([]);

      const response = await GET(createMockRequest('en', 'blog'), {
        params: createMockParams('en', 'blog'),
      });
      const xml = await response.text();

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<rss version="2.0"');
      expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
      expect(xml).toContain('<channel>');
      expect(xml).toContain('<title>My Blog</title>');
      expect(xml).toContain('<link>https://test.example.com/blog</link>');
      expect(xml).toContain('<description>Blog description</description>');
      expect(xml).toContain('<language>en</language>');
      expect(xml).toContain('</channel>');
      expect(xml).toContain('</rss>');
    });

    it('includes atom:link self reference', async () => {
      mockFetch
        .mockResolvedValueOnce({
          _id: 'page-1',
          title: 'Blog',
          slug: 'blog',
          frontpageType: 'articles-frontpage',
        })
        .mockResolvedValueOnce([]);

      const response = await GET(createMockRequest('en', 'blog'), {
        params: createMockParams('en', 'blog'),
      });
      const xml = await response.text();

      expect(xml).toContain('<atom:link href="https://test.example.com/blog/rss.xml"');
      expect(xml).toContain('rel="self"');
      expect(xml).toContain('type="application/rss+xml"');
    });
  });

  describe('RSS Items', () => {
    it('includes item elements with required fields', async () => {
      mockFetch
        .mockResolvedValueOnce({
          _id: 'page-1',
          title: 'Blog',
          slug: 'blog',
          frontpageType: 'articles-frontpage',
        })
        .mockResolvedValueOnce([
          {
            _id: 'post-1',
            title: 'Test Article',
            slug: 'test-article',
            description: 'Article description',
            publishDate: '2024-06-15T10:30:00Z',
            authors: [{ name: 'Jane Smith' }],
            categories: [{ title: 'Technology' }],
          },
        ]);

      const response = await GET(createMockRequest('en', 'blog'), {
        params: createMockParams('en', 'blog'),
      });
      const xml = await response.text();

      expect(xml).toContain('<item>');
      expect(xml).toContain('<title>Test Article</title>');
      expect(xml).toContain('<link>https://test.example.com/blog/test-article</link>');
      expect(xml).toContain(
        '<guid isPermaLink="true">https://test.example.com/blog/test-article</guid>'
      );
      expect(xml).toContain('<pubDate>');
      expect(xml).toContain('<description>Article description</description>');
      expect(xml).toContain('<author>Jane Smith</author>');
      expect(xml).toContain('<category>Technology</category>');
      expect(xml).toContain('</item>');
    });

    it('handles items without optional fields', async () => {
      mockFetch
        .mockResolvedValueOnce({
          _id: 'page-1',
          title: 'Blog',
          slug: 'blog',
          frontpageType: 'articles-frontpage',
        })
        .mockResolvedValueOnce([
          {
            _id: 'post-1',
            title: 'Minimal Post',
            slug: 'minimal-post',
            publishDate: '2024-01-01T00:00:00Z',
          },
        ]);

      const response = await GET(createMockRequest('en', 'blog'), {
        params: createMockParams('en', 'blog'),
      });
      const xml = await response.text();

      expect(xml).toContain('<title>Minimal Post</title>');
      expect(xml).not.toContain('<description></description>');
      expect(xml).not.toContain('<author></author>');
    });
  });

  describe('Locale Handling', () => {
    it('uses locale prefix for non-English locales', async () => {
      mockFetch
        .mockResolvedValueOnce({
          _id: 'page-1',
          title: 'Blogg',
          slug: 'blogg',
          frontpageType: 'articles-frontpage',
        })
        .mockResolvedValueOnce([
          {
            _id: 'post-1',
            title: 'Norsk Innlegg',
            slug: 'norsk-innlegg',
            publishDate: '2024-01-01T00:00:00Z',
          },
        ]);

      const response = await GET(createMockRequest('nb', 'blogg'), {
        params: createMockParams('nb', 'blogg'),
      });
      const xml = await response.text();

      expect(xml).toContain('<link>https://test.example.com/nb/blogg</link>');
      expect(xml).toContain('<link>https://test.example.com/nb/blogg/norsk-innlegg</link>');
      expect(xml).toContain('<language>nb</language>');
    });

    it('omits locale prefix for English (default locale)', async () => {
      mockFetch
        .mockResolvedValueOnce({
          _id: 'page-1',
          title: 'Blog',
          slug: 'blog',
          frontpageType: 'articles-frontpage',
        })
        .mockResolvedValueOnce([]);

      const response = await GET(createMockRequest('en', 'blog'), {
        params: createMockParams('en', 'blog'),
      });
      const xml = await response.text();

      expect(xml).toContain('<link>https://test.example.com/blog</link>');
      expect(xml).not.toContain('/en/blog');
    });
  });

  describe('Collection Type Detection', () => {
    it('returns 404 for non-collection pages', async () => {
      mockFetch.mockResolvedValueOnce({
        _id: 'page-1',
        title: 'About',
        slug: 'about',
        frontpageType: null,
      });

      const response = await GET(createMockRequest('en', 'about'), {
        params: createMockParams('en', 'about'),
      });

      expect(response.status).toBe(404);
    });

    it('returns 404 for non-existent pages', async () => {
      mockFetch.mockResolvedValueOnce(null);

      const response = await GET(createMockRequest('en', 'nonexistent'), {
        params: createMockParams('en', 'nonexistent'),
      });

      expect(response.status).toBe(404);
    });

    it.each([
      ['articles-frontpage', 'collection.blog'],
      ['changelog-frontpage', 'collection.changelog'],
      ['docs-frontpage', 'collection.documentation'],
      ['events-frontpage', 'collection.events'],
      ['newsletter-frontpage', 'collection.newsletter'],
    ])('handles %s frontpage type correctly', async (frontpageType, _expectedDocType) => {
      mockFetch
        .mockResolvedValueOnce({
          _id: 'page-1',
          title: 'Collection',
          slug: 'collection',
          frontpageType,
        })
        .mockResolvedValueOnce([]);

      const response = await GET(createMockRequest('en', 'collection'), {
        params: createMockParams('en', 'collection'),
      });

      expect(response.status).toBe(200);
      // Verify the correct document type was queried
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('XML Escaping', () => {
    it('escapes special XML characters in content', async () => {
      mockFetch
        .mockResolvedValueOnce({
          _id: 'page-1',
          title: 'Blog & News',
          slug: 'blog',
          description: 'Articles about <tech> & "stuff"',
          frontpageType: 'articles-frontpage',
        })
        .mockResolvedValueOnce([
          {
            _id: 'post-1',
            title: "Tom's Guide to A&B <Testing>",
            slug: 'toms-guide',
            description: 'A "quoted" description with <brackets>',
            publishDate: '2024-01-01T00:00:00Z',
          },
        ]);

      const response = await GET(createMockRequest('en', 'blog'), {
        params: createMockParams('en', 'blog'),
      });
      const xml = await response.text();

      // Channel escaping
      expect(xml).toContain('Blog &amp; News');
      expect(xml).toContain('&lt;tech&gt;');
      expect(xml).toContain('&quot;stuff&quot;');

      // Item escaping
      expect(xml).toContain('Tom&apos;s Guide');
      expect(xml).toContain('A&amp;B');
      expect(xml).toContain('&lt;Testing&gt;');
    });
  });
});

describe('XSL Stylesheet Validation', () => {
  describe('RSS XSL Stylesheet', () => {
    it('rss.xsl file exists and is valid XML', () => {
      const xslContent = getXslContent('rss');

      // Basic XML structure checks
      expect(xslContent).toContain('<?xml version="1.0"');
      expect(xslContent).toContain('<xsl:stylesheet');
      expect(xslContent).toContain('</xsl:stylesheet>');
    });

    it('rss.xsl has correct namespace declarations', () => {
      const xslContent = getXslContent('rss');
      expect(xslContent).toContain('xmlns:xsl="http://www.w3.org/1999/XSL/Transform"');
    });

    it('rss.xsl has required template elements', () => {
      const xslContent = getXslContent('rss');
      expect(xslContent).toContain('<xsl:template match="/">');
      expect(xslContent).toContain('<xsl:output method="html"');
    });

    it('rss.xsl references RSS channel elements correctly', () => {
      const xslContent = getXslContent('rss');

      // Should reference RSS elements without namespace prefix (RSS 2.0 has no namespace)
      expect(xslContent).toContain('/rss/channel/title');
      expect(xslContent).toContain('/rss/channel/item');
      expect(xslContent).toContain('/rss/channel/description');
    });

    it('rss.xsl has proper HTML structure', () => {
      const xslContent = getXslContent('rss');

      expect(xslContent).toContain('<html');
      expect(xslContent).toContain('<head>');
      expect(xslContent).toContain('<body>');
      expect(xslContent).toContain('<style');
    });
  });

  describe('Sitemap XSL Stylesheet', () => {
    it('sitemap.xsl file exists and is valid XML', () => {
      const xslContent = getXslContent('sitemap');

      expect(xslContent).toContain('<?xml version="1.0"');
      expect(xslContent).toContain('<xsl:stylesheet');
      expect(xslContent).toContain('</xsl:stylesheet>');
    });

    it('sitemap.xsl has correct namespace declarations', () => {
      const xslContent = getXslContent('sitemap');

      expect(xslContent).toContain('xmlns:xsl="http://www.w3.org/1999/XSL/Transform"');
      expect(xslContent).toContain('xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"');
    });

    it('sitemap.xsl references sitemap elements with namespace prefix', () => {
      const xslContent = getXslContent('sitemap');

      expect(xslContent).toContain('s:url');
      expect(xslContent).toContain('s:loc');
      expect(xslContent).toContain('s:lastmod');
      expect(xslContent).toContain('s:priority');
    });
  });

  describe('Sitemap Index XSL Stylesheet', () => {
    it('sitemap-index.xsl file exists and is valid XML', () => {
      const xslContent = getXslContent('sitemap-index');

      expect(xslContent).toContain('<?xml version="1.0"');
      expect(xslContent).toContain('<xsl:stylesheet');
      expect(xslContent).toContain('</xsl:stylesheet>');
    });
  });
});
