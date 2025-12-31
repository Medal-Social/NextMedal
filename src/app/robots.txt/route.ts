import { NextResponse } from 'next/server';
import { BASE_URL, isPreview, isStaging, vercelPreview } from '@/lib/core/env';

export async function GET() {
  const siteUrl = BASE_URL;

  const content = [
    '# ___  ___         _       _   _____            _       _ ',
    '# |  \\/  |        | |     | | /  ___|          (_)     | |',
    '# | .  . | ___  __| | __ _| | \\ `--.  ___   ___ _  __ _| |',
    '# | |\\/| |/ _ \\/ _` |/ _` | |  `--. \\/ _ \\ / __| |/ _` | |',
    '# | |  | |  __/ (_| | (_| | | /\\__/ / (_) | (__| | (_| | |',
    '# \\_|  |_/\\___|\\__,_|\\__,_|_| \\____/ \\___/ \\___|_|\\__,_|_|',
    '#',
    '# Created by  https://www.medalsocial.com/about',
    '#',
    '',
    ...(isStaging || isPreview || vercelPreview
      ? ['User-agent: *', 'Disallow: /']
      : ['User-agent: *', 'Allow: /', '', 'User-agent: Twitterbot', 'Allow: /']),
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '# RSS feed for article content',
    `# ${siteUrl}/articles/rss.xml`,
    `Host: ${siteUrl}`,
  ].join('\n');

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
