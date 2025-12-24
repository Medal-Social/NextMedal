import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

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
    // Next.js 16 (or this canary version) requires a second argument for revalidateTag,
    // but we use a try/catch to handle both signatures for cross-version compatibility.
    try {
      // @ts-ignore - Handle possible two-argument signature in Next.js 16
      revalidateTag(body._type, 'default');
    } catch (e) {
      // Fallback to standard single-argument signature
      revalidateTag(body._type);
    }
    logger.info({ msg: 'Revalidated tag', type: body._type });

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
    logger.error({ err }, 'Revalidation error');
    return new Response(err.message, { status: 500 });
  }
}
