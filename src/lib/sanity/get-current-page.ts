import { headers } from 'next/headers';
import { routing } from '@/i18n/routing';
import { getCollectionTypeFromSlug } from '@/lib/collections/registry';
import { logger } from '@/lib/core/logger';
import { fetchSanityLive } from '@/sanity/lib/fetch';
import { CURRENT_PAGE_QUERY, HOMEPAGE_TRANSLATIONS_QUERY } from '@/sanity/lib/queries';

/**
 * Get the current page with translation metadata based on the request URL
 * This is used in the Header component to provide translation-aware language switching
 */
export async function getCurrentPage(): Promise<Sanity.PageBase | undefined> {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('referer');

  if (!pathname) return undefined;

  // Extract slug and locale from pathname
  const { locale, slug } = parsePathname(pathname);

  try {
    const page = await fetchSanityLive<Sanity.PageBase>({
      query: CURRENT_PAGE_QUERY,
      params: { slug, locale },
    });

    if (
      page &&
      page.metadata?.slug?.current === 'index' &&
      (!page.translations || page.translations.length === 0)
    ) {
      const homepageTranslations = await fetchSanityLive<Sanity.PageBase['translations']>({
        query: HOMEPAGE_TRANSLATIONS_QUERY,
        params: { locale },
      });

      page.translations = homepageTranslations || [];
    }

    return page;
  } catch (error) {
    logger.error({ err: error }, 'Error fetching current page for translations');
    return undefined;
  }
}

/**
 * Parse pathname to extract locale and slug
 * Patterns: /, /en, /nb, /en/slug, /nb/slug, /slug, /article/slug, /nb/article/slug
 */
function parsePathname(pathname: string): { locale: string; slug: string } {
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

  // If first segment matches a collection slug, strip it for item lookups.
  if (remainingSegments.length > 1) {
    const collectionType = getCollectionTypeFromSlug(remainingSegments[0], locale);
    if (collectionType) {
      return {
        locale,
        slug: remainingSegments.slice(1).join('/'),
      };
    }
  }

  // Regular page slug
  return {
    locale,
    slug: remainingSegments.join('/'),
  };
}
