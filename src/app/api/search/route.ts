import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { client } from '@/sanity/lib/client';
import { SEARCH_INDEX_QUERY } from '@/sanity/lib/queries';

export async function GET() {
  try {
    const data = await client.fetch(SEARCH_INDEX_QUERY);

    interface SearchItem {
      _id: string;
      _type: string;
      title: string;
      slug: string | null;
      description?: string;
    }

    const results = [
      ...(Array.isArray(data.posts) ? data.posts : []).map((p: SearchItem) => ({
        ...p,
        type: 'Blog',
        href: `/blog/${p.slug}`,
      })),
      ...(Array.isArray(data.pages) ? data.pages : []).map((p: SearchItem) => ({
        ...p,
        type: 'Page',
        href: `/${p.slug}`,
      })),
    ];

    return NextResponse.json(results);
  } catch (error) {
    logger.error({ err: error }, 'Search API Error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
