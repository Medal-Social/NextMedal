'use client';

/**
 * Collection Context
 * @description React context provider for collection metadata in client components.
 * Eliminates prop drilling and provides easy access to collection slugs and paths.
 */

import { createContext, useContext, useMemo } from 'react';
import { routing } from '@/i18n/routing';
import { getAllCollections } from './registry';
import type { CollectionMetadata, CollectionType, LocaleCollectionMap } from './types';

/**
 * Collection context value
 */
interface CollectionContextValue {
  /** Current locale */
  locale: string;
  /** All collections for current locale */
  collections: LocaleCollectionMap | undefined;
  /** Get slug for a specific collection type */
  getSlug: (type: CollectionType) => string | undefined;
  /** Get full metadata for a specific collection type */
  getMetadata: (type: CollectionType) => CollectionMetadata | undefined;
  /** Build URL path for a collection (with optional item slug) */
  buildPath: (type: CollectionType, itemSlug?: string) => string;
}

const CollectionContext = createContext<CollectionContextValue | null>(null);

/**
 * Collection provider props
 */
interface CollectionProviderProps {
  /** Current locale */
  locale: string;
  /** Child components */
  children: React.ReactNode;
}

/**
 * Collection provider component
 * Add this to your layout to make collection metadata available to all client components
 *
 * @example
 * ```tsx
 * <CollectionProvider locale={locale}>
 *   {children}
 * </CollectionProvider>
 * ```
 */
export function CollectionProvider({ locale, children }: CollectionProviderProps) {
  const value = useMemo<CollectionContextValue>(() => {
    const collections = getAllCollections(locale);

    return {
      locale,
      collections,
      getSlug: (type) => collections?.[type]?.slug,
      getMetadata: (type) => collections?.[type],
      buildPath: (type, itemSlug) => {
        const slug = collections?.[type]?.slug;
        if (!slug) return '/';

        const localePath = locale !== routing.defaultLocale ? `/${locale}` : '';
        const itemPath = itemSlug ? `/${itemSlug}` : '';

        return `${localePath}/${slug}${itemPath}`;
      },
    };
  }, [locale]);

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

/**
 * Hook to access collection context
 * Must be used within CollectionProvider
 *
 * @throws Error if used outside CollectionProvider
 * @returns Collection context value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { getSlug, buildPath } = useCollections();
 *
 *   const articlesSlug = getSlug('collection.article');
 *   const docsPath = buildPath('collection.documentation', 'intro');
 *
 *   return <Link href={docsPath}>Documentation</Link>;
 * }
 * ```
 */
export function useCollections(): CollectionContextValue {
  const context = useContext(CollectionContext);

  if (!context) {
    throw new Error('useCollections must be used within CollectionProvider');
  }

  return context;
}

/**
 * Convenience hook to get slug for a specific collection type
 * @param type - Collection document type
 * @returns Collection slug or undefined
 *
 * @example
 * ```tsx
 * function ArticleLink() {
 *   const articlesSlug = useCollectionSlug('collection.article');
 *   return <Link href={`/${articlesSlug}`}>Articles</Link>;
 * }
 * ```
 */
export function useCollectionSlug(type: CollectionType): string | undefined {
  const { getSlug } = useCollections();
  return getSlug(type);
}

/**
 * Convenience hook to build collection path
 * @param type - Collection document type
 * @param itemSlug - Optional item slug
 * @returns URL path
 *
 * @example
 * ```tsx
 * function DocLink() {
 *   const docPath = useCollectionPath('collection.documentation', 'installation');
 *   return <Link href={docPath}>Installation Guide</Link>;
 * }
 * ```
 */
export function useCollectionPath(type: CollectionType, itemSlug?: string): string {
  const { buildPath } = useCollections();
  return buildPath(type, itemSlug);
}
