export interface FlipbookLabels {
  previous: string;
  next: string;
  allPages: string;
  zoom: string;
  closeZoom: string;
  download: string;
  fullscreen: string;
  goToPage: string;
  preparing: string;
  pages: string; // "{count} pages"
  page: string; // "Page {page}"
  pageOf: string; // "Page {page} of {total}"
  hintPointer: string;
  hintTouch: string;
  zoomHint: string;
  error: string;
  errorDetail: string;
  poweredBy: string;
}

export interface FlipbookPageChange {
  /** First visible page, 1-based. */
  page: number;
  spread: [number] | [number, number];
}

export type FlipbookTokens = Partial<
  Record<
    | 'accent'
    | 'accent-strong'
    | 'accent-soft'
    | 'accent-contrast'
    | 'success'
    | 'focus'
    | 'surface'
    | 'surface-muted'
    | 'border'
    | 'ink'
    | 'ink-muted'
    | 'stage-bg'
    | 'radius'
    | 'font',
    string
  >
>;

export interface FlipbookProps {
  src: string;
  title?: string;
  filename?: string;
  /** File size in bytes (shown in the toolbar when known). */
  size?: number;
  startPage?: number;
  poweredBy?: boolean | { label: string; href: string };
  download?: boolean;
  theme?: FlipbookTokens;
  className?: string;
  onPageChange?: (event: FlipbookPageChange) => void;
}
