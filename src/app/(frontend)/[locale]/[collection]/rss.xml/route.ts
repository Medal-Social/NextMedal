/**
 * Dynamic RSS Feed Route for Collections
 * @version 2.0.0
 * @lastUpdated 2025-12-30
 * @description Generates RSS feeds for collection pages (articles, changelog, newsletter, docs).
 */

import { NextResponse } from 'next/server';
import { groq } from 'next-sanity';
import { BASE_URL } from '@/lib/core/env';
import { logger } from '@/lib/core/logger';
import { client } from '@/sanity/lib/client';

// All frontpage module types that support RSS
const FRONTPAGE_MODULES = [
  'articles-frontpage',
  'changelog-frontpage',
  'docs-frontpage',
  'events-frontpage',
  'newsletter-frontpage',
] as const;

type FrontpageModuleType = (typeof FRONTPAGE_MODULES)[number];

interface CollectionItem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  publishDate: string;
  authors?: { name: string }[];
  categories?: { title: string }[];
  version?: string; // For changelog
  issueNumber?: number; // For newsletter
}

interface CollectionPage {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  frontpageType: FrontpageModuleType | null;
}

// Check if a page is a collection and get the frontpage module type
async function getCollectionPage(
  collectionSlug: string,
  locale: string
): Promise<CollectionPage | null> {
  return await client.withConfig({ stega: false }).fetch(
    groq`*[
      _type == 'page' &&
      metadata.slug.current == $collectionSlug &&
      (language == $locale || language == null)
    ][0]{
      _id,
      'title': metadata.title,
      'slug': metadata.slug.current,
      'description': seo.description,
      'frontpageType': modules[_type in ['articles-frontpage', 'changelog-frontpage', 'docs-frontpage', 'events-frontpage', 'newsletter-frontpage']][0]._type
    }`,
    { collectionSlug, locale }
  );
}

// Map frontpage module type to document type
const DOCUMENT_TYPE_MAP: Record<FrontpageModuleType, string> = {
  'articles-frontpage': 'collection.article',
  'changelog-frontpage': 'collection.changelog',
  'docs-frontpage': 'collection.documentation',
  'events-frontpage': 'collection.events',
  'newsletter-frontpage': 'collection.newsletter',
};

// Fetch items for a collection based on frontpage type
async function getCollectionItems(
  collectionSlug: string,
  locale: string,
  frontpageType: FrontpageModuleType
): Promise<CollectionItem[]> {
  const documentType = DOCUMENT_TYPE_MAP[frontpageType];

  // Different queries for different collection types
  if (frontpageType === 'changelog-frontpage') {
    return await client.withConfig({ stega: false }).fetch(
      groq`*[
        _type == $documentType &&
        collection->metadata.slug.current == $collectionSlug &&
        (language == $locale || language == null) &&
        defined(publishDate)
      ]|order(publishDate desc)[0...50]{
        _id,
        'title': coalesce(metadata.title, "Version " + version, "Release"),
        'slug': metadata.slug.current,
        'description': summary,
        publishDate,
        version
      }`,
      { collectionSlug, locale, documentType }
    );
  }

  if (frontpageType === 'newsletter-frontpage') {
    return await client.withConfig({ stega: false }).fetch(
      groq`*[
        _type == $documentType &&
        collection->metadata.slug.current == $collectionSlug &&
        (language == $locale || language == null) &&
        defined(publishDate)
      ]|order(publishDate desc)[0...50]{
        _id,
        'title': coalesce(metadata.title, "Issue #" + string(issueNumber)),
        'slug': metadata.slug.current,
        'description': preheader,
        publishDate,
        issueNumber
      }`,
      { collectionSlug, locale, documentType }
    );
  }

  if (frontpageType === 'docs-frontpage') {
    return await client.withConfig({ stega: false }).fetch(
      groq`*[
        _type == $documentType &&
        collection->metadata.slug.current == $collectionSlug &&
        (language == $locale || language == null)
      ]|order(order asc)[0...50]{
        _id,
        'title': metadata.title,
        'slug': metadata.slug.current,
        'description': excerpt,
        'publishDate': _updatedAt
      }`,
      { collectionSlug, locale, documentType }
    );
  }

  if (frontpageType === 'events-frontpage') {
    return await client.withConfig({ stega: false }).fetch(
      groq`*[
        _type == $documentType &&
        collection->metadata.slug.current == $collectionSlug &&
        (language == $locale || language == null)
      ]|order(startDateTime desc)[0...50]{
        _id,
        'title': metadata.title,
        'slug': metadata.slug.current,
        'description': metadata.description,
        'publishDate': startDateTime
      }`,
      { collectionSlug, locale, documentType }
    );
  }

  // Default: articles-frontpage (collection.article)
  return await client.withConfig({ stega: false }).fetch(
    groq`*[
      _type == $documentType &&
      collection->metadata.slug.current == $collectionSlug &&
      language == $locale &&
      defined(publishDate)
    ]|order(publishDate desc)[0...50]{
      _id,
      'title': metadata.title,
      'slug': metadata.slug.current,
      'description': coalesce(seo.description, ''),
      publishDate,
      authors[]->{name},
      categories[]->{title}
    }`,
    { collectionSlug, locale, documentType }
  );
}

// Escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generate RSS XML
function generateRss(
  collection: CollectionPage,
  items: CollectionItem[],
  collectionSlug: string,
  locale: string
): string {
  const baseUrl = BASE_URL || 'https://example.com';
  const localePath = locale !== 'en' ? `/${locale}` : '';
  const collectionUrl = `${baseUrl}${localePath}/${collectionSlug}`;

  const rssItems = items
    .map((item) => {
      const itemUrl = `${collectionUrl}/${item.slug}`;
      const pubDate = new Date(item.publishDate).toUTCString();
      const author = item.authors?.[0]?.name || '';
      const categories = item.categories?.map((c) => c.title).join(', ') || '';

      // Build title with version or issue number if available
      let title = item.title || '';
      if (item.version && !title.includes(item.version)) {
        title = `${item.version}: ${title}`;
      }

      return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${itemUrl}</link>
      <guid isPermaLink="true">${itemUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      ${item.description ? `<description>${escapeXml(item.description)}</description>` : ''}
      ${author ? `<author>${escapeXml(author)}</author>` : ''}
      ${categories ? `<category>${escapeXml(categories)}</category>` : ''}
    </item>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/rss.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(collection.title || collectionSlug)}</title>
    <link>${collectionUrl}</link>
    <description>${escapeXml(collection.description || `Latest updates from ${collection.title || collectionSlug}`)}</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${collectionUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;
}

// Generate an error RSS feed for graceful degradation
function generateErrorRss(collectionSlug: string, locale: string, errorMessage: string): string {
  const baseUrl = BASE_URL || 'https://example.com';
  const localePath = locale !== 'en' ? `/${locale}` : '';
  const collectionUrl = `${baseUrl}${localePath}/${collectionSlug}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(collectionSlug)}</title>
    <link>${collectionUrl}</link>
    <description>${escapeXml(errorMessage)}</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${collectionUrl}/rss.xml" rel="self" type="application/rss+xml"/>
  </channel>
</rss>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; collection: string }> }
) {
  const { locale, collection: collectionSlug } = await params;

  let collectionPage: CollectionPage | null;

  // Fetch collection page with error handling
  try {
    collectionPage = await getCollectionPage(collectionSlug, locale);
  } catch (error) {
    logger.error(
      { err: error, collectionSlug, locale },
      'RSS feed: Failed to fetch collection page from CMS'
    );

    // Return a 503 Service Unavailable with an error RSS feed
    const errorRss = generateErrorRss(
      collectionSlug,
      locale,
      'Feed temporarily unavailable. Please try again later.'
    );
    return new NextResponse(errorRss, {
      status: 503,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Retry-After': '300', // Suggest retry after 5 minutes
      },
    });
  }

  if (!collectionPage || !collectionPage.frontpageType) {
    return new NextResponse('Not Found', { status: 404 });
  }

  let items: CollectionItem[];

  // Fetch collection items with error handling
  try {
    items = await getCollectionItems(collectionSlug, locale, collectionPage.frontpageType);
  } catch (error) {
    logger.error(
      { err: error, collectionSlug, locale, frontpageType: collectionPage.frontpageType },
      'RSS feed: Failed to fetch collection items from CMS'
    );

    // Return a 503 with an error RSS feed (collection exists but items failed)
    const errorRss = generateErrorRss(
      collectionSlug,
      locale,
      'Feed content temporarily unavailable. Please try again later.'
    );
    return new NextResponse(errorRss, {
      status: 503,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Retry-After': '300',
      },
    });
  }

  // Generate RSS XML
  const rss = generateRss(collectionPage, items, collectionSlug, locale);

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
