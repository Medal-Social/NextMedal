import { describe, expect, it } from 'vitest';
import {
  computeBookLayout,
  coverShift,
  SINGLE_PAGE_BELOW,
  visibleRange,
} from '@/components/blocks/objects/flipbook/layout';

const A4 = 210 / 297;

describe('computeBookLayout', () => {
  it('uses spreads at desktop width and fits the stage height', () => {
    const l = computeBookLayout({ stageW: 1376, stageH: 600, containerW: 1376, ratio: A4 });
    expect(l.portrait).toBe(false);
    expect(l.pageH).toBeLessThanOrEqual(600 - 80);
    expect(l.pageW * 2).toBeLessThanOrEqual(1376 - 208);
    expect(l.fittedStageH).toBeNull();
  });

  it('switches to a single page below the breakpoint and hugs the page', () => {
    const l = computeBookLayout({ stageW: 356, stageH: 640, containerW: 356, ratio: A4 });
    expect(l.portrait).toBe(true);
    expect(l.pageW).toBe(356 - 36);
    expect(l.fittedStageH).toBe(l.pageH + 44);
  });

  it('uses tight padding on short landscape stages (phones on their side)', () => {
    const l = computeBookLayout({ stageW: 800, stageH: 286, containerW: 800, ratio: A4 });
    expect(l.portrait).toBe(false);
    // 14px padding top + bottom; flooring the width can cost one pixel of height.
    expect(l.pageH).toBeGreaterThanOrEqual(286 - 28 - 1);
    expect(l.pageH).toBeLessThanOrEqual(286 - 28);
  });

  it('exposes the default breakpoint', () => {
    expect(SINGLE_PAGE_BELOW).toBe(720);
  });
});

describe('visibleRange', () => {
  it('shows the cover alone', () => expect(visibleRange(0, 12, false)).toEqual([0, 0]));
  it('pairs odd/even pages into spreads', () => {
    expect(visibleRange(1, 12, false)).toEqual([1, 2]);
    expect(visibleRange(2, 12, false)).toEqual([1, 2]);
  });
  it('shows an even-count back cover alone', () =>
    expect(visibleRange(11, 12, false)).toEqual([11, 11]));
  it('shows one page in portrait', () => expect(visibleRange(5, 12, true)).toEqual([5, 5]));
});

describe('coverShift', () => {
  it('shifts the cover left so it sits centred', () => expect(coverShift(0, 12, false)).toBe(-1));
  it('centres normal spreads', () => expect(coverShift(3, 12, false)).toBe(0));
  it('shifts a lone back cover right', () => expect(coverShift(11, 12, false)).toBe(1));
  it('never shifts in portrait', () => expect(coverShift(0, 12, true)).toBe(0));
  it('mirrors the shift for right-to-left books', () =>
    expect(coverShift(0, 12, false, true)).toBe(1));
});
