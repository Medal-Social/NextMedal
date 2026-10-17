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
