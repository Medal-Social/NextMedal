import type { MetadataRoute } from 'next';
import { logger } from '@/lib/logger';
import { getSite } from '@/sanity/lib/fetch';
import { getBlockText } from '@/sanity/lib/utils';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // Colors from globals.css
  const THEME_COLOR = '#5B2D8C'; // --color-brand-600
  const BACKGROUND_COLOR = '#ffffff';

  let site: Sanity.Site | null = null;
  let description: string | undefined;

  try {
    site = await getSite();
    description = site?.tagline ? getBlockText(site.tagline, ' ') : undefined;
  } catch (error: any) {
    // Fallback if CMS is unreachable or Site document is missing
    logger.warn({ err: error }, 'Failed to fetch site settings for manifest, using fallbacks.');
  }

  return {
    name: site?.title || 'NextMedal',
    short_name: site?.title?.slice(0, 12) || 'NextMedal',
    description:
      description || 'A high-performance website template built with Next.js and Sanity.',
    start_url: '/',
    display: 'standalone',
    background_color: BACKGROUND_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
      {
        src: '/icons/icon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
