import type { PDFDocumentProxy } from 'pdfjs-dist';
import { logger } from '@/lib/core/logger';
import { renderPage } from './pdf';

/**
 * Rasterise pages in order.
 * A failure while the opening pages are still rendering rejects, so the viewer can show
 * the full error state. A failure after those pages succeeds is logged and reported as
 * an empty url, which the book paints as a blank page.
 */
export async function renderBookPages(
  doc: PDFDocumentProxy,
  order: number[],
  options: {
    height: number;
    headCount: number;
    isCancelled: () => boolean;
    /** `url` is a blob URL, or `''` when this later page failed and should stay blank. */
    onPage: (index: number, url: string) => void;
  }
): Promise<void> {
  let done = 0;
  for (const index of order) {
    let url: string;
    try {
      url = await renderPage(doc, index, { height: options.height });
    } catch (error) {
      if (options.isCancelled()) return;
      if (done < options.headCount) throw error;
      logger.error({ err: error, page: index + 1 }, 'Flipbook page failed to render');
      options.onPage(index, '');
      done++;
      continue;
    }
    if (options.isCancelled()) {
      URL.revokeObjectURL(url);
      return;
    }
    options.onPage(index, url);
    done++;
  }
}
