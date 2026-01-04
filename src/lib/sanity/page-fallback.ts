import { groq } from 'next-sanity';
import { DEFAULT_LOCALE } from '@/i18n/config';
import { logger } from '@/lib/core/logger';
import { fetchSanity } from '@/sanity/lib/fetch';

/**
 * Check if an index page exists in the default locale
 *
 * Used for fallback when a locale-specific index page is missing.
 * This prevents showing the EmptyPage setup guide to users when
 * content exists in the default language.
 *
 * @returns Promise<boolean> - true if default locale has an index page
 *
 * @example
 * ```typescript
 * const hasDefaultIndex = await hasIndexInDefaultLocale();
 * if (hasDefaultIndex) {
 *   redirect('/'); // Redirect to default locale homepage
 * }
 * ```
 */
export async function hasIndexInDefaultLocale(): Promise<boolean> {
  try {
    // Minimal query - only fetch _id to check existence
    const query = groq`*[_type == 'page' && metadata.slug.current == 'index' && language == $locale][0]._id`;

    const result = await fetchSanity<string | null>({
      query,
      params: { locale: DEFAULT_LOCALE },
    });

    return result !== null;
  } catch (error) {
    // If query fails, fail gracefully by returning false
    // This will show EmptyPage rather than crashing
    logger.error({ err: error }, 'Error checking for default locale index');
    return false;
  }
}
