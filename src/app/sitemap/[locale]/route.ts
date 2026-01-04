import type { NextRequest } from 'next/server';
import type { Locale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { getAllCollections } from '@/lib/collections/registry';
import type { CollectionType } from '@/lib/collections/types';
import { BASE_URL } from '@/lib/core/env';
import { logger } from '@/lib/core/logger';
import { fetchSanityLive } from '@/sanity/lib/live';
import { SITEMAP_TRANSLATIONS_QUERY, SITEMAP_WITH_TRANSLATIONS_QUERY } from '@/sanity/lib/queries';

// Type for dynamic route params
type Params = { locale: string };

// Tell Next.js what locales are valid for static generation
export function generateStaticParams(): Params[] {
  return routing.locales.map((locale) => ({ locale }));
}

interface TranslationEntry {
  slug: string;
  language: string;
  _type?: string;
}

interface SitemapEntry {
  _id: string;
  _type?: string;
  slug: string;
  lastModified: string;
  priority: number;
  language: string;
  translations?: TranslationEntry[];
}

interface CollectionSitemapEntry extends SitemapEntry {
  _type: string;
}

interface TranslationMetadata {
  _id: string;
  documentId: string;
  translations: Array<{
    value: {
      _id: string;
      _type: string;
      slug: string;
      language: string;
    } | null;
  }>;
}

interface SitemapData {
  pages: SitemapEntry[];
  articles: SitemapEntry[];
  collections: CollectionSitemapEntry[];
}

function buildUrl(slug: string, locale: string, prefix: string = ''): string {
  const isDefaultLocale = locale === routing.defaultLocale;
  const isIndex = slug === 'index';
  const parts: string[] = [BASE_URL];
  if (!isDefaultLocale) parts.push(locale);
  if (prefix) parts.push(prefix);
  if (!isIndex) parts.push(slug);
  return parts.join('/');
}

async function buildCollectionUrl(
  slug: string,
  collectionType: string,
  locale: string,
  collectionSlugsMap: Map<string, Record<CollectionType, string>>
): Promise<string> {
  const isDefaultLocale = locale === routing.defaultLocale;
  const parts: string[] = [BASE_URL];
  if (!isDefaultLocale) parts.push(locale);

  // Get collection slug from the map
  const slugs = collectionSlugsMap.get(locale);
  const collectionSlug = slugs?.[collectionType as CollectionType];
  if (collectionSlug) {
    parts.push(collectionSlug);
  }

  parts.push(slug);
  return parts.join('/');
}

function buildHreflangLinks(
  entry: SitemapEntry,
  prefix: string = ''
): { lang: string; url: string }[] {
  const links: { lang: string; url: string }[] = [];
  links.push({ lang: entry.language, url: buildUrl(entry.slug, entry.language, prefix) });
  for (const translation of entry.translations || []) {
    if (translation?.language && translation?.slug && translation.language !== entry.language) {
      links.push({
        lang: translation.language,
        url: buildUrl(translation.slug, translation.language, prefix),
      });
    }
  }
  return links;
}

async function buildCollectionHreflangLinks(
  entry: CollectionSitemapEntry,
  collectionSlugsMap: Map<string, Record<CollectionType, string>>
): Promise<{ lang: string; url: string }[]> {
  const links: { lang: string; url: string }[] = [];
  links.push({
    lang: entry.language,
    url: await buildCollectionUrl(entry.slug, entry._type, entry.language, collectionSlugsMap),
  });
  for (const translation of entry.translations || []) {
    if (
      translation?.language &&
      translation?.slug &&
      translation?._type &&
      translation.language !== entry.language
    ) {
      links.push({
        lang: translation.language,
        url: await buildCollectionUrl(
          translation.slug,
          translation._type,
          translation.language,
          collectionSlugsMap
        ),
      });
    }
  }
  return links;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateUrlEntry(entry: SitemapEntry, prefix: string = ''): string {
  const url = buildUrl(entry.slug, entry.language, prefix);
  const hreflangLinks = buildHreflangLinks(entry, prefix);
  const hasTranslations = hreflangLinks.length > 1;

  let xml = '  <url>\n';
  xml += `    <loc>${escapeXml(url)}</loc>\n`;
  if (entry.lastModified) {
    xml += `    <lastmod>${new Date(entry.lastModified).toISOString()}</lastmod>\n`;
  }
  if (entry.priority != null) {
    xml += `    <priority>${entry.priority}</priority>\n`;
  }
  if (hasTranslations) {
    for (const link of hreflangLinks) {
      xml += `    <xhtml:link rel="alternate" hreflang="${link.lang}" href="${escapeXml(link.url)}"/>\n`;
    }
  }
  xml += '  </url>\n';
  return xml;
}

async function generateCollectionUrlEntry(
  entry: CollectionSitemapEntry,
  collectionSlugsMap: Map<string, Record<CollectionType, string>>
): Promise<string> {
  const url = await buildCollectionUrl(entry.slug, entry._type, entry.language, collectionSlugsMap);
  const hreflangLinks = await buildCollectionHreflangLinks(entry, collectionSlugsMap);
  const hasTranslations = hreflangLinks.length > 1;

  let xml = '  <url>\n';
  xml += `    <loc>${escapeXml(url)}</loc>\n`;
  if (entry.lastModified) {
    xml += `    <lastmod>${new Date(entry.lastModified).toISOString()}</lastmod>\n`;
  }
  if (entry.priority != null) {
    xml += `    <priority>${entry.priority}</priority>\n`;
  }
  if (hasTranslations) {
    for (const link of hreflangLinks) {
      xml += `    <xhtml:link rel="alternate" hreflang="${link.lang}" href="${escapeXml(link.url)}"/>\n`;
    }
  }
  xml += '  </url>\n';
  return xml;
}

// Data Fetching Helpers

async function fetchSitemapData() {
  try {
    const [data, translationsData] = await Promise.all([
      fetchSanityLive<SitemapData>({
        query: SITEMAP_WITH_TRANSLATIONS_QUERY,
        stega: false,
      }),
      fetchSanityLive<TranslationMetadata[]>({
        query: SITEMAP_TRANSLATIONS_QUERY,
        stega: false,
      }),
    ]);
    return { data, translationsData };
  } catch (error) {
    logger.error({ err: error }, 'Error fetching sitemap data from Sanity');
    return {
      errorResponse: new Response('Failed to fetch sitemap data from CMS.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' },
      }),
    };
  }
}

