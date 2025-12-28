import type { NextRequest } from 'next/server';
import { BASE_URL } from '@/lib/env';
import { routing } from '@/i18n/routing';

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
 * Get locale display name
 */
function getLocaleDisplayName(locale: string): string {
  const names: Record<string, string> = {
    en: 'English',
    nb: 'Norsk',
  };
  return names[locale] ?? locale;
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
