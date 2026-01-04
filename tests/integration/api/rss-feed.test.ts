import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n/config';

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

// Mock collection registry to simulate collection lookup
vi.mock('@/lib/collections/registry', () => ({
  getCollectionTypeFromSlug: vi.fn((slug: string, _locale: string) => {
    // Map common test slugs to collection types
    if (slug === 'articles' || slug === 'now' || slug === 'artikler') {
      return 'collection.article';
    }
    if (slug === 'changelog' || slug === 'endringslogg') {
      return 'collection.changelog';
    }
    if (slug === 'docs' || slug === 'dokumentasjon') {
      return 'collection.documentation';
    }
    if (slug === 'newsletter' || slug === 'nyhetsbrev') {
      return 'collection.newsletter';
    }
    if (slug === 'events' || slug === 'hendelser') {
      return 'collection.events';
    }
    return undefined;
  }),
  getCollectionMetadata: vi.fn((type: string, locale: string) => {
    // Return metadata based on collection type
    const metadata: Record<string, { type: string; slug: string; name: string }> = {
      'collection.article': {
        type: 'collection.article',
        slug: locale === 'nb' ? 'artikler' : 'articles',
        name: 'Articles',
      },
      'collection.changelog': {
        type: 'collection.changelog',
        slug: locale === 'nb' ? 'endringslogg' : 'changelog',
        name: 'Changelog',
      },
      'collection.documentation': {
        type: 'collection.documentation',
        slug: locale === 'nb' ? 'dokumentasjon' : 'docs',
        name: 'Documentation',
      },
      'collection.newsletter': {
        type: 'collection.newsletter',
        slug: locale === 'nb' ? 'nyhetsbrev' : 'newsletter',
        name: 'Newsletter',
      },
      'collection.events': {
        type: 'collection.events',
        slug: locale === 'nb' ? 'hendelser' : 'events',
        name: 'Events',
      },
    };
    return metadata[type];
  }),
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
      mockFetch.mockResolvedValueOnce([
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

      const response = await GET(createMockRequest('en', 'articles'), {
        params: createMockParams('en', 'articles'),
      });

      expect(response.headers.get('Content-Type')).toContain('application/xml');
    });

    it('includes cache headers', async () => {
      mockFetch.mockResolvedValueOnce([]);

      const response = await GET(createMockRequest('en', 'articles'), {
        params: createMockParams('en', 'articles'),
      });

      expect(response.headers.get('Cache-Control')).toContain('s-maxage=3600');
    });
  });

  describe('XSL Stylesheet Reference', () => {
    it('includes XSL stylesheet reference in XML output', async () => {
      mockFetch.mockResolvedValueOnce([]);

      const response = await GET(createMockRequest('en', 'articles'), {
        params: createMockParams('en', 'articles'),
      });
      const xml = await response.text();

      expect(xml).toContain('<?xml-stylesheet type="text/xsl" href="/rss.xsl"?>');
    });
  });

  describe('RSS Structure', () => {
    it('returns valid RSS 2.0 structure with channel elements', async () => {
      mockFetch.mockResolvedValueOnce([]);

      const response = await GET(createMockRequest('en', 'articles'), {
        params: createMockParams('en', 'articles'),
      });
      const xml = await response.text();

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<rss version="2.0"');
      expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
      expect(xml).toContain('<channel>');
      expect(xml).toContain('<title>Articles</title>');
      expect(xml).toContain('<link>https://test.example.com/articles</link>');
      expect(xml).toContain('<description>Latest updates from Articles</description>');
      expect(xml).toContain('<language>en</language>');
      expect(xml).toContain('</channel>');
      expect(xml).toContain('</rss>');
    });

    it('includes atom:link self reference', async () => {
      mockFetch.mockResolvedValueOnce([]);

      const response = await GET(createMockRequest('en', 'articles'), {
        params: createMockParams('en', 'articles'),
      });
      const xml = await response.text();

      expect(xml).toContain('<atom:link href="https://test.example.com/articles/rss.xml"');
      expect(xml).toContain('rel="self"');
      expect(xml).toContain('type="application/rss+xml"');
    });
  });

  describe('RSS Items', () => {
    it('includes item elements with required fields', async () => {
      mockFetch.mockResolvedValueOnce([
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

      const response = await GET(createMockRequest('en', 'articles'), {
        params: createMockParams('en', 'articles'),
      });
      const xml = await response.text();

      expect(xml).toContain('<item>');
      expect(xml).toContain('<title>Test Article</title>');
      expect(xml).toContain('<link>https://test.example.com/articles/test-article</link>');
      expect(xml).toContain(
        '<guid isPermaLink="true">https://test.example.com/articles/test-article</guid>'
      );
      expect(xml).toContain('<pubDate>');
      expect(xml).toContain('<description>Article description</description>');
      expect(xml).toContain('<author>Jane Smith</author>');
      expect(xml).toContain('<category>Technology</category>');
      expect(xml).toContain('</item>');
    });

    it('handles items without optional fields', async () => {
      mockFetch.mockResolvedValueOnce([
        {
          _id: 'post-1',
          title: 'Minimal Post',
          slug: 'minimal-post',
          publishDate: '2024-01-01T00:00:00Z',
        },
      ]);

      const response = await GET(createMockRequest('en', 'articles'), {
        params: createMockParams('en', 'articles'),
      });
      const xml = await response.text();

      expect(xml).toContain('<title>Minimal Post</title>');
      expect(xml).not.toContain('<description></description>');
      expect(xml).not.toContain('<author></author>');
    });
  });

  describe('Locale Handling', () => {
    // Map locales to their collection slugs (from the mock)
    const localeCollectionSlugs: Record<string, string> = {
      en: 'articles',
      nb: 'artikler',
      ar: 'articles', // Arabic uses 'articles' in the mock
    };

    // Test each non-default locale explicitly
    SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE).forEach((locale) => {
      it(`uses locale prefix for ${locale} (non-default locale)`, async () => {
        mockFetch.mockResolvedValueOnce([
          {
            _id: 'post-1',
            title: 'Test Post',
            slug: 'test-post',
            publishDate: '2024-01-01T00:00:00Z',
          },
        ]);

        const collectionSlug = localeCollectionSlugs[locale] || 'articles';
        const response = await GET(createMockRequest(locale, collectionSlug), {
          params: createMockParams(locale, collectionSlug),
        });
        const xml = await response.text();

        expect(xml).toContain(`<link>https://test.example.com/${locale}/${collectionSlug}</link>`);
        expect(xml).toContain(
          `<link>https://test.example.com/${locale}/${collectionSlug}/test-post</link>`
        );
        expect(xml).toContain(`<language>${locale}</language>`);
      });
    });

    it('omits locale prefix for default locale', async () => {
      mockFetch.mockResolvedValueOnce([]);

      const response = await GET(createMockRequest(DEFAULT_LOCALE, 'articles'), {
        params: createMockParams(DEFAULT_LOCALE, 'articles'),
      });
      const xml = await response.text();

      expect(xml).toContain('<link>https://test.example.com/articles</link>');
      expect(xml).not.toContain(`/${DEFAULT_LOCALE}/articles`);
    });
  });

  describe('Collection Type Detection', () => {
    it('returns 404 for non-collection pages', async () => {
      // No mocks needed - the collection registry will return undefined for 'about'
      const response = await GET(createMockRequest('en', 'about'), {
        params: createMockParams('en', 'about'),
      });

      expect(response.status).toBe(404);
    });

    it('returns 404 for non-existent pages', async () => {
      // No mock needed - 'nonexistent' slug is not in the registry
      const response = await GET(createMockRequest('en', 'nonexistent'), {
        params: createMockParams('en', 'nonexistent'),
      });

      expect(response.status).toBe(404);
    });

    it.each([
      ['articles', 'collection.article'],
      ['changelog', 'collection.changelog'],
      ['docs', 'collection.documentation'],
      ['events', 'collection.events'],
      ['newsletter', 'collection.newsletter'],
    ])('handles %s frontpage type correctly', async (collectionSlug, _expectedDocType) => {
      mockFetch.mockResolvedValueOnce([]);

      const response = await GET(createMockRequest('en', collectionSlug), {
        params: createMockParams('en', collectionSlug),
      });

      expect(response.status).toBe(200);
      // Verify the collection items were fetched
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('XML Escaping', () => {
    it('escapes special XML characters in content', async () => {
      mockFetch.mockResolvedValueOnce([
        {
          _id: 'post-1',
          title: "Tom's Guide to A&B <Testing>",
          slug: 'toms-guide',
          description: 'A "quoted" description with <brackets>',
          publishDate: '2024-01-01T00:00:00Z',
        },
      ]);

      const response = await GET(createMockRequest('en', 'articles'), {
        params: createMockParams('en', 'articles'),
      });
      const xml = await response.text();

      // Item escaping
      expect(xml).toContain('Tom&apos;s Guide');
      expect(xml).toContain('A&amp;B');
      expect(xml).toContain('&lt;Testing&gt;');
      expect(xml).toContain('&quot;quoted&quot;');
      expect(xml).toContain('&lt;brackets&gt;');
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
    it.skip('sitemap-index.xsl is now a dynamic route, not a static file', () => {
      // This test is skipped because sitemap-index.xsl is now generated
      // dynamically via /sitemap-index.xsl/route.ts instead of being a static file
    });
  });
});
