export const SINGLE_PAGE_BELOW = 720;

export interface BookLayout {
  portrait: boolean;
  pageW: number;
  pageH: number;
  /** In portrait the stage shrinks to hug the page (no dead bands); null in landscape. */
  fittedStageH: number | null;
}

interface LayoutInput {
  stageW: number;
  stageH: number;
  /** Width of the whole flipbook (container-query semantics, not the viewport). */
  containerW: number;
  /** Page width / height. */
  ratio: number;
  singlePageBelow?: number;
}

/** Room around the book: nav buttons in landscape, tighter on short (landscape-phone) stages. */
function padding(portrait: boolean, short: boolean) {
  // Phones: the page runs almost edge to edge (the stage hugs it vertically).
  if (portrait) return { padX: 6, padY: 10 };
  if (short) return { padX: 86, padY: 14 };
  return { padX: 104, padY: 40 };
}

export function computeBookLayout({
  stageW,
  stageH,
  containerW,
  ratio,
  singlePageBelow = SINGLE_PAGE_BELOW,
}: LayoutInput): BookLayout {
  const portrait = containerW < singlePageBelow;
  const { padX, padY } = padding(portrait, stageH < 420);
  const availW = stageW - padX * 2;
  const availH = stageH - padY * 2;
  const pageW = Math.max(0, Math.floor(Math.min(portrait ? availW : availW / 2, availH * ratio)));
  const pageH = Math.floor(pageW / ratio);
  return {
    portrait,
    pageW,
    pageH,
    fittedStageH: portrait ? Math.min(stageH, pageH + padY * 2) : null,
  };
}

/** First and last visible page (0-based) for a reading position. */
export function visibleRange(index: number, count: number, portrait: boolean): [number, number] {
  if (portrait || index === 0) return [index, index];
  const first = index % 2 ? index : index - 1;
  return [first, Math.min(first + 1, count - 1)];
}

/** How far to slide the book so a lone cover/back cover sits centred: -1 left, 1 right, 0 none. */
export function coverShift(
  index: number,
  count: number,
  portrait: boolean,
  rtl = false
): -1 | 0 | 1 {
  if (portrait) return 0;
  const [first, last] = visibleRange(index, count, portrait);
  let shift: -1 | 0 | 1 = 0;
  if (first === 0) shift = -1;
  else if (first === last) shift = 1;
  return rtl ? ((-shift || 0) as -1 | 0 | 1) : shift;
}
