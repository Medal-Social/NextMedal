import { describe, expect, it, vi } from 'vitest';
import { PageCache } from '@/components/blocks/objects/flipbook/page-cache';

/** Synchronous scheduler + manually resolved renders, so ordering is observable. */
function setup(count = 40, extra: Partial<ConstructorParameters<typeof PageCache>[0]> = {}) {
  const order: number[] = [];
  const pending = new Map<number, (url: string) => void>();
  const revoke = vi.fn();
  const onChange = vi.fn();
  const cache = new PageCache({
    count,
    render: (i) =>
      new Promise<string>((resolve) => {
        order.push(i);
        pending.set(i, resolve);
      }),
    onChange,
    revoke,
    schedule: (run) => run(),
    ...extra,
  });
  /** Resolve the in-flight render and let the next one start. */
  const settle = async () => {
    const [i] = [...pending.keys()];
    if (i === undefined) return undefined;
    pending.get(i)?.(`blob:${i}`);
    pending.delete(i);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    return i;
  };
  const drain = async (max = 100) => {
    for (let n = 0; n < max && pending.size; n++) await settle();
  };
  return { cache, order, revoke, onChange, settle, drain, pending };
}

describe('PageCache', () => {
  it('renders the visible spread first, then outwards with more pages ahead than behind', async () => {
    const { cache, order, drain } = setup(40, { behind: 2, ahead: 3 });
    cache.focus(10, 11);
    await drain();
    expect(order).toEqual([10, 11, 12, 9, 13, 8, 14]);
    expect(cache.windowSettled).toBe(true);
  });

  it('renders one page at a time', () => {
    const { cache, pending } = setup();
    cache.focus(0, 0);
    expect(pending.size).toBe(1);
  });

  it('pauses while busy and resumes afterwards', async () => {
    const { cache, order, settle } = setup(40, { behind: 0, ahead: 2 });
    cache.focus(0, 0);
    cache.setBusy(true);
    await settle(); // the in-flight page finishes, nothing new starts
    expect(order).toEqual([0]);
    cache.setBusy(false);
    expect(order).toEqual([0, 1]);
  });

  it('cancels the render in progress when a turn starts and prepares it again afterwards', async () => {
    const signals: AbortSignal[] = [];
    const order: number[] = [];
    const cache = new PageCache({
      count: 10,
      behind: 0,
      ahead: 0,
      schedule: (run) => run(),
      revoke: vi.fn(),
      render: (i, signal) => {
        order.push(i);
        signals.push(signal);
        return new Promise<string>((resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('cancelled')));
          if (order.length > 1) resolve(`blob:${i}`);
        });
      },
    });
    cache.focus(3, 3);
    cache.setBusy(true);
    expect(signals[0]?.aborted).toBe(true);
    for (let n = 0; n < 5; n++) await Promise.resolve();
    expect(cache.isSettled(3)).toBe(false); // not marked as failed
    cache.setBusy(false);
    for (let n = 0; n < 5; n++) await Promise.resolve();
    expect(order).toEqual([3, 3]);
    expect(cache.get(3)).toBe('blob:3');
  });

  it('prepares a cancelled explicit request again, even outside the reading window', async () => {
    let calls = 0;
    const cache = new PageCache({
      count: 100,
      behind: 0,
      ahead: 0,
      schedule: (run) => run(),
      revoke: vi.fn(),
      render: (i, signal) => {
        calls++;
        return new Promise<string>((resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('cancelled')));
          if (calls > 2) resolve(`blob:${i}`);
          if (i === 0) resolve('blob:0');
        });
      },
    });
    cache.focus(0, 0);
    for (let n = 0; n < 5; n++) await Promise.resolve();
    cache.want(80);
    cache.setBusy(true); // cancels page 80
    for (let n = 0; n < 5; n++) await Promise.resolve();
    cache.setBusy(false);
    for (let n = 0; n < 8; n++) await Promise.resolve();
    expect(cache.get(80)).toBe('blob:80');
  });

  it('drops withdrawn and stale requests', async () => {
    const { cache, order, drain } = setup(100, { behind: 0, ahead: 0, keepWanted: 2 });
    cache.focus(0, 0); // page 0 in flight
    cache.want(50);
    cache.want(60);
    cache.want(70); // 50 is now the oldest beyond keepWanted
    cache.unwant(70);
    await drain();
    expect(order).toEqual([0, 60]);
  });

  it('cancels a window render the reader jumped away from, so the new spread goes first', async () => {
    const signals = new Map<number, AbortSignal>();
    const order: number[] = [];
    const cache = new PageCache({
      count: 100,
      behind: 0,
      ahead: 0,
      schedule: (run) => run(),
      revoke: vi.fn(),
      render: (i, signal) => {
        order.push(i);
        signals.set(i, signal);
        return new Promise<string>((resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('cancelled')));
          if (i === 60) resolve('blob:60');
        });
      },
    });
    cache.focus(3, 3);
    cache.focus(60, 60);
    expect(signals.get(3)?.aborted).toBe(true);
    for (let n = 0; n < 6; n++) await Promise.resolve();
    expect(order).toEqual([3, 60]);
    expect(cache.get(60)).toBe('blob:60');
  });

  it('does not queue cancelled window pages ahead of the pages on screen', async () => {
    const order: number[] = [];
    const cache = new PageCache({
      count: 100,
      behind: 0,
      ahead: 0,
      schedule: (run) => run(),
      revoke: vi.fn(),
      render: (i, signal) => {
        order.push(i);
        return new Promise<string>((resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('cancelled')));
          if (i === 12) resolve('blob:12');
        });
      },
    });
    cache.focus(10, 10);
    for (const next of [11, 12]) {
      cache.setBusy(true); // a turn starts: the render in progress is cancelled
      for (let n = 0; n < 4; n++) await Promise.resolve();
      cache.focus(next, next); // ...and the reader lands on the next page
      cache.setBusy(false);
      for (let n = 0; n < 4; n++) await Promise.resolve();
    }
    expect(order).toEqual([10, 11, 12]); // no stale 10 or 11 re-rendered first
    expect(cache.get(12)).toBe('blob:12');
  });

  it('keeps recently requested pages even when far from the reading position', async () => {
    const { cache, drain } = setup(100, { capacity: 3, behind: 0, ahead: 1, keepWanted: 1 });
    cache.focus(0, 0);
    cache.want(90);
    await drain();
    cache.focus(40, 40);
    await drain();
    expect(cache.get(90)).toBe('blob:90');
    expect(cache.size).toBeLessThanOrEqual(4);
  });

  it('re-prioritises when the reader jumps', async () => {
    const { cache, order, settle, drain } = setup(100, { behind: 1, ahead: 1 });
    cache.focus(0, 0);
    await settle(); // page 0 done, page 1 in flight
    cache.focus(50, 51);
    await drain();
    expect(order.slice(0, 2)).toEqual([0, 1]);
    expect(order.slice(2, 4)).toEqual([50, 51]);
  });

  it('serves explicit requests ahead of the window', async () => {
    const { cache, order, settle, drain } = setup(100, { behind: 0, ahead: 2 });
    cache.focus(0, 0);
    cache.want(80);
    await settle();
    await drain();
    expect(order[1]).toBe(80);
  });

  it('keeps memory bounded by releasing the pages furthest away', async () => {
    const { cache, revoke, onChange, drain } = setup(100, { capacity: 4, behind: 0, ahead: 1 });
    for (const at of [0, 10, 20, 30]) {
      cache.focus(at, at);
      await drain();
    }
    expect(cache.size).toBeLessThanOrEqual(4);
    expect(revoke).toHaveBeenCalledWith('blob:0');
    expect(onChange).toHaveBeenCalledWith(0, undefined);
    expect(cache.get(30)).toBe('blob:30');
  });

  it('marks failed pages settled and does not retry them', async () => {
    let calls = 0;
    const cache = new PageCache({
      count: 3,
      behind: 0,
      ahead: 0,
      schedule: (run) => run(),
      revoke: vi.fn(),
      render: async () => {
        calls++;
        throw new Error('broken');
      },
    });
    cache.focus(1, 1);
    for (let n = 0; n < 5; n++) await Promise.resolve();
    cache.focus(1, 1);
    for (let n = 0; n < 5; n++) await Promise.resolve();
    expect(calls).toBe(1);
    expect(cache.isSettled(1)).toBe(true);
  });

  it('revokes everything on destroy, including a render that lands afterwards', async () => {
    const { cache, revoke, settle } = setup(10, { behind: 0, ahead: 0 });
    cache.focus(0, 0);
    cache.destroy();
    await settle();
    expect(revoke).toHaveBeenCalledWith('blob:0');
  });
});
