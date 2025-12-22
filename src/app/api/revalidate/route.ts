import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { env } from '@/lib/env';

type WebhookPayload = {
  _type: string;
  slug?: {
    current?: string;
  };
};

export async function POST(req: NextRequest) {
  try {
    if (!env.SANITY_REVALIDATE_SECRET) {
      return new Response('Missing SANITY_REVALIDATE_SECRET', { status: 500 });
    }

    const { isValidSignature, body } = await parseBody<WebhookPayload>(
      req,
      env.SANITY_REVALIDATE_SECRET
    );

    if (!isValidSignature) {
      return new Response('Invalid signature', { status: 401 });
    }

    if (!body?._type) {
      return new Response('Bad Request', { status: 400 });
    }

    // Revalidate the specific document type
    revalidateTag(body._type);
    console.log(`Revalidated tag: ${body._type}`);

    // If it's a page or post with a slug, we might want to be more specific,
    // but revalidating the type is usually safe and sufficient for lists.
    // For individual pages, next-sanity's fetch usually tags by ID as well,
    // but revalidating the *type* ensures list pages (like /blog) update too.

    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
      body,
    });
  } catch (err: any) {
    console.error(err);
    return new Response(err.message, { status: 500 });
  }
}
