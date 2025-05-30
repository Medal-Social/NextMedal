import { NextResponse } from 'next/server';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nextmedal.com';

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
    'User-agent: *',
    'Allow: /',
    '',
    'User-agent: Twitterbot',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '# RSS feed for blog content',
    `# ${siteUrl}/blog/rss.xml`,
    `Host: ${siteUrl}`
  ].join('\n');

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
} 