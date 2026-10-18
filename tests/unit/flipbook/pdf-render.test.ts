import type { PDFDocumentProxy } from 'pdfjs-dist';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PageCache } from '@/components/blocks/objects/flipbook/page-cache';
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
  it('a jump starts the new page before the old page finishes encoding', async () => {
    const { canvas } = installCanvas('ok');
    const { doc, cleanup } = fakeDoc(async () => undefined);
    const callbacks: BlobCallback[] = [];
    let encodingStarted!: () => void;
    const encoding = new Promise<void>((resolve) => {
      encodingStarted = resolve;
    });
    vi.mocked(canvas.toBlob).mockImplementation((callback) => {
      callbacks.push(callback);
      if (callbacks.length === 1) encodingStarted();
      else callback(new Blob(['new page'], { type: 'image/webp' }));
    });
    const createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:new-page');
    const cache = new PageCache({
      count: 20,
      behind: 0,
      ahead: 0,
      schedule: (run) => run(),
      render: (index, signal) => renderPage(doc, index, { height: 200 }, signal),
    });
    cache.focus(0);
    await encoding;
    cache.focus(10);
    await vi.waitFor(() => expect(cache.get(10)).toBe('blob:new-page'));
    expect(cache.get(0)).toBeUndefined();
    expect(cleanup).toHaveBeenCalledTimes(2);
    expect(canvas.width).toBe(0);
    // The old native encoder may finish later, but it never creates a leaked URL.
    callbacks[0]?.(new Blob(['obsolete page']));
    await Promise.resolve();
    expect(createUrl).toHaveBeenCalledOnce();
    cache.destroy();
  });

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
