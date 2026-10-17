/**
 * PageCache: prepares page images on demand around the reading position.
 *
 * Pages are rasterised one at a time, nearest-first (the visible spread, then
 * outwards, a little further ahead than behind), and the cache is bounded:
 * pages far from the reader are released again. Work pauses while a page is
 * turning and yields to the browser between pages, so rendering never competes
 * with the animation. Framework-free so it can be unit-tested.
 */

export interface PageCacheOptions {
  count: number;
  /** Rasterise page `index` and resolve with an object URL. */
  render: (index: number) => Promise<string>;
  /** A page's image arrived (`url`), or it was released or failed (`undefined`). */
  onChange?: (index: number, url: string | undefined) => void;
  /** Max pages kept at once. */
  capacity?: number;
  /** Pages to prepare behind the reading position. */
  behind?: number;
  /** Pages to prepare ahead of the reading position. */
  ahead?: number;
  /** Scheduling hook between renders (tests pass a synchronous one). */
  schedule?: (run: () => void) => void;
  /** Release an object URL (tests pass a spy). */
  revoke?: (url: string) => void;
}

const idle = (run: () => void) => {
  const w = typeof window === 'undefined' ? undefined : window;
  if (w?.requestIdleCallback) w.requestIdleCallback(run, { timeout: 120 });
  else setTimeout(run, 16);
};

export class PageCache {
  private readonly opts: Required<Omit<PageCacheOptions, 'onChange'>> &
    Pick<PageCacheOptions, 'onChange'>;
  private readonly urls = new Map<number, string>();
  private readonly failed = new Set<number>();
  private readonly wanted: number[] = [];
  private first = 0;
  private last = 0;
  private busy = false;
  private inFlight = false;
  private destroyed = false;
  private pumpQueued = false;

  constructor(opts: PageCacheOptions) {
    this.opts = {
      capacity: 24,
      behind: 4,
      ahead: 8,
      schedule: idle,
      revoke: (url) => URL.revokeObjectURL(url),
      ...opts,
    };
  }

  get(index: number): string | undefined {
    return this.urls.get(index);
  }

  /** True once `index` is rendered or has permanently failed. */
  isSettled(index: number): boolean {
    return this.urls.has(index) || this.failed.has(index);
  }

  get size(): number {
    return this.urls.size;
  }

  /** Pages the current reading position needs (visible spread ± prefetch window). */
  window(): number[] {
    const { count, behind, ahead } = this.opts;
    const out: number[] = [];
    const push = (i: number) => {
      if (i >= 0 && i < count && !out.includes(i)) out.push(i);
    };
    for (let i = this.first; i <= this.last; i++) push(i);
    for (let step = 1; step <= Math.max(ahead, behind); step++) {
      if (step <= ahead) push(this.last + step);
      if (step <= behind) push(this.first - step);
    }
    return out;
  }

  /** Every page of the current window is rendered (or failed). */
  get windowSettled(): boolean {
    return this.window().every((i) => this.isSettled(i));
  }

  /** Move the reading position to the visible range [first, last]. */
  focus(first: number, last = first) {
    this.first = first;
    this.last = last;
    this.evict();
    this.pump();
  }

  /** Ask for one page now (zoom, thumbnail jump), ahead of the window. */
  want(index: number) {
    if (index < 0 || index >= this.opts.count || this.isSettled(index)) return;
    this.wanted.push(index);
    this.pump();
  }

  /** Pause while the page turns; resume afterwards. */
  setBusy(busy: boolean) {
    this.busy = busy;
    if (!busy) this.pump();
  }

  destroy() {
    this.destroyed = true;
    for (const url of this.urls.values()) this.opts.revoke(url);
    this.urls.clear();
  }

  /** The next page to render (explicit requests first, newest first), without consuming it. */
  private peek(): number | undefined {
    for (let k = this.wanted.length - 1; k >= 0; k--) {
      const i = this.wanted[k] as number;
      if (!this.isSettled(i)) return i;
    }
    return this.window().find((i) => !this.isSettled(i));
  }

  /** Take the next page, dropping requests that are already settled. */
  private take(): number | undefined {
    const target = this.peek();
    const at = target === undefined ? -1 : this.wanted.lastIndexOf(target);
    if (at >= 0) this.wanted.splice(at, 1);
    for (let k = this.wanted.length - 1; k >= 0; k--) {
      if (this.isSettled(this.wanted[k] as number)) this.wanted.splice(k, 1);
    }
    return target;
  }

  private pump() {
    if (this.destroyed || this.busy || this.inFlight || this.pumpQueued) return;
    if (this.peek() === undefined) return;
    this.pumpQueued = true;
    this.opts.schedule(() => {
      this.pumpQueued = false;
      if (this.destroyed || this.busy || this.inFlight) return;
      const target = this.take();
      if (target === undefined) return;
      this.inFlight = true;
      this.opts
        .render(target)
        .then((url) => {
          if (this.destroyed) {
            this.opts.revoke(url);
            return;
          }
          this.urls.set(target, url);
          this.opts.onChange?.(target, url);
          this.evict();
        })
        .catch(() => {
          // A page that can't be rendered stays blank; don't retry it forever.
          this.failed.add(target);
          this.opts.onChange?.(target, undefined);
        })
        .finally(() => {
          this.inFlight = false;
          this.pump();
        });
    });
  }

  /** Drop the pages furthest from the reading position once over capacity. */
  private evict() {
    const keep = new Set(this.window());
    const centre = (this.first + this.last) / 2;
    while (this.urls.size > this.opts.capacity) {
      let far = -1;
      let farDistance = -1;
      for (const i of this.urls.keys()) {
        if (keep.has(i)) continue;
        const distance = Math.abs(i - centre);
        if (distance > farDistance) {
          far = i;
          farDistance = distance;
        }
      }
      if (far < 0) return; // everything left is in the window
      const url = this.urls.get(far) as string;
      this.urls.delete(far);
      this.opts.revoke(url);
      this.opts.onChange?.(far, undefined);
    }
  }
}
