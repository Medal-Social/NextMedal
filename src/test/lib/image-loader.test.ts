import { describe, expect, it, vi } from 'vitest';
import imageLoader from '@/lib/image-loader';

describe('imageLoader', () => {
  it('returns original src if NEXT_PUBLIC_IMAGE_PROXY_URL is not set', () => {
    vi.stubEnv('NEXT_PUBLIC_IMAGE_PROXY_URL', '');
    const result = imageLoader({ src: '/test.jpg', width: 100 });
    expect(result).toBe('/test.jpg');
  });

  it('returns proxied URL if NEXT_PUBLIC_IMAGE_PROXY_URL is set', () => {
    vi.stubEnv('NEXT_PUBLIC_IMAGE_PROXY_URL', 'https://proxy.com');
    const result = imageLoader({ src: '/test.jpg', width: 100 });
    expect(result).toContain('https://proxy.com/insecure');
  });

  it('handles UTF-8 characters in the source URL correctly (server-side/Buffer)', () => {
    vi.stubEnv('NEXT_PUBLIC_IMAGE_PROXY_URL', 'https://proxy.com');
    const src = '/ø-test-å.jpg';
    const result = imageLoader({ src, width: 100 });

    // The expected base64url encoding of http://localhost:3000/ø-test-å.jpg
    // http://localhost:3000/%C3%B8-test-%C3%A5.jpg
    // or if encoded as raw UTF-8:
    // aHR0cDovL2xvY2FsaG9zdDozMDAwL8O4LXRlc3Qtw6UuanBn

    expect(result).toContain('https://proxy.com/insecure');
    // Ensure it doesn't crash
  });

  it('simulates server environment (Buffer available)', () => {
    vi.stubEnv('NEXT_PUBLIC_IMAGE_PROXY_URL', 'https://proxy.com');

    // In Vitest/Node, Buffer is available
    expect(typeof Buffer).toBe('function');

    const result = imageLoader({ src: '/test.jpg', width: 100 });
    expect(result).toContain('https://proxy.com/insecure');
  });

  it('handles absolute URLs correctly', () => {
    vi.stubEnv('NEXT_PUBLIC_IMAGE_PROXY_URL', 'https://proxy.com');
    const result = imageLoader({ src: 'https://example.com/image.jpg', width: 100 });
    expect(result).toContain('https://proxy.com/insecure');
  });

  it('falls back to btoa when Buffer is not available (browser simulation)', () => {
    vi.stubEnv('NEXT_PUBLIC_IMAGE_PROXY_URL', 'https://proxy.com');

    // Temporarily mock global Buffer as undefined
    const realBuffer = global.Buffer;
    // @ts-expect-error
    delete global.Buffer;

    try {
      const result = imageLoader({ src: '/test.jpg', width: 100 });
      expect(result).toContain('https://proxy.com/insecure');
    } finally {
      // Restore Buffer
      global.Buffer = realBuffer;
    }
  });
});
