import { NextResponse } from 'next/server';
import { groq } from 'next-sanity';
import { logger } from '@/lib/logger';
import { client } from '@/sanity/lib/client';

export async function GET() {
  try {
    const query = groq`{
    "posts": *[_type == "blog.post" && defined(metadata.slug.current) && metadata.noIndex != true] {
      _id,
      _type,
      "title": metadata.title,
      "slug": metadata.slug.current,
      "description": metadata.description
    },
    "pages": *[_type == "page" && defined(metadata.slug.current) && metadata.slug.current != "index" && metadata.noIndex != true] {
      _id,
      _type,
      "title": metadata.title,
      "slug": metadata.slug.current
    },
    "authors": *[_type == "person"] {
      _id,
      _type,
      "title": name,
      "slug": null
    }
  }`;

    const data = await client.fetch(query);

    const results = [
      ...(Array.isArray(data.posts) ? data.posts : []).map((p: any) => ({
        ...p,
        type: 'Blog',
        href: `/blog/${p.slug}`,
      })),
      ...(Array.isArray(data.pages) ? data.pages : []).map((p: any) => ({
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
