import { draftMode } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/env';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  (await draftMode()).disable();

  return NextResponse.redirect(new URL(slug || '/', BASE_URL));
}
