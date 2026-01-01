import type { NextRequest } from 'next/server';
import { type Locale, localeConfig, routing } from '@/i18n/routing';
import { BASE_URL } from '@/lib/core/env';

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Get locale display name from centralized config
 */
function getLocaleDisplayName(locale: string): string {
  return localeConfig[locale as Locale]?.title ?? locale;
}

export async function GET(_req: NextRequest) {
  const now = new Date().toISOString();

  // Build sitemap index XML with XSL stylesheet reference
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?xml-stylesheet type="text/xsl" href="/sitemap-index.xsl"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add a sitemap entry for each locale
  for (const locale of routing.locales) {
    const displayName = getLocaleDisplayName(locale);
    xml += '  <sitemap>\n';
    xml += `    <loc>${escapeXml(`${BASE_URL}/sitemap-${locale}.xml`)}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <!-- ${displayName} Sitemap -->\n`;
    xml += '  </sitemap>\n';
  }

  xml += '</sitemapindex>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
