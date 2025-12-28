import type { NextRequest } from 'next/server';
import { BASE_URL } from '@/lib/env';
import { logger } from '@/lib/logger';
import { fetchSanityLive } from '@/sanity/lib/live';
import { sitemapQuery } from '@/sanity/lib/queries';

interface SitemapEntry {
  url: string;
  lastModified?: string;
  priority?: number;
}

interface SitemapData {
  pages: SitemapEntry[];
  blog: SitemapEntry[];
}

export async function GET(_req: NextRequest) {
  const baseUrl = BASE_URL;
  let data: SitemapData;
  try {
    data = await fetchSanityLive<SitemapData>({
      query: sitemapQuery('$baseUrl'),
      params: { baseUrl: `${baseUrl}/` },
      stega: false,
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching sitemap data from Sanity');
    return new Response('Failed to fetch sitemap data from CMS.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const all = Object.values(data).flat();

  // Build XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const entry of all) {
    xml += '  <url>\n';
    xml += `    <loc>${entry.url}</loc>\n`;
    if (entry.lastModified)
      xml += `    <lastmod>${new Date(entry.lastModified).toISOString()}</lastmod>\n`;
    if (entry.priority != null) xml += `    <priority>${entry.priority}</priority>\n`;
    xml += '  </url>\n';
  }
  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
