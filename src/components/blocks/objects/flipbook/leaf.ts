/**
 * Leaf: the flipbook page-turn engine. No dependencies, no React.
 *
 * Each turn is a two-faced sheet that rotates in 3D around the spine
 * (CSS transforms + backface-visibility) with shading driven by the angle.
 * Landscape shows spreads ([cover], [1,2], [3,4] … [back cover]); portrait
 * shows one page and turns it like a notepad leaf. Drags follow the pointer
 * and settle on velocity; clicks, keys and taps run the same tween.
 * Right-to-left books mirror the whole book in CSS (`.lf-rtl`) and invert drags.
 */

export interface LeafOptions {
  count: number;
  getSrc: (index: number) => string | undefined;
  onChange?: (index: number) => void;
  /** A turn started towards the reading position `targetIndex`. */
  onBegin?: (targetIndex: number, dir: 1 | -1) => void;
  /** A turn finished (`completed`) or snapped back. */
  onSettle?: (completed: boolean) => void;
  /** Full turn duration in ms; <= 0 settles synchronously (tests, reduced motion). */
  duration?: number;
  rtl?: boolean;
}

export interface LeafLayout {
  pageW: number;
  pageH: number;
  portrait: boolean;
}

type PageRef = number | null;

interface Turn {
  dir: 1 | -1;
  p: number;
  to: number;
  origin: 'left' | 'right';
  under: HTMLElement;
  land: HTMLElement | null;
  frontShade: HTMLElement;
  backShade: HTMLElement;
}

interface Drag {
  id: number;
  x0: number;
  y0: number;
  active: boolean;
  dir: 1 | -1;
  samples: { t: number; p: number }[];
}

const PAGE_HTML =
  '<div class="fb-page-skel"></div><img alt="" draggable="false" decoding="async"><span class="fb-gutter"></span><span class="lf-shade"></span>';

export const easeInOutCubic = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
export const easeOutCubic = (k: number) => 1 - (1 - k) ** 3;

export class Leaf {
  readonly count: number;
  portrait = false;
  pos = 0;
  turn: Turn | null = null;

  private readonly host: HTMLElement;
  private readonly opts: LeafOptions;
  private readonly duration: number;
  private readonly spreads: [PageRef, PageRef][];
  private readonly L: HTMLElement;
  private readonly R: HTMLElement;
  private readonly sheet: HTMLElement;
  private readonly front: HTMLElement;
  private readonly back: HTMLElement;
  private pageW = 0;
  private raf = 0;
  private drag: Drag | null = null;

  constructor(host: HTMLElement, opts: LeafOptions) {
    this.host = host;
    this.opts = opts;
    this.count = opts.count;
    this.duration = opts.duration ?? 760;
    host.classList.add('lf');
    host.classList.toggle('lf-rtl', !!opts.rtl);
    host.innerHTML =
      '<div class="lf-slot fb-page lf-l"></div><div class="lf-slot fb-page lf-r"></div>' +
      '<div class="lf-leaf" hidden><div class="lf-face fb-page lf-front"></div><div class="lf-face fb-page lf-back"></div></div>';
    const q = (sel: string) => host.querySelector(sel) as HTMLElement;
    this.L = q('.lf-l');
    this.R = q('.lf-r');
    this.sheet = q('.lf-leaf');
    this.front = q('.lf-front');
    this.back = q('.lf-back');
    for (const el of [this.L, this.R, this.front, this.back]) {
      el.innerHTML = PAGE_HTML;
      const img = el.querySelector('img') as HTMLImageElement;
      img.addEventListener('load', () => el.classList.add('is-loaded'));
    }
    this.spreads = [[null, 0]];
    for (let i = 1; i < this.count; i += 2)
      this.spreads.push([i, i + 1 < this.count ? i + 1 : null]);
    host.addEventListener('pointerdown', this.onDown);
  }

  get index(): number {
    if (this.portrait) return this.pos;
    const [a, b] = this.spreads[this.pos] ?? [null, 0];
    return a ?? b ?? 0;
  }

  private get last() {
    return this.portrait ? this.count - 1 : this.spreads.length - 1;
  }

  private spreadOf(i: number) {
    return i === 0 ? 0 : Math.floor((i + 1) / 2);
  }

  private isHard(i: number) {
    return i === 0 || (i === this.count - 1 && this.count % 2 === 0);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.unlisten();
    this.host.removeEventListener('pointerdown', this.onDown);
    this.host.classList.remove('lf', 'lf-rtl', 'is-portrait', 'is-turning', 'is-dragging');
    this.host.replaceChildren();
  }

  layout({ pageW, pageH, portrait }: LeafLayout, index = this.index) {
    this.finishNow();
    this.pageW = pageW;
    this.host.style.setProperty('--pw', `${pageW}px`);
    this.host.style.width = `${portrait ? pageW : pageW * 2}px`;
    this.host.style.height = `${pageH}px`;
    this.host.classList.toggle('is-portrait', portrait);
    this.portrait = portrait;
    this.pos = portrait ? index : this.spreadOf(index);
    this.paint();
  }

