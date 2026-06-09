import { draftMode } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/core/env';

/**
 * Validates that a redirect path is safe (internal only).
 * Prevents open redirect attacks by rejecting external URLs.
 */
function isValidInternalPath(path: string | null): path is string {
  if (!path) return false;

  // Must start with a single forward slash (not // or /\, which browsers
  // normalize to a protocol-relative URL and resolve off-site)
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return false;

  // Backslashes anywhere can be normalized to forward slashes by the browser
  if (path.includes('\\')) return false;

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
  const target = new URL(redirectPath, BASE_URL);

  // Defense in depth: never redirect off-origin even if validation is bypassed
  if (target.origin !== new URL(BASE_URL).origin) {
    return NextResponse.redirect(new URL('/', BASE_URL));
  }

  return NextResponse.redirect(target);
}
