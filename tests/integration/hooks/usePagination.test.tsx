import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock nuqs
const mockSetPage = vi.fn();
let mockPage = 1;

vi.mock('nuqs', () => ({
  parseAsInteger: {
    withDefault: () => ({}),
  },
  useQueryState: () => [mockPage, mockSetPage],
}));

// Import after mocking
import { getPageNumbers, usePageState, usePagination } from '@/lib/hooks/use-pagination';

describe('usePagination', () => {
  beforeEach(() => {
    mockPage = 1;
    mockSetPage.mockClear();
  });

  describe('basic pagination', () => {
    it('returns correct paginated items for first page', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const { result } = renderHook(() => usePagination({ items, itemsPerPage: 3 }));

      expect(result.current.paginatedItems).toEqual([1, 2, 3]);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalPages).toBe(3);
    });

    it('uses default itemsPerPage of 6', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const { result } = renderHook(() => usePagination({ items }));

      expect(result.current.paginatedItems).toEqual([1, 2, 3, 4, 5, 6]);
      expect(result.current.totalPages).toBe(2);
    });

    it('handles empty items array', () => {
      const { result } = renderHook(() => usePagination({ items: [], itemsPerPage: 3 }));

      expect(result.current.paginatedItems).toEqual([]);
      expect(result.current.totalPages).toBe(1); // Returns 1 to avoid edge cases
    });

    it('handles items less than itemsPerPage', () => {
      const items = [1, 2];
      const { result } = renderHook(() => usePagination({ items, itemsPerPage: 5 }));

      expect(result.current.paginatedItems).toEqual([1, 2]);
      expect(result.current.totalPages).toBe(1);
    });

    it('handles single item', () => {
      const items = ['single'];
      const { result } = renderHook(() => usePagination({ items, itemsPerPage: 3 }));

      expect(result.current.paginatedItems).toEqual(['single']);
      expect(result.current.totalPages).toBe(1);
    });
  });

  describe('atStart and atEnd flags', () => {
    it('atStart is true on first page', () => {
      mockPage = 1;
      const items = [1, 2, 3, 4, 5, 6];
      const { result } = renderHook(() => usePagination({ items, itemsPerPage: 3 }));

      expect(result.current.atStart).toBe(true);
      expect(result.current.atEnd).toBe(false);
    });

    it('atEnd is true on last page', () => {
      mockPage = 2;
      const items = [1, 2, 3, 4, 5, 6];
      const { result } = renderHook(() => usePagination({ items, itemsPerPage: 3 }));

      expect(result.current.atStart).toBe(false);
      expect(result.current.atEnd).toBe(true);
    });

    it('both atStart and atEnd are true for single page', () => {
      mockPage = 1;
      const items = [1, 2];
      const { result } = renderHook(() => usePagination({ items, itemsPerPage: 3 }));

      expect(result.current.atStart).toBe(true);
      expect(result.current.atEnd).toBe(true);
    });

    it('neither atStart nor atEnd for middle page', () => {
      mockPage = 2;
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const { result } = renderHook(() => usePagination({ items, itemsPerPage: 3 }));

      expect(result.current.atStart).toBe(false);
      expect(result.current.atEnd).toBe(false);
    });
  });

  describe('navigation functions', () => {
    it('onNext navigates to next page', () => {
      mockPage = 1;
      const items = [1, 2, 3, 4, 5, 6];
      const { result } = renderHook(() => usePagination({ items, itemsPerPage: 3 }));

      act(() => {
        result.current.onNext();
      });

      expect(mockSetPage).toHaveBeenCalledWith(2);
    });

    it('onPrev navigates to previous page', () => {
      mockPage = 2;
      const items = [1, 2, 3, 4, 5, 6];
      const { result } = renderHook(() => usePagination({ items, itemsPerPage: 3 }));

      act(() => {
        result.current.onPrev();
      });

      expect(mockSetPage).toHaveBeenCalledWith(1);
    });

    it('onNext does not go beyond last page', () => {
      mockPage = 2;
      const items = [1, 2, 3, 4, 5, 6];
      const { result } = renderHook(() => usePagination({ items, itemsPerPage: 3 }));

      act(() => {
        result.current.onNext();
      });

      expect(mockSetPage).toHaveBeenCalledWith(2); // Stays on page 2
    });

    it('onPrev does not go below first page', () => {
      mockPage = 1;
      const items = [1, 2, 3, 4, 5, 6];
      const { result } = renderHook(() => usePagination({ items, itemsPerPage: 3 }));

      act(() => {
        result.current.onPrev();
      });

      expect(mockSetPage).toHaveBeenCalledWith(1); // Stays on page 1
    });
  });

  describe('paginated items on different pages', () => {
    it('returns correct items for page 2', () => {
      mockPage = 2;
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const { result } = renderHook(() => usePagination({ items, itemsPerPage: 3 }));

      expect(result.current.paginatedItems).toEqual([4, 5, 6]);
    });

    it('returns correct items for last page with partial items', () => {
      mockPage = 3;
      const items = [1, 2, 3, 4, 5, 6, 7];
      const { result } = renderHook(() => usePagination({ items, itemsPerPage: 3 }));

      expect(result.current.paginatedItems).toEqual([7]);
    });
  });

  describe('generic type support', () => {
    it('works with object arrays', () => {
      const items = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
        { id: 4, name: 'David' },
      ];
      const { result } = renderHook(() => usePagination({ items, itemsPerPage: 2 }));

      expect(result.current.paginatedItems).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]);
    });

    it('works with string arrays', () => {
      const items = ['a', 'b', 'c', 'd', 'e'];
      const { result } = renderHook(() => usePagination({ items, itemsPerPage: 2 }));

      expect(result.current.paginatedItems).toEqual(['a', 'b']);
    });
  });
});

