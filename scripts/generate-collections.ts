/**
 * Collection Config Generator
 * @description Build-time script that generates TypeScript file with collection metadata.
 * Queries Sanity to find pages with frontpage modules and extracts their slugs.
 *
 * Run with: pnpm generate:collections
 */

import 'dotenv/config';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createClient, groq } from 'next-sanity';
import { routing } from '../src/i18n/routing';
import type { CollectionType } from '../src/lib/collections/types';

/**
 * Fallback slugs when frontpage not found in Sanity
 */
const DEFAULT_COLLECTION_SLUGS: Record<CollectionType, string> = {
  'collection.article': 'articles',
  'collection.documentation': 'docs',
  'collection.changelog': 'changelog',
  'collection.newsletter': 'newsletter',
  'collection.events': 'events',
};

/**
 * Collection names for display
 */
const COLLECTION_NAMES: Record<CollectionType, string> = {
  'collection.article': 'Articles',
  'collection.documentation': 'Documentation',
  'collection.changelog': 'Changelog',
  'collection.newsletter': 'Newsletter',
  'collection.events': 'Events',
};

/**
 * Map frontpage module types to collection types
 */
const FRONTPAGE_TO_COLLECTION: Record<string, CollectionType> = {
  'articles-frontpage': 'collection.article',
  'docs-frontpage': 'collection.documentation',
  'changelog-frontpage': 'collection.changelog',
  'newsletter-frontpage': 'collection.newsletter',
  'events-frontpage': 'collection.events',
};

/**
 * Create Sanity client
 */
function createSanityClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

  if (!projectId || !dataset) {
    throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET');
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn: false,
  });
}

/**
 * Query to find pages with frontpage modules (locale-aware)
 */
const FRONTPAGE_PAGES_QUERY = groq`
  *[_type == 'page' && defined(modules) && count(modules[_type in ['articles-frontpage', 'docs-frontpage', 'changelog-frontpage', 'newsletter-frontpage', 'events-frontpage']]) > 0] | order(_updatedAt desc) {
    _id,
    "slug": metadata.slug.current,
    "locale": language,
    'frontpageType': modules[_type in ['articles-frontpage', 'docs-frontpage', 'changelog-frontpage', 'newsletter-frontpage', 'events-frontpage']][0]._type,
    _updatedAt
  }
`;

interface FrontpagePage {
  _id: string;
  slug?: string;
  locale?: string;
  frontpageType?: string;
  _updatedAt?: string;
}

/**
 * Fetch frontpage slugs from Sanity (locale-aware)
 */
async function fetchFrontpageSlugs(): Promise<
  Record<string, Partial<Record<CollectionType, string>>>
> {
  const client = createSanityClient();
  const pages = await client.fetch<FrontpagePage[]>(FRONTPAGE_PAGES_QUERY);

  const slugsByLocale: Record<string, Partial<Record<CollectionType, string>>> = {};

  // Initialize all locales
  for (const locale of routing.locales) {
    slugsByLocale[locale] = {};
  }

  // Process pages - GROQ query is ordered by _updatedAt desc, so most recently updated pages come first
  for (const page of pages) {
    const { slug, locale, frontpageType } = page;

    if (!slug || !locale || !frontpageType) continue;
    if (!(frontpageType in FRONTPAGE_TO_COLLECTION)) continue;

    const collectionType = FRONTPAGE_TO_COLLECTION[frontpageType];

    // Only set if not already set (prefer most recently updated page)
    if (!slugsByLocale[locale][collectionType]) {
      slugsByLocale[locale][collectionType] = slug;
      console.log(`   📌 ${locale}/${collectionType}: /${slug}`);
    } else {
      console.log(
        `   ⚠️  ${locale}/${collectionType}: /${slug} (skipped - duplicate found, using most recent)`
      );
    }
  }

  return slugsByLocale;
}

/**
 * Build collection metadata for all locales
 */
function buildCollectionMetadata(
  slugsByLocale: Record<string, Partial<Record<CollectionType, string>>>
): Record<string, Record<string, { type: CollectionType; slug: string; name: string }>> {
  const metadata: Record<
    string,
    Record<string, { type: CollectionType; slug: string; name: string }>
  > = {};

  for (const locale of routing.locales) {
    metadata[locale] = {};
    const localeCollections = slugsByLocale[locale] || {};

    for (const collectionType of Object.keys(DEFAULT_COLLECTION_SLUGS) as CollectionType[]) {
      // Use detected slug or fallback to default
      const slug = localeCollections[collectionType] || DEFAULT_COLLECTION_SLUGS[collectionType];

      metadata[locale][collectionType] = {
        type: collectionType,
        slug,
        name: COLLECTION_NAMES[collectionType],
      };
    }
  }

  return metadata;
}

/**
 * Build reverse lookup map (slug -> collection type)
 */
