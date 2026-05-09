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

  it('returns a NextResponse for paths that next-intl rewrites', () => {
    // Even at `/` next-intl rewrites to its locale-prefixed canonical
    // (e.g. `/en`) — that's the whole reason a rewrite exists. The proxy
    // re-emits the rewrite so forwarded request headers are attached, so
    // x-middleware-rewrite is expected to be present (re-set by
    // NextResponse.rewrite).
    const request = buildRequest('/');
    const response = proxy(request);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.headers.get('x-middleware-rewrite')).toBe('https://example.com/en');
  });

  it('forwards request headers via the rebuilt rewrite for nested paths', () => {
    // The whole point of the rebuild is forwarding x-pathname to downstream
    // Server Components while preserving the next-intl rewrite directive.
    const request = buildRequest('/articles/hello');
    const response = proxy(request);

    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'https://example.com/en/articles/hello'
    );
    expect(request.headers.get('x-pathname')).toBe('/articles/hello');
  });
});
