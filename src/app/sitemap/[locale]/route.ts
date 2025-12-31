import type { NextRequest } from 'next/server';
import type { Locale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { BASE_URL } from '@/lib/core/env';
import { logger } from '@/lib/core/logger';
import { fetchSanityLive } from '@/sanity/lib/live';
import { SITEMAP_WITH_TRANSLATIONS_QUERY } from '@/sanity/lib/queries';

// Type for dynamic route params
type Params = { locale: string };

// Tell Next.js what locales are valid for static generation
export function generateStaticParams(): Params[] {
  return routing.locales.map((locale) => ({ locale }));
}

interface TranslationEntry {
  slug: string;
  language: string;
  collectionSlug?: string;
}

interface SitemapEntry {
  slug: string;
  lastModified: string;
  priority: number;
  language: string;
  translations: TranslationEntry[];
}

interface CollectionSitemapEntry extends SitemapEntry {
  collectionSlug: string;
}

interface SitemapData {
  pages: SitemapEntry[];
  blog: SitemapEntry[];
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

function buildCollectionUrl(slug: string, collectionSlug: string, locale: string): string {
  const isDefaultLocale = locale === routing.defaultLocale;
  const parts: string[] = [BASE_URL];
  if (!isDefaultLocale) parts.push(locale);
  parts.push(collectionSlug);
  parts.push(slug);
  return parts.join('/');
}

function buildHreflangLinks(
  entry: SitemapEntry,
  prefix: string = ''
): { lang: string; url: string }[] {
  const links: { lang: string; url: string }[] = [];
  links.push({ lang: entry.language, url: buildUrl(entry.slug, entry.language, prefix) });
  for (const translation of entry.translations) {
    if (translation?.language && translation?.slug && translation.language !== entry.language) {
      links.push({
        lang: translation.language,
        url: buildUrl(translation.slug, translation.language, prefix),
      });
    }
  }
  return links;
}

function buildCollectionHreflangLinks(
  entry: CollectionSitemapEntry
): { lang: string; url: string }[] {
  const links: { lang: string; url: string }[] = [];
  links.push({
    lang: entry.language,
    url: buildCollectionUrl(entry.slug, entry.collectionSlug, entry.language),
  });
  for (const translation of entry.translations) {
    if (
      translation?.language &&
      translation?.slug &&
      translation?.collectionSlug &&
      translation.language !== entry.language
    ) {
      links.push({
        lang: translation.language,
        url: buildCollectionUrl(translation.slug, translation.collectionSlug, translation.language),
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

function generateCollectionUrlEntry(entry: CollectionSitemapEntry): string {
  const url = buildCollectionUrl(entry.slug, entry.collectionSlug, entry.language);
  const hreflangLinks = buildCollectionHreflangLinks(entry);
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

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const params = await context.params;
  const locale = params?.locale ?? '';

  // Validate locale - redirect to sitemap index if invalid
  if (!routing.locales.includes(locale as Locale)) {
    return Response.redirect(new URL('/sitemap.xml', BASE_URL), 302);
  }

  let data: SitemapData;

  try {
    data = await fetchSanityLive<SitemapData>({
      query: SITEMAP_WITH_TRANSLATIONS_QUERY,
      stega: false,
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching sitemap data from Sanity');
    return new Response('Failed to fetch sitemap data from CMS.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const isValidEntry = (entry: SitemapEntry | null): entry is SitemapEntry =>
    entry != null && typeof entry.slug === 'string' && typeof entry.language === 'string';

  const isValidCollectionEntry = (
    entry: CollectionSitemapEntry | null
  ): entry is CollectionSitemapEntry =>
    entry != null &&
    typeof entry.slug === 'string' &&
    typeof entry.language === 'string' &&
    typeof entry.collectionSlug === 'string';

  const pages = (data.pages ?? [])
    .filter(isValidEntry)
    .filter((entry) => entry.language === locale);
  const blog = (data.blog ?? []).filter(isValidEntry).filter((entry) => entry.language === locale);
  const collections = (data.collections ?? [])
    .filter(isValidCollectionEntry)
    .filter((entry) => entry.language === locale);

  for (const entry of pages) entry.translations = entry.translations ?? [];
  for (const entry of blog) entry.translations = entry.translations ?? [];
  for (const entry of collections) entry.translations = entry.translations ?? [];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';
  xml +=
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  for (const entry of pages) xml += generateUrlEntry(entry, '');
  for (const entry of blog) xml += generateUrlEntry(entry, 'blog');
  for (const entry of collections) xml += generateCollectionUrlEntry(entry);

  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
