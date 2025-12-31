import { NextResponse } from 'next/server';
import { logger } from '@/lib/core/logger';
import { withRetry } from '@/lib/utils';
import { client } from '@/sanity/lib/client';
import { SEARCH_INDEX_QUERY } from '@/sanity/lib/queries';

interface SearchItem {
  _id: string;
  _type: string;
  title: string;
  slug: string | null;
  description?: string;
}

interface CollectionSearchItem extends SearchItem {
  collectionSlug: string | null;
  language?: string;
}

// Map collection types to search result types
function getCollectionType(docType: string): string {
  switch (docType) {
    case 'collection.article':
      return 'Articles';
    case 'collection.changelog':
      return 'Changelog';
    case 'collection.documentation':
      return 'Docs';
    case 'collection.newsletter':
      return 'Newsletter';
    default:
      return 'Article';
  }
}

export async function GET() {
  try {
    // Fetch search index with retry for network resilience
    const data = await withRetry(() => client.fetch(SEARCH_INDEX_QUERY), {
      retries: 3,
      delay: 1000,
    });

    const results = [
      ...(Array.isArray(data.pages) ? data.pages : []).map((item: SearchItem) => ({
        ...item,
        type: 'Page',
        href: `/${item.slug}`,
      })),
      ...(Array.isArray(data.collections) ? data.collections : []).map(
        (item: CollectionSearchItem) => ({
          _id: item._id,
          _type: item._type,
          title: item.title,
          description: item.description,
          type: getCollectionType(item._type),
          href: item.collectionSlug ? `/${item.collectionSlug}/${item.slug}` : `/${item.slug}`,
        })
      ),
    ];

    return NextResponse.json(results);
  } catch (error) {
    logger.error({ err: error }, 'Search API Error');
    return NextResponse.json(
      { error: 'Search is temporarily unavailable. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
