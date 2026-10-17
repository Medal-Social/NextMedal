'use client';

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  GalleryThumbnails,
  Maximize,
  Minimize,
  Pointer,
  X,
  ZoomIn,
} from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils/cn';
import { computeBookLayout, coverShift, visibleRange } from './layout';
import { Leaf } from './leaf';
import { PageCache } from './page-cache';
import { openPdf, pageRatio, renderPage, targetPageHeight } from './pdf';
import type { FlipbookLabels, FlipbookProps } from './types';
import './flipbook.css';

export interface FlipbookViewerProps extends FlipbookProps {
  labels: FlipbookLabels;
  dir: 'ltr' | 'rtl';
  /** Test hook; defaults to the user's prefers-reduced-motion. */
  reducedMotion?: boolean;
}

type Status = 'loading' | 'ready' | 'error';

/** Two taps in the middle of the page within this window zoom (edge taps turn instantly). */
const DOUBLE_TAP_MS = 300;
/** Share of the book's width on each side where a tap turns the page immediately. */
const EDGE_TAP = 0.3;
/** How long reading-mode chrome stays up before stepping aside. */
const CHROME_IDLE_MS = 2600;
/** Thumbnail raster height (device px). */
const THUMB_HEIGHT = 220;

const fmt = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));

function fmtSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes > 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Cross-origin `download` attributes are ignored; Sanity's CDN forces a download with `?dl=`. */
export function downloadHref(src: string, filename?: string) {
  try {
    const url = new URL(src, 'http://local.invalid');
    if (url.hostname !== 'cdn.sanity.io') return src;
    url.searchParams.set('dl', filename ?? '');
    return url.toString();
  } catch {
    return src;
  }
}

/** Thumbnail grouping: the cover stands alone, then left/right pairs. */
function sideOf(i: number) {
  if (i === 0) return 'cover';
  return i % 2 ? 'left' : 'right';
}

