import type { PDFDocumentProxy } from 'pdfjs-dist';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderPage } from '@/components/blocks/objects/flipbook/pdf';

function installCanvas(behavior: 'reject-render' | 'null-blob' | 'ok') {
  const canvas = document.createElement('canvas');
  const ctx = {} as CanvasRenderingContext2D;
  vi.spyOn(canvas, 'getContext').mockReturnValue(ctx);
  vi.spyOn(canvas, 'toBlob').mockImplementation((callback) => {
    if (behavior === 'null-blob') {
      callback(null);
      return;
    }
    callback(new Blob(['page'], { type: 'image/webp' }));
  });
  const create = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
    if (tagName === 'canvas') return canvas;
    return Document.prototype.createElement.call(document, tagName);
  });
  return { canvas, create };
}

function fakeDoc(render: () => Promise<void>) {
  const cleanup = vi.fn();
  const page = {
    getViewport: ({ scale }: { scale: number }) => ({ width: 100 * scale, height: 200 * scale }),
    render: () => ({ promise: render() }),
    cleanup,
  };
  const doc = {
    getPage: vi.fn(async () => page),
  } as unknown as PDFDocumentProxy;
  return { doc, cleanup };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('renderPage cleanup', () => {
  it('releases the canvas and PDF page when rendering rejects', async () => {
    const { canvas } = installCanvas('ok');
    const { doc, cleanup } = fakeDoc(() => Promise.reject(new Error('render failed')));

    await expect(renderPage(doc, 4, { height: 200 })).rejects.toThrow('render failed');

    expect(canvas.width).toBe(0);
    expect(canvas.height).toBe(0);
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('releases the canvas and PDF page when encoding returns no blob', async () => {
    const { canvas } = installCanvas('null-blob');
    const { doc, cleanup } = fakeDoc(async () => undefined);

    await expect(renderPage(doc, 1, { height: 200 })).rejects.toThrow(
      'Could not encode page image'
    );

    expect(canvas.width).toBe(0);
    expect(canvas.height).toBe(0);
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('still returns an object URL after a successful render', async () => {
    installCanvas('ok');
    const { doc, cleanup } = fakeDoc(async () => undefined);
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    const url = await renderPage(doc, 0, { height: 200 });

    expect(url.startsWith('blob:')).toBe(true);
    expect(cleanup).toHaveBeenCalledOnce();
    URL.revokeObjectURL(url);
    revoke.mockRestore();
  });
});
