import { draftMode } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/core/env';

/**
 * Validates that a redirect path is safe (internal only).
 * Prevents open redirect attacks by rejecting external URLs.
 */
function isValidInternalPath(path: string | null): path is string {
  if (!path) return false;

  // Must start with a single forward slash (not //)
  if (!path.startsWith('/') || path.startsWith('//')) return false;

  // Must not contain protocol indicators
  if (path.includes('://')) return false;

  // Must not contain encoded slashes that could bypass checks
  if (path.toLowerCase().includes('%2f%2f')) return false;

  return true;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  (await draftMode()).disable();

  // Only redirect to valid internal paths to prevent open redirect attacks
  const redirectPath = isValidInternalPath(slug) ? slug : '/';

  return NextResponse.redirect(new URL(redirectPath, BASE_URL));
}
