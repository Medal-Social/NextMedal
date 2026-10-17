import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  downloadHref,
  FlipbookViewer,
} from '@/components/blocks/objects/flipbook/FlipbookViewer.client';
import type { FlipbookLabels } from '@/components/blocks/objects/flipbook/types';

vi.mock('@/components/blocks/objects/flipbook/pdf', () => ({
  openPdf: vi.fn(() => ({ promise: Promise.resolve({ numPages: 6 }), cancel: vi.fn() })),
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

  it('labels the thumbnail drawer close button as a plain close', async () => {
    render(<FlipbookViewer src="/x.pdf" title="Doc" labels={labels} dir="ltr" reducedMotion />);
    expect(document.querySelector('.fb-thumbs-close')).toHaveAttribute('aria-label', 'Close');
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