function buildTranslationsMap(translationsData: TranslationMetadata[] | undefined) {
  const translationsMap = new Map<string, TranslationEntry[]>();
  for (const translationMeta of translationsData || []) {
    if (translationMeta.documentId && translationMeta.translations) {
      translationsMap.set(
        translationMeta.documentId,
        translationMeta.translations
          .map((t) => t.value)
          .filter((v) => v != null)
          .map((v) => ({
            _type: v._type,
            slug: v.slug,
            language: v.language,
          }))
      );
    }
  }
  return translationsMap;
}

function buildCollectionSlugsMap() {
  const collectionSlugsMap = new Map<string, Record<CollectionType, string>>();
  for (const loc of routing.locales) {
    const collections = getAllCollections(loc);
    if (collections) {
      const slugsMap: Record<CollectionType, string> = {} as Record<CollectionType, string>;
      for (const [type, metadata] of Object.entries(collections)) {
        slugsMap[type as CollectionType] = metadata.slug;
      }
      collectionSlugsMap.set(loc, slugsMap);
    }
  }
  return collectionSlugsMap;
}

// Type Guards & Processors

function isValidEntry(entry: SitemapEntry | null): entry is SitemapEntry {
  return entry != null && typeof entry.slug === 'string' && typeof entry.language === 'string';
}

function isValidCollectionEntry(
  entry: CollectionSitemapEntry | null
): entry is CollectionSitemapEntry {
  return (
    entry != null &&
    typeof entry.slug === 'string' &&
    typeof entry.language === 'string' &&
    typeof entry._type === 'string'
  );
}

function processEntries<T extends SitemapEntry>(
  entries: T[] | undefined,
  locale: string,
  validator: (entry: T | null) => entry is T,
  translationsMap: Map<string, TranslationEntry[]>
): T[] {
  const filtered = (entries ?? []).filter(validator).filter((entry) => entry.language === locale);
  for (const entry of filtered) {
    entry.translations = translationsMap.get(entry._id) ?? [];
  }
  return filtered;
}

// Main Handler

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const params = await context.params;
  const locale = params?.locale ?? '';

  // Validate locale - redirect to sitemap index if invalid
  if (!routing.locales.includes(locale as Locale)) {
    return Response.redirect(new URL('/sitemap.xml', BASE_URL), 302);
  }

  const { data, translationsData, errorResponse } = await fetchSitemapData();
  if (errorResponse) return errorResponse;

  // Build lookups
  const translationsMap = buildTranslationsMap(translationsData);
  const collectionSlugsMap = buildCollectionSlugsMap();

  // Process data
  const pages = processEntries(data?.pages, locale, isValidEntry, translationsMap);
  const articles = processEntries(data?.articles, locale, isValidEntry, translationsMap);
  const collections = processEntries(
    data?.collections,
    locale,
    isValidCollectionEntry,
    translationsMap
  );

  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';
  xml +=
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  for (const entry of pages) xml += generateUrlEntry(entry, '');

  const articlesSlug = collectionSlugsMap.get(locale)?.['collection.article'] || 'articles';
  for (const entry of articles) xml += generateUrlEntry(entry, articlesSlug);

  for (const entry of collections) {
    xml += await generateCollectionUrlEntry(entry, collectionSlugsMap);
  }

  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