  /** Re-fill every element currently showing page `i` (call when its image is ready). */
  refresh(i: number) {
    for (const el of this.host.querySelectorAll<HTMLElement>(`.fb-page[data-page="${i}"]`)) {
      this.fill(el, i, (el.dataset.side as 'left' | 'right' | undefined) || undefined);
    }
  }

  flip(dir: 1 | -1): boolean {
    this.finishNow();
    if (!this.begin(dir)) return false;
    this.tween(1, this.duration, easeInOutCubic);
    return true;
  }

  /** One step animates; anything further cuts with a short fade. */
  go(i: number, animate = true) {
    this.finishNow();
    const to = this.portrait ? i : this.spreadOf(i);
    if (to === this.pos) return;
    if (animate && Math.abs(to - this.pos) === 1) {
      this.flip(to > this.pos ? 1 : -1);
      return;
    }
    this.pos = to;
    this.host.animate?.([{ opacity: 0.35 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' });
    this.paint();
    this.opts.onChange?.(this.index);
  }

  finishNow() {
    if (!this.turn) return;
    cancelAnimationFrame(this.raf);
    this.apply(1);
    this.settle(true);
  }

  private fill(el: HTMLElement, i: PageRef, side?: 'left' | 'right') {
    el.dataset.side = side ?? '';
    el.classList.toggle('is-empty', i == null && el.classList.contains('lf-slot'));
    el.classList.toggle('is-blank', i == null);
    const img = el.querySelector('img') as HTMLImageElement;
    if (i == null) {
      delete el.dataset.page;
      img.removeAttribute('src');
      el.classList.remove('is-loaded');
      return;
    }
    el.dataset.page = String(i);
    el.dataset.density = this.isHard(i) ? 'hard' : '';
    img.alt = `${i + 1} / ${this.count}`;
    const url = this.opts.getSrc(i);
    if (!url) {
      img.removeAttribute('src');
      el.classList.remove('is-loaded');
    } else if (img.getAttribute('src') !== url) {
      img.src = url;
    }
  }

  private paint() {
    this.sheet.hidden = true;
    this.host.classList.remove('is-turning');
    if (this.portrait) {
      this.fill(this.L, this.pos);
      this.fill(this.R, null);
    } else {
      const [a, b] = this.spreads[this.pos] ?? [null, null];
      this.fill(this.L, a, 'left');
      this.fill(this.R, b, 'right');
    }
    for (const el of [this.L, this.R])
      (el.querySelector('.lf-shade') as HTMLElement).style.opacity = '0';
  }

  private begin(dir: 1 | -1): boolean {
    const to = this.pos + dir;
    if (to < 0 || to > this.last) return false;
    let origin: 'left' | 'right' = 'left';
    let under: HTMLElement;
    let land: HTMLElement | null = null;
    if (this.portrait) {
      this.fill(this.front, dir > 0 ? this.pos : to);
      this.fill(this.back, null);
      this.fill(this.L, dir > 0 ? to : this.pos);
      under = this.L;
      this.sheet.style.left = '0px';
    } else {
      const cur = this.spreads[this.pos] ?? [null, null];
      const nxt = this.spreads[to] ?? [null, null];
      if (dir > 0) {
        this.fill(this.front, cur[1], 'right');
        this.fill(this.back, nxt[0], 'left');
        this.fill(this.L, cur[0], 'left');
        this.fill(this.R, nxt[1], 'right');
        under = this.R;
        land = this.L;
        this.sheet.style.left = 'var(--pw)';
      } else {
        origin = 'right';
        this.fill(this.front, cur[0], 'left');
        this.fill(this.back, nxt[1], 'right');
        this.fill(this.L, nxt[0], 'left');
        this.fill(this.R, cur[1], 'right');
        under = this.L;
        land = this.R;
        this.sheet.style.left = '0px';
      }
    }
    this.sheet.style.transformOrigin = `${origin} center`;
    const away = origin === 'left' ? 'to right' : 'to left';
    const toward = origin === 'left' ? 'to left' : 'to right';
    const frontShade = this.front.querySelector('.lf-shade') as HTMLElement;
    const backShade = this.back.querySelector('.lf-shade') as HTMLElement;
    frontShade.style.background = `linear-gradient(${away}, rgba(0,0,0,.55), rgba(0,0,0,.12) 45%, rgba(0,0,0,0))`;
    backShade.style.background = `linear-gradient(${toward}, rgba(0,0,0,.5), rgba(0,0,0,.1) 45%, rgba(0,0,0,0))`;
    this.sheet.hidden = false;
    this.host.classList.add('is-turning');
    this.turn = { dir, p: 0, to, origin, under, land, frontShade, backShade };
    this.apply(0);
    const [a, b] = this.portrait ? [to, to] : (this.spreads[to] ?? [null, null]);
    this.opts.onBegin?.(a ?? b ?? 0, dir);
    return true;
  }

  /** Draw the active turn at progress p (0 flat at start, 1 landed). */
  private apply(p: number) {
    const t = this.turn;
    if (!t) return;
    t.p = p;
    const q = this.portrait && t.dir < 0 ? 1 - p : p;
    const deg = 180 * q;
    const rad = (deg * Math.PI) / 180;
    const s = Math.sin(rad);
    const lift = Math.min(1, deg / 14);
    this.sheet.style.transform = `rotateY(${(t.origin === 'left' ? -1 : 1) * deg}deg)`;
    t.frontShade.style.opacity = String(deg < 90 ? (0.15 + 0.6 * (1 - Math.cos(rad))) * lift : 0);
    t.backShade.style.opacity = String(deg >= 90 ? 0.85 * s : 0);
    if (this.portrait) {
      this.sheet.style.opacity = String(q < 0.5 ? 1 : Math.max(0, 1 - (q - 0.5) / 0.32));
      const shade = this.L.querySelector('.lf-shade') as HTMLElement;
      shade.style.background = 'linear-gradient(to right, rgba(0,0,0,.45), rgba(0,0,0,0) 60%)';
      shade.style.opacity = String(0.5 * (1 - q) * lift);
      return;
    }
    this.sheet.style.opacity = '1';
    const under = t.under.querySelector('.lf-shade') as HTMLElement;
    under.style.background = `linear-gradient(${t.origin === 'left' ? 'to right' : 'to left'}, rgba(0,0,0,.5), rgba(0,0,0,.06) 55%, rgba(0,0,0,0))`;
    under.style.opacity = String((1 - q) * lift);
    if (t.land) {
      const land = t.land.querySelector('.lf-shade') as HTMLElement;
      land.style.background = `linear-gradient(${t.origin === 'left' ? 'to left' : 'to right'}, rgba(0,0,0,.45), rgba(0,0,0,0) 70%)`;
      land.style.opacity = String(deg > 90 ? 0.6 * s : 0);
    }
  }

  private tween(target: 0 | 1, ms: number, ease: (k: number) => number) {
    cancelAnimationFrame(this.raf);
    if (ms <= 0) {
      this.apply(target);
      this.settle(target === 1);
      return;
    }
    const from = this.turn?.p ?? 0;
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      this.apply(from + (target - from) * ease(k));
      if (k < 1) this.raf = requestAnimationFrame(tick);
      else this.settle(target === 1);
    };
    this.raf = requestAnimationFrame(tick);
  }

  private settle(done: boolean) {
    const t = this.turn;
    this.turn = null;
    if (done && t) this.pos = t.to;
    this.paint();
    this.opts.onSettle?.(done);
    if (done) this.opts.onChange?.(this.index);
  }

  private readonly onDown = (e: PointerEvent) => {
    if (e.button !== 0 || this.turn) return;
    this.drag = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      active: false,
      dir: 1,
      samples: [],
    };
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('pointercancel', this.onUp);
  };

  private readonly onMove = (e: PointerEvent) => {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    const dx = (e.clientX - d.x0) * (this.opts.rtl ? -1 : 1);
    const dy = e.clientY - d.y0;
    if (!d.active) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      const dir: 1 | -1 = dx < 0 ? 1 : -1;
      if (!this.begin(dir)) {
        this.drag = null;
        this.unlisten();
        return;
      }
      d.active = true;
      d.dir = dir;
      this.host.classList.add('is-dragging');
      try {
        this.host.setPointerCapture?.(e.pointerId);
      } catch {
        // Pointer may already be released (synthetic events in tests).
      }
    }
    const span = this.portrait ? this.pageW * 0.85 : this.pageW * 1.7;
    const p = Math.max(0, Math.min(1, (-dx * d.dir) / span));
    d.samples.push({ t: e.timeStamp, p });
    if (d.samples.length > 6) d.samples.shift();
    this.apply(p);
  };

  private readonly onUp = (e: PointerEvent) => {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    this.drag = null;
    this.unlisten();
    if (!d.active || !this.turn) return;
    this.host.classList.remove('is-dragging');
    const first = d.samples[0];
    const last = d.samples[d.samples.length - 1];
    const v = first && last && last.t > first.t ? (last.p - first.p) / (last.t - first.t) : 0;
    const p = this.turn.p;
    const complete = e.type !== 'pointercancel' && (v > 0.0012 || (p > 0.42 && v > -0.0012));
    const rest = complete ? 1 - p : p;
    this.tween(complete ? 1 : 0, Math.max(160, this.duration * 0.75 * rest), easeOutCubic);
  };

  private unlisten() {
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('pointercancel', this.onUp);
  }
}
