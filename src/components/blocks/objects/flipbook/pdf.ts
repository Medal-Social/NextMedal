import type { PDFDocumentProxy } from 'pdfjs-dist';

let worker: Worker | null = null;

/** Lazily import pdf.js and bind one shared same-origin module worker. */
async function pdfjs() {
  const lib = await import('pdfjs-dist');
  if (!worker) {
    worker = new Worker(new URL('./pdf.worker.ts', import.meta.url), { type: 'module' });
    lib.GlobalWorkerOptions.workerPort = worker;
  }
  return lib;
}

export async function openPdf(src: string): Promise<PDFDocumentProxy> {
  const lib = await pdfjs();
  return lib.getDocument({ url: src }).promise;
}

/** Release the document and its worker-side resources. */
export function closePdf(doc: PDFDocumentProxy): Promise<void> {
  return doc.loadingTask.destroy();
}

/** Page width/height ratio of page 1. */
export async function pageRatio(doc: PDFDocumentProxy): Promise<number> {
  const page = await doc.getPage(1);
  const { width, height } = page.getViewport({ scale: 1 });
  return width / height;
}

/** Device-pixel height to rasterise book pages at: enough for fullscreen on this screen. */
export function targetPageHeight(): number {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  return Math.round(Math.min(2200, Math.max(1000, window.screen.height * dpr * 0.92)));
}

/** Render page `index` (0-based) to a WebP object URL. Size by height, or by width when given. */
export async function renderPage(
  doc: PDFDocumentProxy,
  index: number,
  size: { height: number } | { width: number }
): Promise<string> {
  const page = await doc.getPage(index + 1);
  const base = page.getViewport({ scale: 1 });
  const scale =
    'height' in size ? size.height / base.height : Math.min(size.width, 3200) / base.width;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', 0.9)
  );
  canvas.width = 0;
  canvas.height = 0;
  page.cleanup();
  if (!blob) throw new Error('Could not encode page image');
  return URL.createObjectURL(blob);
}
