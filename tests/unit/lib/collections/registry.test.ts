import { describe, expect, it, vi } from 'vitest';

// Mock i18n routing FIRST (before any imports)
vi.mock('@/i18n/routing', () => ({
  routing: {
    defaultLocale: 'en',
    locales: ['en', 'nb', 'ar'],
  },
}));

// Mock the generated collections file
vi.mock('@/lib/collections/generated/collections.generated', () => ({
  COLLECTION_SLUGS_BY_LOCALE: {
    en: {
      'collection.article': { type: 'collection.article', slug: 'articles', name: 'Articles' },
      'collection.documentation': {
        type: 'collection.documentation',
        slug: 'docs',
        name: 'Documentation',
      },
      'collection.changelog': {
        type: 'collection.changelog',
        slug: 'changelog',
        name: 'Changelog',
      },
    },
    nb: {
      'collection.article': { type: 'collection.article', slug: 'artikler', name: 'Artikler' },
      'collection.documentation': {
        type: 'collection.documentation',
        slug: 'dokumentasjon',
        name: 'Dokumentasjon',
      },
      'collection.changelog': {
        type: 'collection.changelog',
        slug: 'endringslogg',
        name: 'Endringslogg',
      },
    },
    ar: {
      'collection.article': { type: 'collection.article', slug: 'articles', name: 'مقالات' },
      'collection.documentation': { type: 'collection.documentation', slug: 'docs', name: 'توثيق' },
    },
  },
  DEFAULT_COLLECTION_SLUGS: {
    'collection.article': 'articles',
    'collection.documentation': 'docs',
    'collection.changelog': 'changelog',
    'collection.events': 'events',
    'collection.newsletter': 'newsletter',
  },
  SLUG_TO_TYPE_MAP: {
    en: {
      articles: 'collection.article',
      docs: 'collection.documentation',
      changelog: 'collection.changelog',
    },
    nb: {
      artikler: 'collection.article',
      dokumentasjon: 'collection.documentation',
      endringslogg: 'collection.changelog',
    },
    ar: {
      articles: 'collection.article',
      docs: 'collection.documentation',
    },
  },
}));

// Import after mocks are set up
import {
  buildCollectionPath,
  getAllCollections,
  getCollectionMetadata,
  getCollectionSlug,
  getCollectionSlugWithFallback,
  getCollectionTypeFromSlug,
  isCollectionPath,
} from '@/lib/collections/registry';

