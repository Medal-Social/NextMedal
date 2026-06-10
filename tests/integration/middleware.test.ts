import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it } from 'vitest';
import middleware from '@/middleware';

function buildRequest(pathname: string, locale: string | null = null) {
  const url = `https://example.com${pathname}`;
  const headers = new Headers();
  if (locale) headers.set('accept-language', locale);
  return new NextRequest(url, { headers });
}

describe('i18n middleware', () => {
  it('forwards x-pathname on the request to downstream Server Components', () => {
    const request = buildRequest('/articles/hello');
    const response = middleware(request);

    expect(request.headers.get('x-pathname')).toBe('/articles/hello');
    expect(response).toBeInstanceOf(NextResponse);
  });

  it('returns a NextResponse for paths that next-intl rewrites', () => {
    // Even at `/` next-intl rewrites to its locale-prefixed canonical
    // (e.g. `/en`) — that's the whole reason a rewrite exists. The middleware
    // returns next-intl's response, so x-middleware-rewrite is present.
    const request = buildRequest('/');
    const response = middleware(request);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.headers.get('x-middleware-rewrite')).toBe('https://example.com/en');
  });

  it('forwards request headers via the rewrite for nested paths', () => {
    // next-intl copies the mutated request headers (including x-pathname) onto
    // its rewrite response, so they reach downstream Server Components.
    const request = buildRequest('/articles/hello');
    const response = middleware(request);

    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'https://example.com/en/articles/hello'
    );
    expect(request.headers.get('x-pathname')).toBe('/articles/hello');
  });
});
