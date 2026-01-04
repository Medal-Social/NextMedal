/**
 * Dynamic RSS Feed Route for Collections
 * @version 2.0.0
 * @lastUpdated 2025-12-30
 * @description Generates RSS feeds for collection pages (articles, changelog, newsletter, docs).
 */

import { NextResponse } from 'next/server';
import { groq } from 'next-sanity';
import { getCollectionMetadata, getCollectionTypeFromSlug } from '@/lib/collections/registry';
import type { CollectionType } from '@/lib/collections/types';
import { BASE_URL } from '@/lib/core/env';
import { logger } from '@/lib/core/logger';
import { client } from '@/sanity/lib/client';

// Map collection document types to friendly names for RSS
const COLLECTION_NAMES: Record<CollectionType, string> = {
  'collection.article': 'Articles',
  'collection.changelog': 'Changelog',
  'collection.documentation': 'Documentation',
  'collection.events': 'Events',
  'collection.newsletter': 'Newsletter',
};

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

interface CollectionInfo {
  type: CollectionType;
  slug: string;
  name: string;
}

// Check if the requested slug matches a collection from registry
function getCollectionInfo(requestedSlug: string, locale: string): CollectionInfo | null {
  // Try to find a collection type that matches this slug
  const collectionType = getCollectionTypeFromSlug(requestedSlug, locale);
  if (!collectionType) return null;

  // Get metadata from registry
  const metadata = getCollectionMetadata(collectionType, locale);
  if (!metadata || requestedSlug !== metadata.slug) return null;

  return {
    type: collectionType,
    slug: metadata.slug,
    name: COLLECTION_NAMES[collectionType],
  };
}

// Fetch items for a collection based on document type
async function getCollectionItems(
  locale: string,
  collectionType: CollectionType
): Promise<CollectionItem[]> {
  // Different queries for different collection types
  if (collectionType === 'collection.changelog') {
    return await client.withConfig({ stega: false }).fetch(
      groq`*[
        _type == $documentType &&
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
      { locale, documentType: collectionType }
    );
  }

  if (collectionType === 'collection.newsletter') {
    return await client.withConfig({ stega: false }).fetch(
      groq`*[
        _type == $documentType &&
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
      { locale, documentType: collectionType }
    );
  }

  if (collectionType === 'collection.documentation') {
    return await client.withConfig({ stega: false }).fetch(
      groq`*[
        _type == $documentType &&
        (language == $locale || language == null)
      ]|order(order asc)[0...50]{
        _id,
        'title': metadata.title,
        'slug': metadata.slug.current,
        'description': excerpt,
        'publishDate': _updatedAt
      }`,
      { locale, documentType: collectionType }
    );
  }

  if (collectionType === 'collection.events') {
    return await client.withConfig({ stega: false }).fetch(
      groq`*[
        _type == $documentType &&
        (language == $locale || language == null)
      ]|order(startDateTime desc)[0...50]{
        _id,
        'title': metadata.title,
        'slug': metadata.slug.current,
        'description': metadata.description,
        'publishDate': startDateTime
      }`,
      { locale, documentType: collectionType }
    );
  }

  // Default: collection.article
  return await client.withConfig({ stega: false }).fetch(
    groq`*[
      _type == $documentType &&
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
    { locale, documentType: collectionType }
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
  collectionInfo: CollectionInfo,
  items: CollectionItem[],
  locale: string
): string {
  const baseUrl = BASE_URL || 'https://example.com';
  const localePath = locale !== 'en' ? `/${locale}` : '';
  const collectionUrl = `${baseUrl}${localePath}/${collectionInfo.slug}`;

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
    <title>${escapeXml(collectionInfo.name)}</title>
    <link>${collectionUrl}</link>
    <description>${escapeXml(`Latest updates from ${collectionInfo.name}`)}</description>
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

  // Check if requested slug matches a collection from registry
  const collectionInfo = getCollectionInfo(collectionSlug, locale);

  if (!collectionInfo) {
    return new NextResponse('Not Found', { status: 404 });
  }

  let items: CollectionItem[];

  // Fetch collection items with error handling
  try {
    items = await getCollectionItems(locale, collectionInfo.type);
  } catch (error) {
    logger.error(
      { err: error, collectionSlug, locale, collectionType: collectionInfo.type },
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
  const rss = generateRss(collectionInfo, items, locale);

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
