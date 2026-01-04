/**
 * Collection Types
 * @description TypeScript type definitions for the collection registry system
 */

/**
 * Collection document types matching Sanity schema names
 */
export type CollectionType =
  | 'collection.article'
  | 'collection.documentation'
  | 'collection.changelog'
  | 'collection.newsletter'
  | 'collection.events';

/**
 * Collection metadata interface
 */
export interface CollectionMetadata {
  /** Collection document type */
  type: CollectionType;
  /** URL slug for this collection */
  slug: string;
  /** Display name for this collection */
  name: string;
}

/**
 * Map of collection types to metadata for a single locale
 */
export type LocaleCollectionMap = Record<CollectionType, CollectionMetadata>;

/**
 * Registry configuration shape
 */
export interface CollectionRegistry {
  /** Collection metadata by locale */
  slugsByLocale: Record<string, LocaleCollectionMap>;
  /** Default fallback slugs */
  defaults: Record<CollectionType, string>;
  /** Reverse lookup: slug to type */
  slugToType: Record<string, Record<string, CollectionType>>;
}
