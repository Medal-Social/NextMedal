import type { NextRequest } from 'next/server';
import { groq } from 'next-sanity';
import { fetchSanityLive } from '@/sanity/lib/fetch';

export async function GET(_req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  let data: Record<string, any>;
  try {
    data = await fetchSanityLive<Record<string, any>>({
      query: groq`{
        'pages': *[
          _type == 'page' &&
          !(metadata.slug.current in ['404']) &&
          metadata.noIndex != true
        ]|order(metadata.slug.current){
          'url': $baseUrl + select(metadata.slug.current == 'index' => '', metadata.slug.current),
          'lastModified': _updatedAt,
          'priority': select(
            metadata.slug.current == 'index' => 1,
            0.5
          ),
        },
        'blog': *[_type == 'blog.post' && metadata.noIndex != true]|order(name){
          'url': $baseUrl + 'blog/' + metadata.slug.current,
          'lastModified': _updatedAt,
          'priority': 0.4
        },
      }`,
      params: { baseUrl: `${baseUrl}/` },
    });
  } catch (error) {
    console.error('Error fetching sitemap data from Sanity:', error);
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
