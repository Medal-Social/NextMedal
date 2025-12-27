import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useIsMobile } from '@/hooks/use-mobile';

describe('useIsMobile', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let addEventListenerMock: ReturnType<typeof vi.fn>;
  let removeEventListenerMock: ReturnType<typeof vi.fn>;

  const createMatchMedia = (matches: boolean) => {
    addEventListenerMock = vi.fn();
    removeEventListenerMock = vi.fn();

    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;
  };

  beforeEach(() => {
    createMatchMedia(false); // Default to desktop
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false initially (SSR default)', () => {
    createMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns false for desktop viewport (>= 768px)', () => {
    createMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true for mobile viewport (< 768px)', () => {
    createMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('registers matchMedia listener on mount', () => {
    createMatchMedia(false);
    renderHook(() => useIsMobile());

    expect(matchMediaMock).toHaveBeenCalledWith('(max-width: 767px)');
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('removes matchMedia listener on unmount', () => {
    createMatchMedia(false);
    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('updates when viewport changes from desktop to mobile', () => {
    createMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate viewport change to mobile via MediaQueryListEvent
    act(() => {
      const onChangeHandler = addEventListenerMock.mock.calls[0][1];
      onChangeHandler({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });

  it('updates when viewport changes from mobile to desktop', () => {
    createMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    // Simulate viewport change to desktop via MediaQueryListEvent
    act(() => {
      const onChangeHandler = addEventListenerMock.mock.calls[0][1];
      onChangeHandler({ matches: false } as MediaQueryListEvent);
    });

    expect(result.current).toBe(false);
  });
});