export function FlipbookViewer({
  src,
  title,
  filename,
  size,
  startPage = 1,
  poweredBy = true,
  download = true,
  theme,
  className,
  onPageChange,
  labels,
  dir,
  reducedMotion,
}: FlipbookViewerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const zoomScrollRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<Leaf | null>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const cacheRef = useRef<PageCache | null>(null);
  const thumbsRef = useRef<PageCache | null>(null);
  const thumbsWantedRef = useRef(false);
  const thumbsOpenRef = useRef(false);
  const layoutKeyRef = useRef('');
  const onPageChangeRef = useRef(onPageChange);
  onPageChangeRef.current = onPageChange;

  const [status, setStatus] = useState<Status>('loading');
  const [count, setCount] = useState(0);
  // Bumped (at most once a frame) whenever a page or thumbnail image arrives or is released.
  const [, setTick] = useState(0);
  const [index, setIndex] = useState(0);
  const [portrait, setPortrait] = useState(false);
  const [ratio, setRatio] = useState(210 / 297);
  const [thumbsOpen, setThumbsOpen] = useState(false);
  thumbsOpenRef.current = thumbsOpen;
  const [zoom, setZoom] = useState<{ page: number; url: string; width: number } | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [hint, setHint] = useState(false);
  const [peek, setPeek] = useState<number | null>(null);
  const [scrub, setScrub] = useState<number | null>(null);
  const [chromeHidden, setChromeHidden] = useState(false);
  const interactedRef = useRef(false);

  const rtl = dir === 'rtl';
  const label = title || filename || 'PDF';
  const [first, last] = visibleRange(index, Math.max(count, 1), portrait);
  const prefersReduced = useMemo(
    () =>
      reducedMotion ??
      (typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches),
    [reducedMotion]
  );

  const markInteracted = useCallback(() => {
    interactedRef.current = true;
    setHint(false);
  }, []);

  /* ── layout + shift */
  const applyShift = useCallback(
    (at: number, isPortrait: boolean, total: number, pageW: number) => {
      const shift = coverShift(at, total, isPortrait, rtl);
      const visible = shift === 0 && !isPortrait ? 2 : 1;
      if (wrapRef.current) wrapRef.current.style.transform = `translateX(${(shift * pageW) / 2}px)`;
      rootRef.current?.style.setProperty('--fb-floor-w', `${pageW * visible * 1.05}px`);
    },
    [rtl]
  );

  const relayout = useCallback(
    (at?: number) => {
      const root = rootRef.current;
      const stage = stageRef.current;
      const leaf = leafRef.current;
      if (!root || !stage || !leaf) return;
      stage.style.height = '';
      const l = computeBookLayout({
        stageW: stage.clientWidth,
        stageH: stage.clientHeight,
        containerW: root.clientWidth,
        ratio,
      });
      if (l.fittedStageH != null && !root.classList.contains('is-fullscreen'))
        stage.style.height = `${l.fittedStageH}px`;
      layoutKeyRef.current = `${l.portrait}:${l.pageW}`;
      leaf.layout(l, at ?? leaf.index);
      setPortrait(l.portrait);
      setIndex(leaf.index);
      applyShift(leaf.index, l.portrait, leaf.count, l.pageW);
      root.style.setProperty('--fb-page-w', `${l.pageW}px`);
    },
    [ratio, applyShift]
  );

  // The sharp zoom render is owned here (book images are owned by the load effect).
  const sharpRef = useRef<string | null>(null);
  const zoomIdRef = useRef(0);
  const releaseSharp = useCallback(() => {
    if (sharpRef.current) URL.revokeObjectURL(sharpRef.current);
    sharpRef.current = null;
  }, []);

  /* ── load the PDF; pages are prepared on demand around the reading position */
  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    const bump = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setTick((t) => t + 1);
      });
    };
    setStatus('loading');
    zoomIdRef.current++;
    releaseSharp();
    setZoom(null);
    const pdfHandle = openPdf(src);
    (async () => {
      try {
        const doc = await pdfHandle.promise;
        if (cancelled) return;
        docRef.current = doc;
        const total = doc.numPages;
        const r = await pageRatio(doc);
        if (cancelled) return;
        setRatio(r);
        setCount(total);
        const start = Math.min(Math.max(0, startPage - 1), total - 1);
        const height = targetPageHeight();
        const [a, b] = visibleRange(start, total, false);
        // Each document opens once, at its own start page; later cache events never move the reader.
        let opened = false;
        const cache = new PageCache({
          count: total,
          render: (i, signal) => renderPage(doc, i, { height }, signal),
          onChange: (i) => {
            leafRef.current?.refresh(i);
            bump();
            if (opened || cancelled || !cache.isSettled(a) || !cache.isSettled(b)) return;
            opened = true;
            if (!cache.get(a) && !cache.get(b)) {
              setStatus('error');
              return;
            }
            setIndex(start);
            setStatus('ready');
          },
        });
        cacheRef.current = cache;
        // Thumbnails near the reading position, plus whatever the drawer actually shows.
        const thumbs = new PageCache({
          count: total,
          render: (i, signal) => renderPage(doc, i, { height: THUMB_HEIGHT }, signal),
          onChange: bump,
          capacity: 72,
          behind: 8,
          ahead: 16,
          keepWanted: 40,
        });
        thumbsRef.current = thumbs;
        // Started on demand (drawer / scrub preview); a drawer left open counts as asking.
        thumbsWantedRef.current = thumbsOpenRef.current;
        if (thumbsWantedRef.current) thumbs.focus(a, b);
        else thumbs.setBusy(true);
        cache.focus(a, b);
      } catch {
        // Damaged/encrypted PDFs land in the error state; download stays available.
        if (cancelled) return;
        pdfHandle.cancel();
        docRef.current = null;
        setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      releaseSharp();
      cacheRef.current?.destroy();
      thumbsRef.current?.destroy();
      cacheRef.current = null;
      thumbsRef.current = null;
      pdfHandle.cancel();
      docRef.current = null;
    };
  }, [src, startPage, releaseSharp]);

  /* ── create the engine once the first pages exist */
  // The engine is created once per document; index/relayout/shift changes must not rebuild it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: deliberate one-time construction per document
  useEffect(() => {
    if (status !== 'ready' || !hostRef.current || leafRef.current) return;
    const host = hostRef.current;
    let lastEmitted = -1;
    const leaf = new Leaf(host, {
      count,
      rtl,
      duration: prefersReduced ? 0 : 760,
      getSrc: (i) => cacheRef.current?.get(i),
      pageAlt: (i) => `${label} — ${fmt(labels.pageOf, { page: i + 1, total: count })}`,
      onBegin: (target) => {
        rootRef.current?.setAttribute('data-flip', 'flipping');
        // Rendering pauses while a page turns, so it never competes with the animation.
        cacheRef.current?.setBusy(true);
        thumbsRef.current?.setBusy(true);
        const pageW = Number.parseFloat(host.style.getPropertyValue('--pw')) || 0;
        applyShift(target, leaf.portrait, count, pageW);
        markInteracted();
      },
      onSettle: () => {
        rootRef.current?.setAttribute('data-flip', 'read');
        cacheRef.current?.setBusy(false);
        if (thumbsWantedRef.current) thumbsRef.current?.setBusy(false);
      },
      onChange: (i) => {
        setIndex(i);
        const pageW = Number.parseFloat(host.style.getPropertyValue('--pw')) || 0;
        applyShift(i, leaf.portrait, count, pageW);
        const [a, b] = visibleRange(i, count, leaf.portrait);
        if (a !== lastEmitted) {
          lastEmitted = a;
          onPageChangeRef.current?.({ page: a + 1, spread: a === b ? [a + 1] : [a + 1, b + 1] });
        }
      },
    });
    leafRef.current = leaf;
    relayout(index);
    const timer = window.setTimeout(() => !interactedRef.current && setHint(true), 700);
    const hide = window.setTimeout(() => setHint(false), 4900);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(hide);
      leaf.destroy();
      leafRef.current = null;
      // Destroyed mid-turn: onSettle never runs, so un-pause the caches here.
      rootRef.current?.setAttribute('data-flip', 'read');
      cacheRef.current?.setBusy(false);
      if (thumbsWantedRef.current) thumbsRef.current?.setBusy(false);
    };
  }, [status, count, rtl, prefersReduced]);

  /* ── resize */
  useEffect(() => {
    const stage = stageRef.current;
    const root = rootRef.current;
    if (!stage || !root || typeof ResizeObserver === 'undefined') return;
    let timer = 0;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!leafRef.current) return;
        const l = computeBookLayout({
          stageW: stage.clientWidth,
          stageH: stage.clientHeight,
          containerW: root.clientWidth,
          ratio,
        });
        if (`${l.portrait}:${l.pageW}` !== layoutKeyRef.current) relayout();
      }, 80);
    });
    observer.observe(stage);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [ratio, relayout]);

  /* ── actions */
  const next = useCallback(() => leafRef.current?.flip(1), []);
  const prev = useCallback(() => leafRef.current?.flip(-1), []);
  const closeZoom = useCallback(() => {
    zoomIdRef.current++;
    releaseSharp();
    setZoom(null);
  }, [releaseSharp]);

  const jump = useCallback(
    (i: number) => {
      closeZoom();
      leafRef.current?.go(Math.max(0, Math.min(count - 1, i)));
    },
    [count, closeZoom]
  );

  const openZoom = useCallback(
    async (page: number, fx = 0.5, fy = 0) => {
      const stage = stageRef.current;
      const url = cacheRef.current?.get(page);
      if (!stage || !url) return;
      const width = Math.round(stage.clientWidth * (portrait ? 1.8 : 1.25));
      const zoomId = ++zoomIdRef.current;
      releaseSharp();
      setZoom({ page, url, width });
      markInteracted();
      requestAnimationFrame(() => {
        const scroller = zoomScrollRef.current;
        if (!scroller) return;
        const h = width / ratio;
        scroller.scrollTo?.({
          left: fx * width + 24 - scroller.clientWidth / 2,
          top: fy * h + 24 - scroller.clientHeight / 2,
        });
      });
      const doc = docRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      if (!doc || (width * dpr) / ratio <= targetPageHeight() * 1.1) return;
      let sharp: string;
      try {
        sharp = await renderPage(doc, page, { width: width * dpr });
      } catch {
        return; // Keep showing the book-resolution image.
      }
      if (zoomId !== zoomIdRef.current || docRef.current !== doc) {
        URL.revokeObjectURL(sharp);
        return;
      }
      sharpRef.current = sharp;
      setZoom((z) => (z && z.page === page ? { ...z, url: sharp } : z));
    },
    [portrait, ratio, markInteracted, releaseSharp]
  );

  // Double-click / double-tap on the zoomed page closes it (the close button is the accessible path).
  useEffect(() => {
    const scroller = zoomScrollRef.current;
    if (!scroller) return;
    let lastTouch = 0;
    const onDouble = () => closeZoom();
    const onTouchUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      const now = Date.now();
      if (now - lastTouch < 300) closeZoom();
      lastTouch = now;
    };
    scroller.addEventListener('dblclick', onDouble);
    scroller.addEventListener('pointerup', onTouchUp);
    return () => {
      scroller.removeEventListener('dblclick', onDouble);
      scroller.removeEventListener('pointerup', onTouchUp);
    };
  }, [closeZoom]);

  const toggleFullscreen = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    if (document.fullscreenElement === root) void document.exitFullscreen();
    else if (fullscreen) setFullscreen(false);
    else if (root.requestFullscreen) root.requestFullscreen().catch(() => setFullscreen(true));
    else setFullscreen(true); // iPhone Safari: immersive overlay fallback
  }, [fullscreen]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Re-measure when fullscreen toggles (the stage height changes with it).
  // biome-ignore lint/correctness/useExhaustiveDependencies: fullscreen is the trigger, not a value read inside
  useEffect(() => {
    if (stageRef.current) stageRef.current.style.height = '';
    relayout();
  }, [fullscreen, relayout]);

  /* ── taps: single = turn (side), double = zoom; drags belong to Leaf */
  const tapRef = useRef<{ t: number; x: number; y: number; timer: number }>({
    t: 0,
    x: 0,
    y: 0,
    timer: 0,
  });
  const downRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const onBookPointerDown = (e: React.PointerEvent) => {
    // Only the primary button taps/turns (a right-click opens the context menu, like Leaf's drag).
    downRef.current = e.button === 0 ? { x: e.clientX, y: e.clientY, t: Date.now() } : null;
  };
  const onBookPointerUp = (e: React.PointerEvent) => {
    const down = downRef.current;
    downRef.current = null;
    if (
      !down ||
      // Below Leaf's 8px drag threshold, so a short drag can never also count as a tap.
      Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6 ||
      Date.now() - down.t > 450
    )
      return;
    const r = hostRef.current?.getBoundingClientRect();
    if (!r) return;
    const fx = (e.clientX - r.left) / r.width;
    const turn = () => {
      (fx > 0.5 !== rtl ? next : prev)();
      markInteracted();
    };
    // Edges turn at once, like a book app: no waiting to see whether a second tap follows.
    // On a spread the zone is the outer part of each page, so most of a page still zooms.
    const edge = portrait ? EDGE_TAP : EDGE_TAP / 2;
    if (fx < edge || fx > 1 - edge) {
      window.clearTimeout(tapRef.current.timer);
      tapRef.current.t = 0;
      turn();
      return;
    }
    const tap = tapRef.current;
    const now = Date.now();
    if (now - tap.t < DOUBLE_TAP_MS && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 40) {
      window.clearTimeout(tap.timer);
      tap.t = 0;
      const hit = pageAt(e.clientX, e.clientY);
      if (hit) void openZoom(hit.page, hit.fx, hit.fy);
      return;
    }
    window.clearTimeout(tap.timer);
    tapRef.current = {
      t: now,
      x: e.clientX,
      y: e.clientY,
      // A single tap in the middle shows/hides the reading-mode chrome; inline it turns the page.
      timer: window.setTimeout(
        () => (fullscreen ? setChromeHidden((h) => !h) : turn()),
        DOUBLE_TAP_MS
      ),
    };
  };
  const pageAt = (x: number, y: number) => {
    for (const el of hostRef.current?.querySelectorAll<HTMLElement>('.lf-slot:not(.is-empty)') ??
      []) {
      if (getComputedStyle(el).display === 'none') continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        const fx = (x - r.left) / r.width;
        return { page: Number(el.dataset.page), fx: rtl ? 1 - fx : fx, fy: (y - r.top) / r.height };
      }
    }
    return null;
  };

  /* ── reading mode: chrome floats over the page and steps aside after a moment */
  useEffect(() => {
    if (fullscreen) setChromeHidden(false);
  }, [fullscreen]);
  useEffect(() => {
    if (!fullscreen || chromeHidden || thumbsOpen || zoom) return;
    let timer = 0;
    const tryHide = () => {
      // Never hide the toolbar out from under keyboard focus; check again later instead.
      // (A mouse click leaves focus on the button too, but not :focus-visible.)
      const active = document.activeElement;
      const chrome = rootRef.current?.querySelectorAll('.fb-bar, .fb-foot') ?? [];
      if (active?.matches(':focus-visible') && [...chrome].some((el) => el.contains(active))) {
        timer = window.setTimeout(tryHide, CHROME_IDLE_MS);
        return;
      }
      setChromeHidden(true);
    };
    timer = window.setTimeout(tryHide, CHROME_IDLE_MS);
    return () => window.clearTimeout(timer);
  }, [fullscreen, chromeHidden, thumbsOpen, zoom]);

  const chromeOff = fullscreen && chromeHidden && !thumbsOpen && !zoom;
  // A real mouse moving brings the chrome back; the synthetic mouse events phones send after a tap don't.
  const lastMoveRef = useRef<{ x: number; y: number } | null>(null);
  const onRevealMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const last = lastMoveRef.current;
    lastMoveRef.current = { x: e.clientX, y: e.clientY };
    if (last && Math.hypot(e.clientX - last.x, e.clientY - last.y) > 4) setChromeHidden(false);
  };

  /* ── the cache follows the reading position */
  useEffect(() => {
    if (status === 'ready') cacheRef.current?.focus(first, last);
  }, [status, first, last]);

  /* ── thumbnails are prepared only once someone wants them (drawer or scrub preview) */
  const wantThumbs = useCallback(() => {
    thumbsWantedRef.current = true;
    thumbsRef.current?.setBusy(false);
  }, []);
  useEffect(() => {
    if (thumbsOpen) wantThumbs();
  }, [thumbsOpen, wantThumbs]);
  useEffect(() => {
    if (thumbsOpen || thumbsWantedRef.current) thumbsRef.current?.focus(first, last);
  }, [first, last, thumbsOpen]);
  useEffect(() => {
    if (peek == null) return;
    wantThumbs();
    thumbsRef.current?.want(peek);
  }, [peek, wantThumbs]);
  // Only thumbnails scrolled into view in the drawer are prepared (and kept while recent).
  useEffect(() => {
    const track = trackRef.current;
    if (!thumbsOpen || status !== 'ready' || !track || typeof IntersectionObserver === 'undefined')
      return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = Number((entry.target as HTMLElement).dataset.index);
          if (entry.isIntersecting) thumbsRef.current?.want(i);
        }
      },
      { root: track, rootMargin: '200px' }
    );
    for (const el of track.querySelectorAll('.fb-thumb')) io.observe(el);
    return () => io.disconnect();
  }, [thumbsOpen, status]);
  const thumbSrc = (i: number) => thumbsRef.current?.get(i) ?? cacheRef.current?.get(i);

  /* ── keyboard (scoped to the flipbook; global while fullscreen) */
  const onKey = useCallback(
    (e: KeyboardEvent | ReactKeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || status !== 'ready') return;
      setChromeHidden(false);
      const target = e.target as HTMLElement;
      if (target.closest?.('input:not([type=range]), textarea, select, [contenteditable]')) return;
      if (target.matches?.('input[type=range]') && /Arrow|Home|End|Page/.test(e.key)) return;
      if (zoom && /Arrow|Page|Home|End/.test(e.key)) return;
      const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
      const back = rtl ? 'ArrowRight' : 'ArrowLeft';
      const actions: Record<string, () => void> = {
        [forward]: next,
        PageDown: next,
        [back]: prev,
        PageUp: prev,
        Home: () => jump(0),
        End: () => jump(count - 1),
        f: toggleFullscreen,
        F: toggleFullscreen,
        t: () => setThumbsOpen((o) => !o),
        T: () => setThumbsOpen((o) => !o),
        z: () => (zoom ? closeZoom() : void openZoom(first)),
        Z: () => (zoom ? closeZoom() : void openZoom(first)),
        Escape: () => {
          if (zoom) closeZoom();
          else if (thumbsOpen) setThumbsOpen(false);
          else if (fullscreen && !document.fullscreenElement) setFullscreen(false);
        },
      };
      const action = actions[e.key];
      if (action) {
        e.preventDefault();
        action();
      }
    },
    [
      status,
      zoom,
      rtl,
      next,
      prev,
      jump,
      count,
      toggleFullscreen,
      closeZoom,
      openZoom,
      first,
      thumbsOpen,
      fullscreen,
    ]
  );

  useEffect(() => {
    if (!fullscreen) return;
    // Events from inside the flipbook already reach the root's onKeyDown.
    const handler = (e: KeyboardEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onKey(e);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [fullscreen, onKey]);

  /* ── thumbnails follow the reading position */
  useEffect(() => {
    if (!thumbsOpen) return;
    const el = trackRef.current?.children[first] as HTMLElement | undefined;
    const track = trackRef.current;
    if (el && track)
      track.scrollTo?.({
        left: el.offsetLeft - track.clientWidth / 2 + el.clientWidth,
        behavior: 'smooth',
      });
  }, [thumbsOpen, first]);

  const tokenStyle = useMemo(() => {
    const style: Record<string, string> = {};
    for (const [key, value] of Object.entries(theme ?? {})) if (value) style[`--fb-${key}`] = value;
    style['--fb-ratio'] = ratio.toFixed(4);
    if (zoom) style['--fb-zoom-w'] = `${zoom.width}px`;
    return style as CSSProperties;
  }, [theme, ratio, zoom]);
  const cache = cacheRef.current;
  const windowPages = cache?.window() ?? [];
  const settledInWindow = windowPages.filter((i) => cache?.isSettled(i)).length;
  const complete =
    status === 'ready' && windowPages.length > 0 && settledInWindow === windowPages.length;

  const counterText = first === last ? `${first + 1}` : `${first + 1}–${last + 1}`;
  const powered =
    poweredBy === true
      ? { label: 'Medal Social', href: 'https://www.medalsocial.com' }
      : poweredBy || null;
  const peekIndex = peek == null ? null : Math.max(0, Math.min(count - 1, peek));
  const atStart = first === 0;
  const atEnd = last >= count - 1;
  // Physical left/right controls: in right-to-left books the left side moves forward.
  const leftControl = rtl
    ? { action: next, label: labels.next, disabled: atEnd }
    : { action: prev, label: labels.previous, disabled: atStart };
  const rightControl = rtl
    ? { action: prev, label: labels.previous, disabled: atStart }
    : { action: next, label: labels.next, disabled: atEnd };

  return (
    // biome-ignore lint/a11y/useSemanticElements: a labelled region with keyboard shortcuts is the documented pattern
    <div
      ref={rootRef}
      className={cn(
        'fb',
        fullscreen && 'is-fullscreen',
        fullscreen && !document.fullscreenElement && 'is-immersive',
        thumbsOpen && 'thumbs-open',
        zoom && 'is-zoomed',
        chromeOff && 'chrome-hidden',
        className
      )}
      style={
        {
          ...tokenStyle,
          '--fb-load': windowPages.length
            ? `${(settledInWindow / windowPages.length) * 100}%`
            : '0%',
        } as CSSProperties
      }
      tabIndex={-1}
      role="region"
      aria-roledescription="flipbook"
      aria-label={label}
      data-state={status}
      data-complete={complete ? 'true' : 'false'}
      data-orientation={portrait ? 'portrait' : 'landscape'}
      dir="ltr"
      onKeyDown={onKey}
      onPointerMove={fullscreen && chromeHidden ? onRevealMove : undefined}
    >
      <div className="fb-bar" inert={chromeOff}>
        <div className="fb-doc">
          <span className="fb-doc-icon" aria-hidden="true">
            <BookOpen />
          </span>
          <div className="fb-doc-text">
            <strong className="fb-title" dir={dir}>
              {label}
            </strong>
            <span className="fb-meta">
              <i className="dot" />
              <span>
                PDF{count ? ` · ${fmt(labels.pages, { count })}` : ''}
                {size ? <span className="hide-sm"> · {fmtSize(size)}</span> : null}
              </span>
            </span>
          </div>
        </div>
        <div className="fb-tools">
          <button
            type="button"
            className="fb-icon-btn"
            aria-pressed={thumbsOpen}
            aria-label={labels.allPages}
            aria-keyshortcuts="T"
            onClick={() => setThumbsOpen((o) => !o)}
          >
            <GalleryThumbnails aria-hidden="true" />
            <span className="fb-tip">
              {labels.allPages} <kbd>T</kbd>
            </span>
          </button>
          <button
            type="button"
            className="fb-icon-btn"
            aria-pressed={!!zoom}
            aria-label={labels.zoom}
            aria-keyshortcuts="Z"
            onClick={() => (zoom ? closeZoom() : void openZoom(first))}
          >
            <ZoomIn aria-hidden="true" />
            <span className="fb-tip">
              {labels.zoom} <kbd>Z</kbd>
            </span>
          </button>
          {download && (
            <a
              className="fb-icon-btn"
              href={downloadHref(src, filename)}
              download={filename || true}
              aria-label={labels.download}
            >
              <Download aria-hidden="true" />
              <span className="fb-tip">{labels.download}</span>
            </a>
          )}
          <span className="fb-sep" />
          <button
            type="button"
            className="fb-icon-btn"
            aria-pressed={fullscreen}
            aria-label={labels.fullscreen}
            aria-keyshortcuts="F"
            onClick={toggleFullscreen}
          >
            {fullscreen ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
            <span className="fb-tip">
              {labels.fullscreen} <kbd>F</kbd>
            </span>
          </button>
        </div>
      </div>

      <div className="fb-stage" ref={stageRef}>
        <div className="fb-skeleton" aria-hidden={status === 'ready'}>
          <div className="fb-skel-book">
            <div className="fb-skel-page" />
            <div className="fb-skel-page" />
          </div>
          <div className="fb-skel-status">
            <span>
              <b>{labels.preparing}</b>{' '}
              <span className="fb-skel-count">
                {windowPages.length ? `${settledInWindow} / ${windowPages.length}` : ''}
              </span>
            </span>
            <div className="fb-skel-bar">
              <i />
            </div>
          </div>
          <div className="fb-skel-err" role={status === 'error' ? 'alert' : undefined}>
            <b>{labels.error}</b>
            <span>{labels.errorDetail}</span>
          </div>
        </div>
        <div className="fb-book-wrap" ref={wrapRef}>
          <div
            className="fb-book"
            ref={hostRef}
            onPointerDown={onBookPointerDown}
            onPointerUp={onBookPointerUp}
          />
          <div className="fb-floor" />
        </div>
        <button
          type="button"
          className="fb-nav fb-prev"
          aria-label={leftControl.label}
          disabled={leftControl.disabled}
          onClick={leftControl.action}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          type="button"
          className="fb-nav fb-next"
          aria-label={rightControl.label}
          disabled={rightControl.disabled}
          onClick={rightControl.action}
        >
          <ChevronRight aria-hidden="true" />
        </button>
        <button type="button" className="fb-read" onClick={toggleFullscreen}>
          <Maximize aria-hidden="true" />
          {labels.readFullscreen}
        </button>
        <div className={cn('fb-hint', hint && 'is-visible')} aria-hidden="true">
          <span className="keys-only">{labels.hintPointer}</span>
          <span className="touch">
            <Pointer size={15} /> {labels.hintTouch}
          </span>
        </div>
        <div className="fb-zoom" role="dialog" aria-label={labels.zoom} aria-hidden={!zoom}>
          <div className="fb-zoom-scroll" ref={zoomScrollRef}>
            {zoom && (
              // biome-ignore lint/performance/noImgElement: blob: page images from pdf.js can't go through next/image
              <img
                src={zoom.url}
                alt={fmt(labels.pageOf, { page: zoom.page + 1, total: count })}
                draggable={false}
              />
            )}
          </div>
          <div className="fb-zoom-bar">
            <span>{zoom ? fmt(labels.zoomHint, { page: zoom.page + 1 }) : ''}</span>
            <button
              type="button"
              className="fb-zoom-close"
              aria-label={labels.closeZoom}
              onClick={closeZoom}
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="fb-thumbs" role="dialog" aria-label={labels.allPages}>
          <div className="fb-thumbs-head">
            <span>
              <b>{labels.allPages}</b> · {fmt(labels.pages, { count })}
            </span>
            <button
              type="button"
              className="fb-thumbs-close"
              aria-label={labels.close}
              onClick={() => setThumbsOpen(false)}
            >
              <X size={14} />
            </button>
          </div>
          <div className="fb-thumbs-track" ref={trackRef}>
            {Array.from({ length: count }, (_, i) => (
              <button
                type="button"
                // biome-ignore lint/suspicious/noArrayIndexKey: the page number is the item's identity
                key={`page-${i + 1}`}
                className={cn('fb-thumb', thumbSrc(i) && 'is-loaded')}
                data-index={i}
                data-side={sideOf(i)}
                aria-label={`${labels.goToPage} ${i + 1}`}
                aria-current={i >= first && i <= last}
                onClick={() => {
                  jump(i);
                  if (portrait) setThumbsOpen(false);
                }}
              >
                <span className="fb-thumb-img">
                  {/* biome-ignore lint/performance/noImgElement: blob: page images from pdf.js can't go through next/image */}
                  {thumbSrc(i) && <img src={thumbSrc(i)} alt="" loading="lazy" />}
                </span>
                <span>{i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fb-foot" inert={chromeOff}>
        <button
          type="button"
          className="fb-step prev"
          aria-label={leftControl.label}
          disabled={leftControl.disabled}
          onClick={leftControl.action}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <div className="fb-counter" data-testid="fb-counter" aria-live="polite" aria-atomic="true">
          <span>{count ? counterText : '–'}</span>
          <span className="fb-counter-total"> / {count || '–'}</span>
        </div>
        <div className={cn('fb-scrub', peekIndex != null && 'is-peek')}>
          <input
            className="fb-range"
            type="range"
            min={1}
            max={Math.max(count, 1)}
            step={1}
            value={scrub ?? first + 1}
            aria-label={labels.goToPage}
            aria-valuetext={fmt(labels.pageOf, { page: scrub ?? counterText, total: count })}
            style={
              {
                '--p': `${count > 1 ? (((scrub ?? first + 1) - 1) / (count - 1)) * 100 : 0}%`,
              } as CSSProperties
            }
            onChange={(e) => {
              const value = Number(e.target.value);
              setScrub(value);
              setPeek(value - 1);
            }}
            onPointerUp={(e) => {
              jump(Number((e.target as HTMLInputElement).value) - 1);
              setScrub(null);
              setPeek(null);
            }}
            onKeyUp={(e) => {
              if (!/Arrow|Home|End|Page/.test(e.key)) return;
              jump(Number((e.target as HTMLInputElement).value) - 1);
              setScrub(null);
            }}
            onPointerMove={(e) => {
              if (e.pointerType !== 'mouse' || !count) return;
              const r = e.currentTarget.getBoundingClientRect();
              setPeek(Math.round(((e.clientX - r.left) / r.width) * (count - 1)));
            }}
            onPointerLeave={() => setPeek(null)}
            onPointerCancel={() => {
              setScrub(null);
              setPeek(null);
            }}
            onBlur={() => {
              setPeek(null);
              setScrub(null);
            }}
          />
          {peekIndex != null && (
            <div
              className="fb-scrub-tip"
              aria-hidden="true"
              style={
                {
                  '--x': `calc(${count > 1 ? (peekIndex / (count - 1)) * 100 : 0}% + ${9 - (count > 1 ? peekIndex / (count - 1) : 0) * 18}px)`,
                } as CSSProperties
              }
            >
              <div className="fb-thumb-img">
                {/* biome-ignore lint/performance/noImgElement: blob: page images from pdf.js can't go through next/image */}
                {thumbSrc(peekIndex) && <img src={thumbSrc(peekIndex)} alt="" />}
              </div>
              <span>{fmt(labels.page, { page: peekIndex + 1 })}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          className="fb-step next"
          aria-label={rightControl.label}
          disabled={rightControl.disabled}
          onClick={rightControl.action}
        >
          <ChevronRight aria-hidden="true" />
        </button>
        {powered && (
          <a className="fb-powered" href={powered.href} target="_blank" rel="noopener">
            <span className="fb-powered-mark" aria-hidden="true" />
            <span>
              {labels.poweredBy} <b>{powered.label}</b>
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
