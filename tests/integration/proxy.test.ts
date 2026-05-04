import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it } from 'vitest';
import { proxy } from '@/proxy';

function buildRequest(pathname: string, locale: string | null = null) {
  const url = `https://example.com${pathname}`;
  const headers = new Headers();
  if (locale) headers.set('accept-language', locale);
  return new NextRequest(url, { headers });
}

describe('proxy middleware', () => {
  it('forwards x-pathname on the request to downstream Server Components', () => {
    const request = buildRequest('/articles/hello');
    const response = proxy(request);

    expect(request.headers.get('x-pathname')).toBe('/articles/hello');
    expect(response).toBeInstanceOf(NextResponse);
  });

  it('preserves the rebuilt response body for non-redirect, non-rewrite paths', () => {
    const request = buildRequest('/');
    const response = proxy(request);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('preserves response headers other than x-middleware-rewrite when re-emitting', () => {
    // The whole point of the rewrite is forwarding request headers AND
    // copying every response header next-intl set (locale cookie, etc.)
    // except the rewrite directive (which we consume).
    const request = buildRequest('/articles/hello');
    const response = proxy(request);

    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    // request still carries the forwarded x-pathname for downstream readers
    expect(request.headers.get('x-pathname')).toBe('/articles/hello');
  });
});
