import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import { getAllCollections } from '@/lib/collections/registry';
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

/**
 * Fetch search index data with caching and automatic revalidation
 * Cache expires after 5 minutes - no webhooks needed
 */
function getSearchIndexData(locale: string) {
  return unstable_cache(
    async () => {
      // Fetch search index (collection slugs from generated registry, no API call needed)
      const searchData = await withRetry(() => client.fetch(SEARCH_INDEX_QUERY), {
        retries: 3,
        delay: 1000,
      });

      // Get collection slugs from registry (synchronous, no API call)
      const collections = getAllCollections(locale);
      const collectionSlugs: Record<string, string> = {};
      if (collections) {
        for (const [type, metadata] of Object.entries(collections)) {
          collectionSlugs[type] = metadata.slug;
        }
      }

      return { searchData, collectionSlugs };
    },
    [`search-index-${locale}`],
    {
      revalidate: 300, // Auto-refresh every 5 minutes (no webhooks needed)
    }
  )();
}

export async function GET(request: Request) {
  try {
    // Get locale from query params, fallback to default locale from routing config
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || routing.defaultLocale;

    // Fetch search index and collection slugs (cached with on-demand revalidation)
    const { searchData: data, collectionSlugs } = await getSearchIndexData(locale);

    // Helper to add locale prefix to URLs (follows next-intl routing rules)
    const getLocalePath = (path: string, itemLocale: string) => {
      // Don't add prefix for default locale (as-needed strategy)
      if (itemLocale === routing.defaultLocale) {
        return path;
      }
      return `/${itemLocale}${path}`;
    };

    const results = [
      ...(Array.isArray(data.pages) ? data.pages : []).map((item: SearchItem) => ({
        ...item,
        type: 'Page',
        href: getLocalePath(`/${item.slug}`, locale),
      })),
      ...(Array.isArray(data.collections) ? data.collections : [])
        .filter((item: CollectionSearchItem) => {
          // Only show items that match the current locale
          return item.language === locale;
        })
        .map((item: CollectionSearchItem) => {
          // Look up collection slug from collectionSlugs map (resolved in parallel query)
          const collectionSlug = collectionSlugs[item._type];

          if (!item.slug || !collectionSlug) {
            logger.warn(
              { item, collectionSlugs },
              'Search result missing slug or collectionSlug - skipping construction'
            );
            return null;
          }
          return {
            _id: item._id,
            _type: item._type,
            title: item.title,
            description: item.description,
            type: getCollectionType(item._type),
            href: getLocalePath(`/${collectionSlug}/${item.slug}`, item.language || locale),
          };
        })
        .filter(
          (
            item: {
              _id: string;
              _type: string;
              title: string;
              description?: string;
              type: string;
              href: string;
            } | null
          ): item is NonNullable<typeof item> => item !== null
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