describe('usePageState', () => {
  beforeEach(() => {
    mockPage = 1;
    mockSetPage.mockClear();
  });

  it('returns current page and setPage function', () => {
    const { result } = renderHook(() => usePageState());

    expect(result.current.page).toBe(1);
    expect(typeof result.current.setPage).toBe('function');
  });

  it('setPage updates the page', () => {
    const { result } = renderHook(() => usePageState());

    act(() => {
      result.current.setPage(5);
    });

    expect(mockSetPage).toHaveBeenCalledWith(5);
  });
});

describe('getPageNumbers', () => {
  it('returns all pages when 7 or fewer', () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageNumbers(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('returns single page array for 1 page', () => {
    expect(getPageNumbers(1, 1)).toEqual([1]);
  });

  it('shows ellipsis at end when on first page with many pages', () => {
    // Current page 1: shows pages 1, 2 (current +/- 1), then ellipsis, then last
    expect(getPageNumbers(1, 10)).toEqual([1, 2, 'ellipsis', 10]);
  });

  it('shows ellipsis at start when on last page with many pages', () => {
    // Current page 10: shows 1, ellipsis, 9 (current - 1), 10
    expect(getPageNumbers(10, 10)).toEqual([1, 'ellipsis', 9, 10]);
  });

  it('shows ellipsis on both sides when in the middle', () => {
    expect(getPageNumbers(5, 10)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
  });

  it('shows correct pages near start boundary', () => {
    // Page 3 is close enough to start - no ellipsis before
    expect(getPageNumbers(3, 10)).toEqual([1, 2, 3, 4, 'ellipsis', 10]);
  });

  it('shows correct pages near end boundary', () => {
    // Page 8 is close enough to end - no ellipsis after
    expect(getPageNumbers(8, 10)).toEqual([1, 'ellipsis', 7, 8, 9, 10]);
  });

  it('handles page 2 correctly', () => {
    expect(getPageNumbers(2, 10)).toEqual([1, 2, 3, 'ellipsis', 10]);
  });

  it('handles page 9 correctly (second to last)', () => {
    expect(getPageNumbers(9, 10)).toEqual([1, 'ellipsis', 8, 9, 10]);
  });
});