function buildSlugToTypeMap(
  slugsByLocale: Record<
    string,
    Record<string, { type: CollectionType; slug: string; name: string }>
  >
): Record<string, Record<string, CollectionType>> {
  const slugToType: Record<string, Record<string, CollectionType>> = {};

  for (const [locale, collections] of Object.entries(slugsByLocale)) {
    slugToType[locale] = {};
    for (const [type, metadata] of Object.entries(collections)) {
      slugToType[locale][metadata.slug] = type as CollectionType;
    }
  }

  return slugToType;
}

/**
 * Generate TypeScript file content
 */
function generateFileContent(
  slugsByLocale: Record<
    string,
    Record<string, { type: CollectionType; slug: string; name: string }>
  >,
  slugToType: Record<string, Record<string, CollectionType>>,
  detectedSlugs: Record<CollectionType, string>
): string {
  return `// AUTO-GENERATED FILE - DO NOT EDIT
// biome-ignore lint: Auto-generated file
// Generated at: ${new Date().toISOString()}
// Source: Sanity CMS (pages with frontpage modules)
//
// This file is generated by scripts/generate-collections.ts
// Run \`pnpm generate:collections\` to regenerate

import type { CollectionType, LocaleCollectionMap } from '../types';

/**
 * Collection metadata by locale
 * Generated from Sanity frontpage detection at build time
 */
export const COLLECTION_SLUGS_BY_LOCALE: Record<string, LocaleCollectionMap> = ${JSON.stringify(slugsByLocale, null, 2)} as Record<string, LocaleCollectionMap>;

/**
 * Default fallback slugs (used when frontpage not found in Sanity)
 */
export const DEFAULT_COLLECTION_SLUGS: Record<CollectionType, string> = ${JSON.stringify(detectedSlugs, null, 2)};

/**
 * Reverse lookup map: slug -> collection type (per locale)
 */
export const SLUG_TO_TYPE_MAP: Record<string, Record<string, CollectionType>> = ${JSON.stringify(slugToType, null, 2)} as Record<string, Record<string, CollectionType>>;

/**
 * Generation metadata
 */
export const GENERATION_METADATA = {
  generatedAt: '${new Date().toISOString()}',
  locales: ${JSON.stringify(routing.locales)},
  source: 'Sanity CMS frontpage detection',
} as const;
`;
}

/**
 * Main generation function
 */
async function generateCollections() {
  console.log('🔧 Generating collections config...');

  try {
    // Fetch frontpage slugs from Sanity (locale-aware)
    console.log('📡 Querying Sanity for frontpage pages...');
    const detectedSlugsByLocale = await fetchFrontpageSlugs();

    // Build collection metadata maps
    const slugsByLocale = buildCollectionMetadata(detectedSlugsByLocale);

    // Build reverse lookup map
    const slugToType = buildSlugToTypeMap(slugsByLocale);

    // Extract unique slugs for DEFAULT_COLLECTION_SLUGS export
    const uniqueSlugs: Partial<Record<CollectionType, string>> = {};
    for (const locale of routing.locales) {
      const localeData = detectedSlugsByLocale[locale];
      if (localeData) {
        for (const [type, slug] of Object.entries(localeData)) {
          if (!uniqueSlugs[type as CollectionType]) {
            uniqueSlugs[type as CollectionType] = slug;
          }
        }
      }
    }
    const defaultSlugs = { ...DEFAULT_COLLECTION_SLUGS, ...uniqueSlugs };

    // Generate TypeScript file content
    const content = generateFileContent(slugsByLocale, slugToType, defaultSlugs);

    // Write to generated file
    const outputDir = path.join(process.cwd(), 'src/lib/collections/generated');
    const outputPath = path.join(outputDir, 'collections.generated.ts');

    // Ensure directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Write file
    await fs.writeFile(outputPath, content, 'utf-8');

    console.log(`✅ Generated collections config for ${routing.locales.length} locales`);
    console.log(`📄 Output: ${outputPath}`);
    console.log('✨ Done!\n');
  } catch (error) {
    console.error('❌ Error querying Sanity:', error);
    console.log('⚠️  Falling back to default slugs...');

    // Fallback to defaults (create locale-aware structure)
    const fallbackSlugsByLocale: Record<string, Partial<Record<CollectionType, string>>> = {};
    for (const locale of routing.locales) {
      fallbackSlugsByLocale[locale] = { ...DEFAULT_COLLECTION_SLUGS };
    }

    const slugsByLocale = buildCollectionMetadata(fallbackSlugsByLocale);
    const slugToType = buildSlugToTypeMap(slugsByLocale);
    const content = generateFileContent(slugsByLocale, slugToType, DEFAULT_COLLECTION_SLUGS);

    const outputDir = path.join(process.cwd(), 'src/lib/collections/generated');
    const outputPath = path.join(outputDir, 'collections.generated.ts');
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, content, 'utf-8');

    console.log('✅ Generated with default slugs');
  }
}

// Run generation
generateCollections().catch((error) => {
  console.error('❌ Fatal error during collection generation:', error);
  process.exit(1);
});
