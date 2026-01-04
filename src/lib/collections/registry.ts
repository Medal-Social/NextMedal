/**
 * Collection Registry
 * @description Central module for accessing collection metadata.
 * Imports build-time generated config and provides type-safe functions.
 * All functions are synchronous (no API calls) - data comes from generated file.
 */

import { routing } from '@/i18n/routing';
// Import generated config (created at build time)
// If this import fails, run: pnpm generate:collections
import {
  COLLECTION_SLUGS_BY_LOCALE,
  DEFAULT_COLLECTION_SLUGS,
  SLUG_TO_TYPE_MAP,
} from './generated/collections.generated';
import type { CollectionMetadata, CollectionType, LocaleCollectionMap } from './types';

/**
 * Get collection slug for a specific type and locale
 * @param type - Collection document type
 * @param locale - Site locale (defaults to default locale)
 * @returns Collection slug or undefined if not found
 *
 * @example
 * ```ts
 * const slug = getCollectionSlug('collection.article', 'en');
 * // Returns: "articles" or undefined
 * ```
 */
export function getCollectionSlug(
  type: CollectionType,
  locale: string = routing.defaultLocale
): string | undefined {
  return COLLECTION_SLUGS_BY_LOCALE[locale]?.[type]?.slug;
}

/**
 * Get collection slug with fallback to default
 * Always returns a value (never undefined)
 *
 * @param type - Collection document type
 * @param locale - Site locale (defaults to default locale)
 * @returns Collection slug (guaranteed to return a value)
 *
 * @example
 * ```ts
 * const slug = getCollectionSlugWithFallback('collection.article', 'en');
 * // Always returns a value: "articles"
 * ```
 */
export function getCollectionSlugWithFallback(
  type: CollectionType,
  locale: string = routing.defaultLocale
): string {
  return getCollectionSlug(type, locale) || DEFAULT_COLLECTION_SLUGS[type];
}

/**
 * Get full collection metadata
 * @param type - Collection document type
 * @param locale - Site locale (defaults to default locale)
 * @returns Collection metadata or undefined
 *
 * @example
 * ```ts
 * const metadata = getCollectionMetadata('collection.article', 'en');
 * // Returns: { type: 'collection.article', slug: 'articles', name: 'Articles' }
 * ```
 */
export function getCollectionMetadata(
  type: CollectionType,
  locale: string = routing.defaultLocale
): CollectionMetadata | undefined {
  return COLLECTION_SLUGS_BY_LOCALE[locale]?.[type];
}

/**
 * Get all collections for a locale
 * @param locale - Site locale (defaults to default locale)
 * @returns Map of collection types to metadata, or undefined if locale not found
 *
 * @example
 * ```ts
 * const collections = getAllCollections('en');
 * // Returns: { 'collection.article': { ... }, 'collection.documentation': { ... }, ... }
 * ```
 */
export function getAllCollections(
  locale: string = routing.defaultLocale
): LocaleCollectionMap | undefined {
  return COLLECTION_SLUGS_BY_LOCALE[locale];
}

/**
 * Reverse lookup: find collection type from slug
 * @param slug - URL slug to look up
 * @param locale - Site locale (defaults to default locale)
 * @returns Collection type or undefined
 *
 * @example
 * ```ts
 * const type = getCollectionTypeFromSlug('articles', 'en');
 * // Returns: 'collection.article' or undefined
 * ```
 */
export function getCollectionTypeFromSlug(
  slug: string,
  locale: string = routing.defaultLocale
): CollectionType | undefined {
  return SLUG_TO_TYPE_MAP[locale]?.[slug];
}

/**
 * Build collection URL path
 * @param type - Collection document type
 * @param locale - Site locale (defaults to default locale)
 * @param itemSlug - Optional item slug to append
 * @returns URL path (e.g., "/articles" or "/nb/artikler/my-post")
 *
 * @example
 * ```ts
 * buildCollectionPath('collection.article', 'en')
 * // Returns: "/articles"
 *
 * buildCollectionPath('collection.article', 'nb', 'my-post')
 * // Returns: "/nb/artikler/my-post"
 * ```
 */
export function buildCollectionPath(
  type: CollectionType,
  locale: string = routing.defaultLocale,
  itemSlug?: string
): string {
  const collectionSlug = getCollectionSlugWithFallback(type, locale);
  const localePath = locale !== routing.defaultLocale ? `/${locale}` : '';
  const itemPath = itemSlug ? `/${itemSlug}` : '';

  return `${localePath}/${collectionSlug}${itemPath}`;
}

/**
 * Check if a pathname matches a collection
 * @param pathname - URL pathname to check
 * @param type - Collection document type
 * @param locale - Site locale (defaults to default locale)
 * @returns true if pathname is within the collection
 *
 * @example
 * ```ts
 * isCollectionPath('/articles/my-post', 'collection.article', 'en')
 * // Returns: true
 *
 * isCollectionPath('/docs/intro', 'collection.article', 'en')
 * // Returns: false
 * ```
 */
export function isCollectionPath(
  pathname: string,
  type: CollectionType,
  locale: string = routing.defaultLocale
): boolean {
  const collectionSlug = getCollectionSlug(type, locale);
  if (!collectionSlug) return false;

  // Remove locale prefix from pathname
  // Match locale followed by either a slash or end of string to avoid false matches
  // (e.g., don't match '/ar' in '/articles')
  const localePattern = new RegExp(`^/(${routing.locales.join('|')})(?=/|$)`);
  const pathWithoutLocale = pathname.replace(localePattern, '');

  return pathWithoutLocale.startsWith(`/${collectionSlug}`);
}

/**
 * Development helper: Log all configured collections
 * Only available in development mode
 */
export function debugCollections(): void {
  if (process.env.NODE_ENV !== 'development') {
    // biome-ignore lint/suspicious/noConsole: Development debug utility
    console.warn('debugCollections() is only available in development mode');
    return;
  }

  // biome-ignore lint/suspicious/noConsole: Development debug utility
  console.group('📦 Configured Collections');
  for (const locale of routing.locales) {
    // biome-ignore lint/suspicious/noConsole: Development debug utility
    console.group(`Locale: ${locale}`);
    const collections = getAllCollections(locale);
    if (collections) {
      for (const [type, metadata] of Object.entries(collections)) {
        // biome-ignore lint/suspicious/noConsole: Development debug utility
        console.log(`${type}: /${metadata.slug} (${metadata.name})`);
      }
    } else {
      // biome-ignore lint/suspicious/noConsole: Development debug utility
      console.log('No collections found');
    }
    // biome-ignore lint/suspicious/noConsole: Development debug utility
    console.groupEnd();
  }
  // biome-ignore lint/suspicious/noConsole: Development debug utility
  console.groupEnd();
}
