import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchXEmbed } from '@/lib/social-embed/providers/x';

vi.mock('@/lib/core/logger', () => ({ logger: { warn: vi.fn() } }));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('X provider render budget', () => {
  it('shares eight seconds across syndication and its fallback', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: false, status: 503 }), 6000))
      )
      .mockImplementationOnce(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(new Error('aborted')), {
              once: true,
            });
          })
      );
    vi.stubGlobal('fetch', fetchMock);
    const result = fetchXEmbed({
      platform: 'x',
      url: 'https://x.com/test/status/123',
      id: '123',
      username: 'test',
    });
    await vi.advanceTimersByTimeAsync(6000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(2000);
    expect((await result).isFallback).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});
