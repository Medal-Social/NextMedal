import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FlipbookViewer } from '@/components/blocks/objects/flipbook/FlipbookViewer.client';
import type { FlipbookLabels } from '@/components/blocks/objects/flipbook/types';

vi.mock('@/components/blocks/objects/flipbook/pdf', () => ({
  openPdf: vi.fn(async () => ({ numPages: 6 })),
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
  download: 'Download PDF',
  fullscreen: 'Fullscreen',
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
    await waitFor(() =>
      expect(screen.getByRole('region', { name: 'Annual Review' })).toHaveAttribute(
        'data-state',
        'ready'
      )
    );
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

  it('opens the thumbnail drawer and jumps', async () => {
    render(<FlipbookViewer src="/x.pdf" title="Doc" labels={labels} dir="ltr" reducedMotion />);
    await waitFor(() =>
      expect(screen.getByRole('region', { name: 'Doc' })).toHaveAttribute('data-state', 'ready')
    );
    fireEvent.click(screen.getByRole('button', { name: 'All pages' }));
    fireEvent.click(screen.getByRole('button', { name: 'Go to page 4' }));
    await waitFor(() => expect(counter()).toBe('4–5 / 6'));
  });

  it('shows the error state with a working download link', async () => {
    const pdf = await import('@/components/blocks/objects/flipbook/pdf');
    vi.mocked(pdf.openPdf).mockRejectedValueOnce(new Error('bad pdf'));
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
});