describe('Collection Registry', () => {
  describe('getCollectionSlug', () => {
    it('returns correct slug for English locale', () => {
      expect(getCollectionSlug('collection.article', 'en')).toBe('articles');
      expect(getCollectionSlug('collection.documentation', 'en')).toBe('docs');
    });

    it('returns correct slug for Norwegian locale', () => {
      expect(getCollectionSlug('collection.article', 'nb')).toBe('artikler');
      expect(getCollectionSlug('collection.documentation', 'nb')).toBe('dokumentasjon');
      expect(getCollectionSlug('collection.changelog', 'nb')).toBe('endringslogg');
    });

    it('returns correct slug for Arabic locale', () => {
      expect(getCollectionSlug('collection.article', 'ar')).toBe('articles');
      expect(getCollectionSlug('collection.documentation', 'ar')).toBe('docs');
    });

    it('returns undefined for non-existent collection in locale', () => {
      expect(getCollectionSlug('collection.changelog', 'ar')).toBeUndefined();
    });

    it('defaults to English locale when not specified', () => {
      expect(getCollectionSlug('collection.article')).toBe('articles');
    });

    it('returns undefined for invalid collection type', () => {
      // @ts-expect-error - Testing invalid input
      expect(getCollectionSlug('invalid.type', 'en')).toBeUndefined();
    });
  });

  describe('getCollectionSlugWithFallback', () => {
    it('returns slug when available in locale', () => {
      expect(getCollectionSlugWithFallback('collection.article', 'nb')).toBe('artikler');
    });

    it('falls back to default slug when not in locale', () => {
      expect(getCollectionSlugWithFallback('collection.changelog', 'ar')).toBe('changelog');
    });

    it('returns default slug when locale is invalid', () => {
      expect(getCollectionSlugWithFallback('collection.article', 'invalid')).toBe('articles');
    });
  });

  describe('getCollectionMetadata', () => {
    it('returns full metadata for collection', () => {
      const metadata = getCollectionMetadata('collection.article', 'nb');
      expect(metadata).toEqual({
        type: 'collection.article',
        slug: 'artikler',
        name: 'Artikler',
      });
    });

    it('returns undefined when collection not in locale', () => {
      expect(getCollectionMetadata('collection.changelog', 'ar')).toBeUndefined();
    });
  });

  describe('getAllCollections', () => {
    it('returns all collections for English locale', () => {
      const collections = getAllCollections('en');
      expect(collections).toBeDefined();
      expect(Object.keys(collections!)).toHaveLength(3);
      expect(collections!['collection.article'].slug).toBe('articles');
    });

    it('returns all collections for Norwegian locale', () => {
      const collections = getAllCollections('nb');
      expect(collections).toBeDefined();
      expect(collections!['collection.article'].slug).toBe('artikler');
    });

    it('returns fewer collections for Arabic locale', () => {
      const collections = getAllCollections('ar');
      expect(collections).toBeDefined();
      expect(Object.keys(collections!)).toHaveLength(2); // Only 2 collections configured
    });
  });

  describe('getCollectionTypeFromSlug', () => {
    it('returns collection type from English slug', () => {
      expect(getCollectionTypeFromSlug('articles', 'en')).toBe('collection.article');
      expect(getCollectionTypeFromSlug('docs', 'en')).toBe('collection.documentation');
    });

    it('returns collection type from Norwegian slug', () => {
      expect(getCollectionTypeFromSlug('artikler', 'nb')).toBe('collection.article');
      expect(getCollectionTypeFromSlug('dokumentasjon', 'nb')).toBe('collection.documentation');
    });

    it('returns undefined for invalid slug', () => {
      expect(getCollectionTypeFromSlug('invalid', 'en')).toBeUndefined();
    });

    it('Norwegian slug does not work in English locale', () => {
      expect(getCollectionTypeFromSlug('artikler', 'en')).toBeUndefined();
    });

    it('English slug does not work in Norwegian locale', () => {
      expect(getCollectionTypeFromSlug('articles', 'nb')).toBeUndefined();
    });
  });

  describe('buildCollectionPath', () => {
    it('builds correct path for default locale (English)', () => {
      expect(buildCollectionPath('collection.article', 'en')).toBe('/articles');
      expect(buildCollectionPath('collection.documentation', 'en')).toBe('/docs');
    });

    it('builds correct path with locale prefix for Norwegian', () => {
      expect(buildCollectionPath('collection.article', 'nb')).toBe('/nb/artikler');
      expect(buildCollectionPath('collection.documentation', 'nb')).toBe('/nb/dokumentasjon');
    });

    it('builds correct path with locale prefix for Arabic', () => {
      expect(buildCollectionPath('collection.article', 'ar')).toBe('/ar/articles');
    });

    it('includes item slug when provided', () => {
      expect(buildCollectionPath('collection.article', 'en', 'my-post')).toBe('/articles/my-post');
      expect(buildCollectionPath('collection.article', 'nb', 'min-artikkel')).toBe(
        '/nb/artikler/min-artikkel'
      );
    });

    it('uses fallback slug when collection not in locale', () => {
      expect(buildCollectionPath('collection.changelog', 'ar')).toBe('/ar/changelog');
    });
  });

  describe('isCollectionPath', () => {
    it('correctly identifies collection paths in default locale', () => {
      expect(isCollectionPath('/articles', 'collection.article', 'en')).toBe(true);
      expect(isCollectionPath('/articles/my-post', 'collection.article', 'en')).toBe(true);
      expect(isCollectionPath('/docs', 'collection.documentation', 'en')).toBe(true);
    });

    it('correctly identifies collection paths with locale prefix', () => {
      expect(isCollectionPath('/nb/artikler', 'collection.article', 'nb')).toBe(true);
      expect(isCollectionPath('/nb/artikler/min-post', 'collection.article', 'nb')).toBe(true);
    });

    it('returns false for non-collection paths', () => {
      expect(isCollectionPath('/about', 'collection.article', 'en')).toBe(false);
      expect(isCollectionPath('/nb/om-oss', 'collection.article', 'nb')).toBe(false);
    });

    it('returns false for wrong collection', () => {
      expect(isCollectionPath('/articles', 'collection.documentation', 'en')).toBe(false);
      expect(isCollectionPath('/docs', 'collection.article', 'en')).toBe(false);
    });

    it('handles locale prefix correctly', () => {
      // English path with English check
      expect(isCollectionPath('/en/articles', 'collection.article', 'en')).toBe(true);

      // Norwegian path with Norwegian check
      expect(isCollectionPath('/nb/artikler', 'collection.article', 'nb')).toBe(true);

      // English slug should not match Norwegian locale
      expect(isCollectionPath('/nb/articles', 'collection.article', 'nb')).toBe(false);
    });

    it('returns false when collection not configured in locale', () => {
      expect(isCollectionPath('/ar/changelog', 'collection.changelog', 'ar')).toBe(false);
    });
  });

  describe('Locale-specific slug handling', () => {
    it('Norwegian and English have different slugs for same collection', () => {
      const enSlug = getCollectionSlug('collection.article', 'en');
      const nbSlug = getCollectionSlug('collection.article', 'nb');

      expect(enSlug).toBe('articles');
      expect(nbSlug).toBe('artikler');
      expect(enSlug).not.toBe(nbSlug);
    });

    it('reverse lookup works correctly per locale', () => {
      // "articles" → collection.article in English
      expect(getCollectionTypeFromSlug('articles', 'en')).toBe('collection.article');

      // "artikler" → collection.article in Norwegian
      expect(getCollectionTypeFromSlug('artikler', 'nb')).toBe('collection.article');

      // But not cross-locale
      expect(getCollectionTypeFromSlug('articles', 'nb')).toBeUndefined();
      expect(getCollectionTypeFromSlug('artikler', 'en')).toBeUndefined();
    });

    it('path building respects locale-specific slugs', () => {
      const enPath = buildCollectionPath('collection.article', 'en', 'test');
      const nbPath = buildCollectionPath('collection.article', 'nb', 'test');

      expect(enPath).toBe('/articles/test');
      expect(nbPath).toBe('/nb/artikler/test');
    });
  });
});
