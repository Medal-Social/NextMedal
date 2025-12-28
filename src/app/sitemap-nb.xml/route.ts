import type { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { BASE_URL } from '@/lib/env';
import { logger } from '@/lib/logger';
import { fetchSanityLive } from '@/sanity/lib/live';
import { SITEMAP_WITH_TRANSLATIONS_QUERY } from '@/sanity/lib/queries';

const LOCALE = 'nb';

interface TranslationEntry {
  slug: string;
  language: string;
}

interface SitemapEntry {
  slug: string;
  lastModified: string;
  priority: number;
  language: string;
  translations: TranslationEntry[];
}

interface SitemapData {
  pages: SitemapEntry[];
  blog: SitemapEntry[];
}

function buildUrl(slug: string, locale: string, prefix: 'blog' | '' = ''): string {
  const isDefaultLocale = locale === routing.defaultLocale;
  const isIndex = slug === 'index';
  const parts: string[] = [BASE_URL];
  if (!isDefaultLocale) parts.push(locale);
  if (prefix) parts.push(prefix);
  if (!isIndex) parts.push(slug);
  return parts.join('/');
}

function buildHreflangLinks(
  entry: SitemapEntry,
  prefix: 'blog' | '' = ''
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

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateUrlEntry(entry: SitemapEntry, prefix: 'blog' | '' = ''): string {
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

export async function GET(_req: NextRequest) {
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

  const pages = (data.pages ?? []).filter(isValidEntry).filter((e) => e.language === LOCALE);
  const blog = (data.blog ?? []).filter(isValidEntry).filter((e) => e.language === LOCALE);

  for (const entry of pages) entry.translations = entry.translations ?? [];
  for (const entry of blog) entry.translations = entry.translations ?? [];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';
  xml +=
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  for (const entry of pages) xml += generateUrlEntry(entry, '');
  for (const entry of blog) xml += generateUrlEntry(entry, 'blog');

  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
