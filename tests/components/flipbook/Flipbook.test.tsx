import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  downloadHref,
  FlipbookViewer,
  sliderLogicalFraction,
} from '@/components/blocks/objects/flipbook/FlipbookViewer.client';
import type { FlipbookLabels } from '@/components/blocks/objects/flipbook/types';
import { logger } from '@/lib/core/logger';

vi.mock('@/lib/core/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('@/components/blocks/objects/flipbook/pdf', () => ({
  openPdf: vi.fn(() => ({ promise: Promise.resolve({ numPages: 6 }), cancel: vi.fn() })),
  closePdf: vi.fn(async () => undefined),
  pageRatio: vi.fn(async () => 210 / 297),
  targetPageHeight: () => 1000,
  renderPage: vi.fn(async (_doc: unknown, i: number) => `blob:page-${i}`),
}));

const labels: FlipbookLabels = {
  previous: 'Previous page',
  next: 'Next page',
  allPages: 'All pages',
  zoom: 'Zoom page',
  closeZoom: 'Close zoom',
  close: 'Close',
  download: 'Download PDF',
  fullscreen: 'Fullscreen',
  readFullscreen: 'Read full screen',
  goToPage: 'Go to page',
  preparing: 'Preparing pages',
  pages: '{count} pages',
  page: 'Page {page}',
  pageOf: 'Page {page} of {total}',
  hintPointer: 'Click or drag',
  hintTouch: 'Swipe',
  zoomHint: 'Page {page}',
  error: 'We couldn’t open this PDF.',
  errorDetail: 'Damaged',
  poweredBy: 'Powered by',
};

/** Ready state *and* the page-turn engine mounted (it attaches in an effect after first paint). */
async function engineReady(name: string) {
  await waitFor(() => {
    expect(screen.getByRole('region', { name })).toHaveAttribute('data-state', 'ready');
    expect(document.querySelector('.fb-book.lf')).not.toBeNull();
  });
}

const counter = () => screen.getByTestId('fb-counter').textContent?.replace(/\s+/g, ' ').trim();

