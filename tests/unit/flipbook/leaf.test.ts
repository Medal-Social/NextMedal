import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Leaf } from '@/components/blocks/objects/flipbook/leaf';

function make(count = 12, extra: Partial<ConstructorParameters<typeof Leaf>[1]> = {}) {
  const host = document.createElement('div');
  document.body.append(host);
  const onChange = vi.fn();
  const leaf = new Leaf(host, {
    count,
    getSrc: (i) => `blob:page-${i}`,
    onChange,
    duration: 0,
    ...extra,
  });
  leaf.layout({ pageW: 300, pageH: 424, portrait: false }, 0);
  return { host, leaf, onChange };
}

const visiblePages = (host: HTMLElement) =>
  [...host.querySelectorAll<HTMLElement>('.lf-slot:not(.is-empty)')]
    .filter((el) => getComputedStyle(el).display !== 'none')
    .map((el) => Number(el.dataset.page));

function pointer(target: EventTarget, type: string, clientX: number, clientY = 200) {
  target.dispatchEvent(
    new PointerEvent(type, { clientX, clientY, button: 0, pointerId: 1, bubbles: true })
  );
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
});

describe('Leaf: spreads (landscape)', () => {
  it('starts on the cover alone', () => {
    const { host, leaf } = make();
    expect(leaf.index).toBe(0);
    expect(visiblePages(host)).toEqual([0]);
  });

  it('turns forward through spreads and stops at the back cover', () => {
    const { host, leaf, onChange } = make();
    leaf.flip(1);
    expect(leaf.index).toBe(1);
    expect(visiblePages(host)).toEqual([1, 2]);
    expect(onChange).toHaveBeenLastCalledWith(1);
    for (let k = 0; k < 10; k++) leaf.flip(1);
    expect(leaf.index).toBe(11);
    expect(visiblePages(host)).toEqual([11]);
    expect(leaf.flip(1)).toBe(false);
  });

  it('turns back and refuses to go before the cover', () => {
    const { leaf } = make();
    leaf.flip(1);
    leaf.flip(-1);
    expect(leaf.index).toBe(0);
    expect(leaf.flip(-1)).toBe(false);
  });

  it('jumps without animation to a far page', () => {
    const { host, leaf } = make();
    leaf.go(7);
    expect(leaf.index).toBe(7);
    expect(visiblePages(host)).toEqual([7, 8]);
  });

  it('marks covers as hard pages', () => {
    const { host } = make();
    expect(host.querySelector<HTMLElement>('.lf-r')?.dataset.density).toBe('hard');
  });
});

describe('Leaf: portrait', () => {
  it('shows one page and turns both ways', () => {
    const { host, leaf } = make();
    leaf.layout({ pageW: 300, pageH: 424, portrait: true });
    expect(visiblePages(host)).toEqual([0]);
    leaf.flip(1);
    leaf.flip(1);
    expect(visiblePages(host)).toEqual([2]);
    leaf.flip(-1);
    expect(visiblePages(host)).toEqual([1]);
  });

  it('keeps the reading position across orientation changes', () => {
    const { leaf } = make();
    leaf.go(5);
    leaf.layout({ pageW: 300, pageH: 424, portrait: true });
    expect(leaf.index).toBe(5);
    leaf.layout({ pageW: 300, pageH: 424, portrait: false });
    expect(leaf.index).toBe(5);
  });
});

describe('Leaf: dragging', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date'],
    });
  });

  it('completes a turn dragged past halfway', () => {
    const { host, leaf } = make(12, { duration: 400 });
    leaf.go(1, false);
    pointer(host, 'pointerdown', 580);
    pointer(window, 'pointermove', 560);
    pointer(window, 'pointermove', 200);
    expect(leaf.turn).not.toBeNull();
    pointer(window, 'pointerup', 200);
    vi.advanceTimersByTime(1000);
    expect(leaf.turn).toBeNull();
    expect(leaf.index).toBe(3);
  });

  it('snaps back from a short drag', () => {
    const { host, leaf } = make(12, { duration: 400 });
    leaf.go(1, false);
    pointer(host, 'pointerdown', 580);
    pointer(window, 'pointermove', 560);
    pointer(window, 'pointermove', 540);
    vi.advanceTimersByTime(300);
    pointer(window, 'pointerup', 540);
    vi.advanceTimersByTime(1000);
    expect(leaf.index).toBe(1);
  });

  it('ignores vertical drags so the page can scroll', () => {
    const { host, leaf } = make(12, { duration: 400 });
    pointer(host, 'pointerdown', 400, 100);
    host.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 402, clientY: 300, pointerId: 1, bubbles: true })
    );
    expect(leaf.turn).toBeNull();
  });

  it('reverses drag direction for right-to-left books', () => {
    const { host, leaf } = make(12, { duration: 400, rtl: true });
    leaf.go(1, false);
    pointer(host, 'pointerdown', 20);
    pointer(window, 'pointermove', 40);
    pointer(window, 'pointermove', 400);
    pointer(window, 'pointerup', 400);
    vi.advanceTimersByTime(1000);
    expect(leaf.index).toBe(3);
  });
});

describe('Leaf: 3D sheet stays 3D', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date'],
    });
  });

  it('never fades or filters the sheet itself (that would mirror the back face)', () => {
    const { host, leaf } = make(12, { duration: 400 });
    leaf.layout({ pageW: 300, pageH: 424, portrait: true });
    leaf.go(3, false);
    pointer(host, 'pointerdown', 290);
    pointer(window, 'pointermove', 270);
    pointer(window, 'pointermove', 60); // past halfway: the notepad leaf is fading
    const sheet = host.querySelector('.lf-leaf') as HTMLElement;
    const front = host.querySelector('.lf-front') as HTMLElement;
    expect(sheet.style.opacity).toBe('');
    expect(sheet.style.filter).toBe('');
    expect(Number(front.style.opacity)).toBeLessThan(1);
    pointer(window, 'pointerup', 60);
    vi.advanceTimersByTime(1500);
  });

  it('keeps the next pages decoded and ready', () => {
    const { host, leaf } = make();
    leaf.go(3, false);
    const warm = [...host.querySelectorAll('.lf-warm img')].map((img) => img.getAttribute('src'));
    expect(warm).toEqual(
      expect.arrayContaining(['blob:page-1', 'blob:page-2', 'blob:page-5', 'blob:page-6'])
    );
  });
});

describe('Leaf: images', () => {
  it('fills slots from getSrc and refreshes when a page arrives later', () => {
    const urls: Record<number, string | undefined> = { 0: 'blob:a' };
    const host = document.createElement('div');
    const leaf = new Leaf(host, { count: 4, getSrc: (i) => urls[i], duration: 0 });
    leaf.layout({ pageW: 300, pageH: 424, portrait: false }, 1);
    const left = host.querySelector('.lf-l img') as HTMLImageElement;
    expect(left.getAttribute('src')).toBeNull();
    urls[1] = 'blob:b';
    leaf.refresh(1);
    expect(left.getAttribute('src')).toBe('blob:b');
  });

  it('cleans up on destroy', () => {
    const { host, leaf } = make();
    leaf.destroy();
    expect(host.children.length).toBe(0);
  });
});
