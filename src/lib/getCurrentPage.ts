import { headers } from 'next/headers';
import { groq } from 'next-sanity';
import { fetchSanityLive } from '@/sanity/lib/fetch';
import { TRANSLATIONS_QUERY } from '@/sanity/lib/queries';

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
      query: groq`*[
        (_type == 'page' || _type == 'blog.post') &&
        metadata.slug.current == $slug &&
        language == $locale
      ][0]{
        _type,
        _id,
        language,
        metadata {
          slug
        },
        ${TRANSLATIONS_QUERY}
      }`,
      params: { slug, locale },
    });

    return page;
  } catch (error) {
    console.error('Error fetching current page for translations:', error);
    return undefined;
  }
}

/**
 * Parse pathname to extract locale and slug
 * Patterns: /, /en, /nb, /en/slug, /nb/slug, /slug
 */
function parsePathname(pathname: string): { locale: string; slug: string } {
  const urlPath = new URL(pathname, 'http://localhost').pathname;
  const segments = urlPath.split('/').filter(Boolean);
  const locales = ['en', 'nb'];

  // Root path /
  if (segments.length === 0) {
    return { locale: 'en', slug: 'index' };
  }

  // Path with locale: /en/slug or /nb/slug
  if (locales.includes(segments[0])) {
    return {
      locale: segments[0],
      slug: segments.slice(1).join('/') || 'index',
    };
  }

  // Path without locale: /slug (default to en)
  return {
    locale: 'en',
    slug: segments.join('/'),
  };
}