describe('FlipbookViewer', () => {
  beforeEach(() => {
    // jsdom reports 0×0 layout; give the stage a desktop size.
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1200);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(640);
  });

  it('loads, shows the cover and turns with the next button and arrow keys', async () => {
    const onPageChange = vi.fn();
    render(
      <FlipbookViewer
        src="/x.pdf"
        title="Annual Review"
        labels={labels}
        dir="ltr"
        onPageChange={onPageChange}
        reducedMotion
      />
    );
    await engineReady('Annual Review');
    expect(counter()).toBe('1 / 6');
    fireEvent.click(screen.getAllByRole('button', { name: 'Next page' })[0]);
    await waitFor(() => expect(counter()).toBe('2–3 / 6'));
    expect(onPageChange).toHaveBeenLastCalledWith({ page: 2, spread: [2, 3] });
    act(() => {
      screen.getByRole('region', { name: 'Annual Review' }).focus();
    });
    fireEvent.keyDown(document.activeElement as Element, { key: 'End' });
    await waitFor(() => expect(counter()).toBe('6 / 6'));
  });

  it('keeps the book usable when one page fails to render', async () => {
    const pdf = await import('@/components/blocks/objects/flipbook/pdf');
    vi.mocked(pdf.renderPage).mockImplementation(async (_doc: unknown, i: number) => {
      if (i === 3) throw new Error('broken page');
      return `blob:page-${i}`;
    });
    render(<FlipbookViewer src="/x.pdf" title="Doc" labels={labels} dir="ltr" reducedMotion />);
    await engineReady('Doc');
    await waitFor(() =>
      expect(screen.getByRole('region', { name: 'Doc' })).toHaveAttribute('data-complete', 'true')
    );
    fireEvent.click(screen.getAllByRole('button', { name: 'Next page' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Next page' })[0]);
    await waitFor(() => expect(counter()).toBe('4–5 / 6'));
    expect(screen.getByRole('region', { name: 'Doc' })).toHaveAttribute('data-state', 'ready');
    vi.mocked(pdf.renderPage).mockImplementation(
      async (_doc: unknown, i: number) => `blob:page-${i}`
    );
  });

  it('opens the thumbnail drawer and jumps', async () => {
    render(<FlipbookViewer src="/x.pdf" title="Doc" labels={labels} dir="ltr" reducedMotion />);
    await engineReady('Doc');
    fireEvent.click(screen.getByRole('button', { name: 'All pages' }));
    fireEvent.click(screen.getByRole('button', { name: 'Go to page 4' }));
    await waitFor(() => expect(counter()).toBe('4–5 / 6'));
  });

  it('keeps a readable book when a later page fails, and replaces it only when opening pages fail', async () => {
    const pdf = await import('@/components/blocks/objects/flipbook/pdf');
    const renderPage = vi.mocked(pdf.renderPage);
    const restoreRender = () =>
      renderPage.mockImplementation(async (_doc: unknown, i: number) => `blob:page-${i}`);

    renderPage.mockImplementation(async (_doc: unknown, i: number) => {
      if (i === 4) throw new Error('encode failed');
      return `blob:page-${i}`;
    });
    const { unmount } = render(
      <FlipbookViewer src="/late.pdf" title="Late miss" labels={labels} dir="ltr" reducedMotion />
    );
    await engineReady('Late miss');
    await waitFor(() =>
      expect(screen.getByRole('region', { name: 'Late miss' })).toHaveAttribute(
        'data-complete',
        'true'
      )
    );
    expect(screen.queryByRole('alert')).toBeNull();
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ src: '/late.pdf', page: 5 }),
      'Flipbook page failed to render'
    );
    fireEvent.click(screen.getByRole('button', { name: 'All pages' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Go to page 5' })).toHaveClass('is-unavailable')
    );
    expect(screen.getByRole('button', { name: 'Go to page 4' })).not.toHaveClass('is-unavailable');
    fireEvent.click(screen.getByRole('button', { name: 'All pages' }));

    const slider = screen.getByRole('slider', { name: 'Go to page' });
    fireEvent.change(slider, { target: { value: '4' } });
    fireEvent.keyUp(slider, { key: 'ArrowRight' });
    await waitFor(() => expect(counter()).toBe('4–5 / 6'));
    const missed = document.querySelector<HTMLElement>('.fb-page[data-page="4"]');
    expect(missed).toHaveClass('is-unavailable');
    expect(missed?.querySelector('img')).not.toHaveAttribute('src');
    expect(document.querySelector('.fb-page[data-page="3"] img')).toHaveAttribute(
      'src',
      'blob:page-3'
    );
    const region = screen.getByRole('region', { name: 'Late miss' });
    act(() => {
      region.focus();
    });
    fireEvent.keyDown(document.activeElement as Element, { key: 'End' });
    await waitFor(() => expect(counter()).toBe('6 / 6'));
    expect(document.querySelector('.fb-page[data-page="5"] img')).toHaveAttribute(
      'src',
      'blob:page-5'
    );
    unmount();

    restoreRender();
    vi.mocked(logger.error).mockClear();
    // Only when the whole opening spread fails does the book give way to the error state.
    const cancel = vi.fn();
    vi.mocked(pdf.openPdf).mockReturnValueOnce({
      promise: Promise.resolve({ numPages: 6 }) as ReturnType<typeof pdf.openPdf>['promise'],
      cancel,
    });
    renderPage.mockClear();
    renderPage.mockImplementation(async (_doc: unknown, i: number) => {
      if (i === 0) throw new Error('opening page failed');
      return `blob:page-${i}`;
    });
    render(
      <FlipbookViewer src="/head.pdf" title="Head miss" labels={labels} dir="ltr" reducedMotion />
    );
    await waitFor(() =>
      expect(screen.getByRole('region', { name: 'Head miss' })).toHaveAttribute(
        'data-state',
        'error'
      )
    );
    expect(screen.getByRole('alert')).toHaveTextContent('We couldn’t open this PDF.');
    expect(document.querySelector('.fb-book.lf')).toBeNull();
    expect(logger.error).toHaveBeenCalledWith(
      { src: '/head.pdf', pages: [1] },
      'Flipbook could not open: first pages failed'
    );
    expect(cancel).toHaveBeenCalledOnce();
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(renderPage).toHaveBeenCalledTimes(1);
    restoreRender();
  });
  it('shows the error state with a working download link', async () => {
    const pdf = await import('@/components/blocks/objects/flipbook/pdf');
    vi.mocked(pdf.openPdf).mockImplementationOnce(() => ({
      promise: Promise.reject(new Error('bad pdf')),
      cancel: vi.fn(),
    }));
    render(
      <FlipbookViewer src="/bad.pdf" title="Broken" labels={labels} dir="ltr" reducedMotion />
    );
    await waitFor(() =>
      expect(screen.getByRole('region', { name: 'Broken' })).toHaveAttribute('data-state', 'error')
    );
    expect(screen.getByText('We couldn’t open this PDF.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Download PDF' })).toHaveAttribute('href', '/bad.pdf');
  });

  it('hides Powered by when poweredBy is false and applies theme tokens', async () => {
    render(
      <FlipbookViewer
        src="/x.pdf"
        title="Doc"
        labels={labels}
        dir="ltr"
        poweredBy={false}
        theme={{ accent: '#55302A' }}
        reducedMotion
      />
    );
    const region = screen.getByRole('region', { name: 'Doc' });
    expect(region.style.getPropertyValue('--fb-accent')).toBe('#55302A');
    expect(screen.queryByText('Powered by')).toBeNull();
  });

  it('lets readers scrub to a page with the slider (keyboard and pointer)', async () => {
    render(<FlipbookViewer src="/x.pdf" title="Doc" labels={labels} dir="ltr" reducedMotion />);
    await engineReady('Doc');
    const slider = screen.getByRole('slider', { name: 'Go to page' });
    fireEvent.change(slider, { target: { value: '4' } });
    expect(slider).toHaveValue('4');
    fireEvent.keyUp(slider, { key: 'ArrowRight' });
    await waitFor(() => expect(counter()).toBe('4–5 / 6'));
    fireEvent.change(slider, { target: { value: '2' } });
    fireEvent.pointerUp(slider);
    await waitFor(() => expect(counter()).toBe('2–3 / 6'));
  });

  it('ignores right-clicks on the page (no tap-to-turn)', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    render(<FlipbookViewer src="/x.pdf" title="Doc" labels={labels} dir="ltr" reducedMotion />);
    await vi.waitFor(() => expect(document.querySelector('.fb-book.lf')).not.toBeNull());
    const book = document.querySelector('.fb-book') as HTMLElement;
    fireEvent.pointerDown(book, { button: 2, clientX: 900, clientY: 300 });
    fireEvent.pointerUp(book, { button: 2, clientX: 900, clientY: 300 });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(counter()).toBe('1 / 6');
    vi.useRealTimers();
  });

  it('resets the slider when a scrub is cancelled', async () => {
    render(<FlipbookViewer src="/x.pdf" title="Doc" labels={labels} dir="ltr" reducedMotion />);
    await engineReady('Doc');
    const slider = screen.getByRole('slider', { name: 'Go to page' });
    fireEvent.change(slider, { target: { value: '5' } });
    expect(slider).toHaveValue('5');
    fireEvent.pointerCancel(slider);
    await waitFor(() => expect(slider).toHaveValue('1'));
    expect(counter()).toBe('1 / 6');
  });

  it('maps the physical arrows for right-to-left books', async () => {
    render(<FlipbookViewer src="/x.pdf" title="Doc" labels={labels} dir="rtl" reducedMotion />);
    await engineReady('Doc');
    const left = document.querySelector('.fb-nav.fb-prev') as HTMLButtonElement;
    expect(left).toHaveAttribute('aria-label', 'Next page');
    expect(left).not.toBeDisabled();
    fireEvent.click(left);
    await waitFor(() => expect(counter()).toBe('2–3 / 6'));
  });

  it('stays where the reader is when late pages arrive (back on the cover of a startPage book)', async () => {
    const pdf = await import('@/components/blocks/objects/flipbook/pdf');
    let release: (url: string) => void = () => {};
    vi.mocked(pdf.renderPage).mockImplementation((_doc: unknown, i: number) =>
      i === 5 ? new Promise((resolve) => (release = resolve)) : Promise.resolve(`blob:page-${i}`)
    );
    render(
      <FlipbookViewer
        src="/x.pdf"
        title="Doc"
        labels={labels}
        dir="ltr"
        startPage={3}
        reducedMotion
      />
    );
    await engineReady('Doc');
    expect(counter()).toBe('2–3 / 6');
    act(() => {
      screen.getByRole('region', { name: 'Doc' }).focus();
    });
    fireEvent.keyDown(document.activeElement as Element, { key: 'Home' });
    await waitFor(() => expect(counter()).toBe('1 / 6'));
    await act(async () => release('blob:page-5'));
    expect(counter()).toBe('1 / 6');
    vi.mocked(pdf.renderPage).mockImplementation(
      async (_doc: unknown, i: number) => `blob:page-${i}`
    );
  });

  it('prepares thumbnails when the drawer was opened before the PDF loaded', async () => {
    const pdf = await import('@/components/blocks/objects/flipbook/pdf');
    let open: (doc: { numPages: number }) => void = () => {};
    vi.mocked(pdf.openPdf).mockImplementationOnce(() => ({
      promise: new Promise((resolve) => (open = resolve)) as never,
      cancel: vi.fn(),
    }));
    vi.mocked(pdf.renderPage).mockClear();
    render(<FlipbookViewer src="/x.pdf" title="Doc" labels={labels} dir="ltr" reducedMotion />);
    fireEvent.click(screen.getByRole('button', { name: 'All pages' }));
    await act(async () => open({ numPages: 6 }));
    await engineReady('Doc');
    await waitFor(() =>
      expect(pdf.renderPage).toHaveBeenCalledWith(
        expect.anything(),
        0,
        { height: 220 },
        expect.anything()
      )
    );
  });

  it('turns the page on a tap in the middle of the inline book', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    render(<FlipbookViewer src="/x.pdf" title="Doc" labels={labels} dir="ltr" reducedMotion />);
    await vi.waitFor(() => expect(document.querySelector('.fb-book.lf')).not.toBeNull());
    const book = document.querySelector('.fb-book') as HTMLElement;
    vi.spyOn(book, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 1200, 600));
    fireEvent.pointerDown(book, { button: 0, clientX: 700, clientY: 300 });
    fireEvent.pointerUp(book, { button: 0, clientX: 700, clientY: 300 });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(counter()).toBe('2–3 / 6');
    vi.useRealTimers();
  });

  it('hides the reading-mode chrome after a moment, even with focus left on the Fullscreen button', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    render(<FlipbookViewer src="/x.pdf" title="Doc" labels={labels} dir="ltr" reducedMotion />);
    await vi.waitFor(() => expect(document.querySelector('.fb-book.lf')).not.toBeNull());
    const button = screen.getAllByRole('button', { name: 'Fullscreen' })[0] as HTMLButtonElement;
    act(() => {
      button.focus();
      fireEvent.click(button);
    });
    const bar = document.querySelector('.fb-bar') as HTMLElement;
    expect(bar.hasAttribute('inert')).toBe(false);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(bar.hasAttribute('inert')).toBe(true);
    expect(screen.getByRole('region', { name: 'Doc' })).toHaveClass('chrome-hidden');
    const announcement = screen.getByRole('status');
    expect(announcement.closest('[inert]')).toBeNull();
    const book = document.querySelector('.fb-book') as HTMLElement;
    vi.spyOn(book, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 1200, 600));
    fireEvent.pointerDown(book, { button: 0, clientX: 1150, clientY: 300 });
    fireEvent.pointerUp(book, { button: 0, clientX: 1150, clientY: 300 });
    expect(announcement).toHaveTextContent('Page 2–3 of 6');
    expect(bar.hasAttribute('inert')).toBe(true);
    vi.useRealTimers();
  });

  it('labels the thumbnail drawer close button as a plain close', async () => {
    render(<FlipbookViewer src="/x.pdf" title="Doc" labels={labels} dir="ltr" reducedMotion />);
    expect(document.querySelector('.fb-thumbs-close')).toHaveAttribute('aria-label', 'Close');
  });

  it('follows the locale direction on the viewer and the page slider', async () => {
    render(<FlipbookViewer src="/x.pdf" title="Doc" labels={labels} dir="rtl" reducedMotion />);
    expect(screen.getByRole('region', { name: 'Doc' })).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('slider', { name: 'Go to page' })).toHaveAttribute('dir', 'rtl');
  });

  it('cancels an in-flight PDF download when the viewer unmounts', async () => {
    const pdf = await import('@/components/blocks/objects/flipbook/pdf');
    const cancel = vi.fn();
    vi.mocked(pdf.openPdf).mockReturnValueOnce({ promise: new Promise(() => undefined), cancel });
    const { unmount } = render(
      <FlipbookViewer src="/slow.pdf" title="Slow" labels={labels} dir="ltr" reducedMotion />
    );
    await waitFor(() => expect(pdf.openPdf).toHaveBeenCalled());
    unmount();
    expect(cancel).toHaveBeenCalledOnce();
  });
});

describe('sliderLogicalFraction', () => {
  it('reads left-to-right from the physical left edge', () => {
    expect(sliderLogicalFraction(25, { left: 0, width: 100 }, false)).toBe(0.25);
  });

  it('reads right-to-left from the physical right edge', () => {
    expect(sliderLogicalFraction(25, { left: 0, width: 100 }, true)).toBe(0.75);
  });
});

describe('downloadHref', () => {
  it('forces a download for Sanity CDN files', () => {
    expect(downloadHref('https://cdn.sanity.io/files/p/d/abc.pdf', 'report.pdf')).toBe(
      'https://cdn.sanity.io/files/p/d/abc.pdf?dl=report.pdf'
    );
  });
  it('leaves other URLs alone', () => {
    expect(downloadHref('/api/dev/flipbook-sample', 'x.pdf')).toBe('/api/dev/flipbook-sample');
  });
});
