import 'server-only';
import { groq } from 'next-sanity';
import { routing } from '@/i18n/routing';
import { getCollectionTypeFromSlug } from '@/lib/collections/registry';
import type { CollectionType } from '@/lib/collections/types';
import { logger } from '@/lib/core/logger';
import { fetchSanityLive } from '@/sanity/lib/fetch';
import resolveUrl from './resolve-url-server';

export interface TranslationDetectionResult {
  found: boolean;
  redirectUrl?: string;
  availableLocales: Array<{
    locale: string;
    url: string;
  }>;
  strategy: 'exact-match' | 'not-found';
}

/**
 * Parse pathname to extract locale and slug
 * Patterns: /, /en, /nb, /en/slug, /nb/slug, /slug, /article/slug, /nb/article/slug
 */
function parsePathname(pathname: string): {
  locale: string;
  slug: string;
  collectionType?: CollectionType;
} {
  const urlPath = new URL(pathname, 'http://localhost').pathname;
  const segments = urlPath.split('/').filter(Boolean);
  const locales: readonly string[] = routing.locales;

  // Root path /
  if (segments.length === 0) {
    return { locale: routing.defaultLocale, slug: 'index' };
  }

  let locale = routing.defaultLocale;
  let remainingSegments = segments;

  // Check if first segment is a locale
  if (locales.includes(segments[0])) {
    locale = segments[0] as typeof routing.defaultLocale;
    remainingSegments = segments.slice(1);
  }

  // No remaining segments means homepage for that locale
  if (remainingSegments.length === 0) {
    return { locale, slug: 'index' };
  }

  // If first segment matches a collection slug, extract collection type
  if (remainingSegments.length > 1) {
    const collectionType = getCollectionTypeFromSlug(remainingSegments[0], locale);
    if (collectionType) {
      return {
        locale,
        slug: remainingSegments.slice(1).join('/'),
        collectionType,
      };
    }
  }

  // Regular page slug
  return {
    locale,
    slug: remainingSegments.join('/'),
  };
}

/**
 * Query for page translations using translation.metadata
 */
async function queryPageTranslations(
  slug: string,
  locale: string
): Promise<Sanity.PageBase | undefined> {
  const CURRENT_PAGE_QUERY = groq`
    *[
      _type == 'page' &&
      metadata.slug.current == $slug &&
      language == $locale
    ][0]{
      _type,
      _id,
      language,
      metadata {
        slug
      },
      'translations': *[_type == 'translation.metadata' && references(^._id)].translations[].value->{
        'slug': metadata.slug.current,
        language,
        _type
      }
    }
  `;

  try {
    return await fetchSanityLive<Sanity.PageBase>({
      query: CURRENT_PAGE_QUERY,
      params: { slug, locale },
    });
  } catch (error) {
    logger.error({ err: error, slug, locale }, 'Error querying page translations');
    return undefined;
  }
}

/**
 * Query for homepage translations
 */
async function queryHomepageTranslations(locale: string): Promise<Sanity.PageBase['translations']> {
  const HOMEPAGE_TRANSLATIONS_QUERY = groq`
    *[_type == 'page' && metadata.slug.current == 'index' && language != $locale]{
      'slug': metadata.slug.current,
      language,
      _type
    }
  `;

  try {
    const translations = await fetchSanityLive<Sanity.PageBase['translations']>({
      query: HOMEPAGE_TRANSLATIONS_QUERY,
      params: { locale },
    });
    return translations || [];
  } catch (error) {
    logger.error({ err: error, locale }, 'Error querying homepage translations');
    return [];
  }
}

/**
 * Query for collection item translations by slug
 * Collections are separate documents per language, not linked via translation.metadata
 */
async function queryCollectionTranslations(
  collectionType: CollectionType,
  slug: string
): Promise<Array<{ language: string; slug: string; _type: string }>> {
  const COLLECTION_TRANSLATIONS_QUERY = groq`
    *[_type == $collectionType && metadata.slug.current == $slug]{
      language,
      'slug': metadata.slug.current,
      _type
    }
  `;

  try {
    const results = await fetchSanityLive<Array<{ language: string; slug: string; _type: string }>>(
      {
        query: COLLECTION_TRANSLATIONS_QUERY,
        params: { collectionType, slug },
      }
    );
    return results || [];
  } catch (error) {
    logger.error({ err: error, collectionType, slug }, 'Error querying collection translations');
    return [];
  }
}

/**
 * Find available translation for a given pathname and target locale
 */
export async function findAvailableTranslation(
  pathname: string,
  currentLocale: string,
  targetLocale: string
): Promise<TranslationDetectionResult> {
  const { locale, slug, collectionType } = parsePathname(pathname);

  // Use detected locale if different from currentLocale (rare edge case)
  const actualCurrentLocale = locale || currentLocale;

  let availableTranslations: Array<{ language: string; slug: string; _type: string }> = [];

  // Query based on document type
  if (slug === 'index') {
    // Homepage: use special homepage query
    const homepageTranslations = await queryHomepageTranslations(actualCurrentLocale);

    // Add current locale (index page always exists in current locale)
    availableTranslations = [
      { language: actualCurrentLocale, slug: 'index', _type: 'page' },
      ...(homepageTranslations || []),
    ];
  } else if (collectionType) {
    // Collection item: query by slug across locales
    availableTranslations = await queryCollectionTranslations(collectionType, slug);
  } else {
    // Regular page: use translation.metadata
    const page = await queryPageTranslations(slug, actualCurrentLocale);
    if (page) {
      // Include current page + translations
      availableTranslations = [
        {
          language: page.language || actualCurrentLocale,
          slug: page.metadata?.slug?.current || slug,
          _type: page._type,
        },
        ...(page.translations || []),
      ];
    }
  }

  // Remove duplicates and filter out invalid entries
  const uniqueTranslations = availableTranslations
    .filter((t) => t?.language && t.slug)
    .filter((t, index, self) => self.findIndex((x) => x.language === t.language) === index);

  // Build URLs for all available locales
  const availableLocales = uniqueTranslations.map((translation) => {
    const translatedPage = {
      _type: translation._type,
      language: translation.language,
      metadata: {
        slug: {
          current: translation.slug,
        },
      },
      // biome-ignore lint/suspicious/noExplicitAny: resolveUrl only needs type, language, and slug
    } as any;

    return {
      locale: translation.language,
      url: resolveUrl(translatedPage, { base: false }),
    };
  });

  // Check if target locale exists
  const targetTranslation = availableLocales.find((t) => t.locale === targetLocale);

  if (targetTranslation) {
    // Translation exists in target locale
    return {
      found: true,
      redirectUrl: targetTranslation.url,
      availableLocales,
      strategy: 'exact-match',
    };
  }

  // Translation doesn't exist in target locale
  return {
    found: false,
    availableLocales: availableLocales.filter((t) => t.locale !== actualCurrentLocale), // Exclude current locale from "available"
    strategy: 'not-found',
  };
}
