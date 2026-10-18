import type { PDFDocumentProxy } from 'pdfjs-dist';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderBookPages } from '@/components/blocks/objects/flipbook/render-queue';
import { logger } from '@/lib/core/logger';

vi.mock('@/lib/core/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('@/components/blocks/objects/flipbook/pdf', () => ({
  renderPage: vi.fn(async (_doc: unknown, index: number) => `blob:page-${index}`),
}));

const doc = { numPages: 6 } as PDFDocumentProxy;

describe('renderBookPages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps rendered pages when a later page fails, and rejects when an opening page fails', async () => {
    const pdf = await import('@/components/blocks/objects/flipbook/pdf');
    const renderPage = vi.mocked(pdf.renderPage);
    const order = [0, 1, 2, 3, 4, 5];

    renderPage.mockImplementation(async (_document, index) => {
      if (index === 4) throw new Error('encode failed');
      return `blob:page-${index}`;
    });
    const pages: [number, string][] = [];
    await renderBookPages(doc, order, {
      height: 1000,
      headCount: 3,
      isCancelled: () => false,
      onPage: (index, url) => pages.push([index, url]),
    });

    expect(pages).toEqual([
      [0, 'blob:page-0'],
      [1, 'blob:page-1'],
      [2, 'blob:page-2'],
      [3, 'blob:page-3'],
      [4, ''],
      [5, 'blob:page-5'],
    ]);
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ page: 5 }),
      'Flipbook page failed to render'
    );
    expect(logger.error).toHaveBeenCalledOnce();

    vi.mocked(logger.error).mockClear();
    renderPage.mockImplementation(async (_document, index) => {
      if (index === 1) throw new Error('opening page failed');
      return `blob:page-${index}`;
    });
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const kept: [number, string][] = [];
    await expect(
      renderBookPages(doc, order, {
        height: 1000,
        headCount: 3,
        isCancelled: () => false,
        onPage: (index, url) => kept.push([index, url]),
      })
    ).rejects.toThrow('opening page failed');
    expect(kept).toEqual([[0, 'blob:page-0']]);
    expect(logger.error).not.toHaveBeenCalled();
    expect(revoke).not.toHaveBeenCalled();
    revoke.mockRestore();
  });

  it('drops the in-flight page image when loading is cancelled', async () => {
    const pdf = await import('@/components/blocks/objects/flipbook/pdf');
    let stop = false;
    vi.mocked(pdf.renderPage).mockImplementation(async (_document, index) => {
      if (index === 1) stop = true;
      return `blob:page-${index}`;
    });
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const pages: number[] = [];
    await renderBookPages(doc, [0, 1, 2], {
      height: 800,
      headCount: 3,
      isCancelled: () => stop,
      onPage: (index) => pages.push(index),
    });
    expect(pages).toEqual([0]);
    expect(revoke).toHaveBeenCalledWith('blob:page-1');
    revoke.mockRestore();
  });
});
