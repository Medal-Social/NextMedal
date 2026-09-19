import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it } from 'vitest';
import middleware, { config } from '@/middleware';

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

describe('locale routing contract', () => {
  it.each(['/', '/articles/hello?tag=one%20two'])(
    'rewrites %s with locale cookie and request headers',
    (path) => {
      const request = buildRequest(path);
      request.headers.set('x-correlation-id', 'request-123');
      const response = middleware(request);
      const expected = new URL(request.url);
      expected.pathname = `/en${expected.pathname === '/' ? '' : expected.pathname}`;
      expect(response.headers.get('x-middleware-rewrite')).toBe(expected.href);
      expect(response.headers.get('x-middleware-request-x-pathname')).toBe(
        request.nextUrl.pathname
      );
      expect(response.headers.get('x-middleware-request-x-correlation-id')).toBe('request-123');
      expect(response.cookies.get('NEXT_LOCALE')).toMatchObject({
        value: 'en',
        path: '/',
        sameSite: 'lax',
      });
    }
  );
  it.each([
    ['/en', '/'],
    ['/en/articles?tag=one%20two', '/articles?tag=one%20two'],
    ['/en//attacker.example?title=hello', '/attacker.example?title=hello'],
    ['/en///attacker.example/path', '/attacker.example/path'],
  ])('keeps default locale redirect %s on the original origin', (path, destination) => {
    const response = middleware(buildRequest(path));
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe(`https://example.com${destination}`);
    expect(response.cookies.get('NEXT_LOCALE')).toBeUndefined();
  });
  it('passes the nondefault locale through with cookie and forwarded headers', () => {
    const request = buildRequest('/nb/artikler?tag=one%20two');
    const response = middleware(request);
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    expect(response.headers.get('location')).toBeNull();
    expect(request.nextUrl.search).toBe('?tag=one%20two');
    expect(response.headers.get('x-middleware-request-x-pathname')).toBe('/nb/artikler');
    expect(response.cookies.get('NEXT_LOCALE')).toMatchObject({
      value: 'nb',
      path: '/',
      sameSite: 'lax',
    });
  });
  it.each([
    '/api/health',
    '/studio',
    '/studio/desk',
    '/_next/static/chunk.js',
    '/style.css',
    '/robots.txt',
  ])('excludes owned routes and assets from locale middleware: %s', (url) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(false);
  });
  it.each(['/articles', '/contact.html', '/articles/report.xml', '/nb/report.json'])(
    'matches page routes: %s',
    (url) => {
      expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(true);
    }
  );
});
