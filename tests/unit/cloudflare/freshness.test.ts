import { describe, expect, it } from 'vitest';
import { DOCUMENT_CACHE_CONTROL, withDocumentFreshness } from '../../../cloudflare/freshness.js';

describe('browser document freshness', () => {
  it.each(['text/html; charset=utf-8', 'text/x-component'])(
    'revalidates %s without changing the stored response',
    async (type) => {
      const source = new Response('release A', {
        headers: {
          'Content-Type': type,
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=31535400',
          ETag: '"release-a"',
          Vary: 'rsc, next-router-state-tree',
          'x-nextjs-deployment-id': 'release-a',
        },
      });
      const result = withDocumentFreshness(new Request('https://example.com/'), source);
      expect(result.headers.get('Cache-Control')).toBe(DOCUMENT_CACHE_CONTROL);
      expect(source.headers.get('Cache-Control')).toContain('s-maxage=600');
      expect(result.headers.get('ETag')).toBe('"release-a"');
      expect(result.headers.get('Vary')).toBe('rsc, next-router-state-tree');
      expect(result.headers.get('x-nextjs-deployment-id')).toBe('release-a');
      expect(await result.text()).toBe('release A');
    }
  );

  it('retains no-store, cookies, and no-transform for private Studio/auth responses', () => {
    const result = withDocumentFreshness(
      new Request('https://example.com/studio'),
      new Response('studio', {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'private, no-store, no-transform',
          'Set-Cookie': 'session=example; HttpOnly; Secure',
        },
      })
    );
    expect(result.headers.get('Cache-Control')).toContain('no-store');
    expect(result.headers.get('Cache-Control')).toContain('no-transform');
    expect(result.headers.get('Set-Cookie')).toContain('HttpOnly');
  });

  it.each(['application/json', 'application/javascript', 'text/css', 'image/png'])(
    'does not change %s caching',
    (type) => {
      const source = new Response('asset', {
        headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable' },
      });
      expect(withDocumentFreshness(new Request('https://example.com/file'), source)).toBe(source);
    }
  );

  it.each([{}, { Cookie: 'NEXT_LOCALE=nb' }, { RSC: '1' }] as Record<string, string>[])(
    'covers cache hits and bypass requests %j',
    (headers) => {
      const result = withDocumentFreshness(
        new Request('https://example.com/', { headers }),
        new Response('page', { headers: { 'Content-Type': 'text/html' } })
      );
      expect(result.headers.get('Cache-Control')).toBe(DOCUMENT_CACHE_CONTROL);
    }
  );

  it('keeps browser validation mandatory after a bodyless 304', () => {
    const result = withDocumentFreshness(
      new Request('https://example.com/', {
        headers: { Accept: 'text/html', 'If-None-Match': '"a"' },
      }),
      new Response(null, { status: 304, headers: { ETag: '"a"' } })
    );
    expect(result.status).toBe(304);
    expect(result.body).toBeNull();
    expect(result.headers.get('Cache-Control')).toBe(DOCUMENT_CACHE_CONTROL);
  });

  it('preserves compressed bytes and does not buffer the stream', async () => {
    const bytes = new Uint8Array([31, 139, 8, 0]);
    const source = new Response(bytes, {
      headers: { 'Content-Type': 'text/html', 'Content-Encoding': 'gzip' },
    });
    const body = source.body;
    const result = withDocumentFreshness(new Request('https://example.com/'), source);
    expect(result.body).toBe(body);
    expect(result.headers.get('Content-Encoding')).toBe('gzip');
    expect(new Uint8Array(await result.arrayBuffer())).toEqual(bytes);
  });
});
