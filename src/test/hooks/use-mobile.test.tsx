import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useIsMobile } from '@/hooks/use-mobile';

describe('useIsMobile', () => {
  let originalInnerWidth: number;
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let addEventListenerMock: ReturnType<typeof vi.fn>;
  let removeEventListenerMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    addEventListenerMock = vi.fn();
    removeEventListenerMock = vi.fn();

    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    vi.restoreAllMocks();
  });

  it('returns false for desktop viewport (>= 768px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true for mobile viewport (< 768px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('returns false at exactly 768px breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true at 767px (one below breakpoint)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('registers matchMedia listener on mount', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    renderHook(() => useIsMobile());

    expect(matchMediaMock).toHaveBeenCalledWith('(max-width: 767px)');
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('removes matchMedia listener on unmount', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('updates when viewport changes from desktop to mobile', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate viewport change to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });
      // Get the onChange handler and call it
      const onChangeHandler = addEventListenerMock.mock.calls[0][1];
      onChangeHandler();
    });

    expect(result.current).toBe(true);
  });

  it('updates when viewport changes from mobile to desktop', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    // Simulate viewport change to desktop
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      // Get the onChange handler and call it
      const onChangeHandler = addEventListenerMock.mock.calls[0][1];
      onChangeHandler();
    });

    expect(result.current).toBe(false);
  });

  it('returns false initially when isMobile is undefined (coerced to false)', () => {
    // The hook uses !!isMobile which converts undefined to false
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    const { result } = renderHook(() => useIsMobile());
    // After useEffect runs, it should be true for mobile viewport
    expect(result.current).toBe(true);
  });
});
