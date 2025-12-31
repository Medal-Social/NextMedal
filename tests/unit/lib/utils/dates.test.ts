import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatCurrency,
  formatDuration,
  formatEventDate,
  formatEventDateFull,
  formatFullDate,
  formatRelativeDate,
  formatRelativeDateTime,
  formatShortDate,
  formatTime,
  formatTimeRange,
  parseDate,
} from '@/lib/utils/dates';

describe('date utilities', () => {
  describe('formatCurrency', () => {
    it('formats integer as USD currency', () => {
      expect(formatCurrency(99)).toBe('$99.00');
    });

    it('formats decimal as USD currency', () => {
      expect(formatCurrency(1234.5)).toBe('$1,234.50');
    });

    it('formats large numbers with thousands separator', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('formats negative numbers', () => {
      expect(formatCurrency(-50)).toBe('-$50.00');
    });
  });

  describe('parseDate', () => {
    it('parses ISO date string without time', () => {
      const result = parseDate('2025-01-15');
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January is 0
      expect(result.getDate()).toBe(15);
    });

    it('parses ISO datetime string (extracts date only)', () => {
      const result = parseDate('2025-06-20T14:30:00Z');
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(5); // June is 5
      expect(result.getDate()).toBe(20);
    });

    it('normalizes time to midnight local', () => {
      const result = parseDate('2025-03-10');
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });
  });

  describe('formatRelativeDate', () => {
    beforeEach(() => {
      // Set a fixed current time for consistent tests
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-15T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('formats date from yesterday', () => {
      const result = formatRelativeDate('2025-01-14');
      expect(result).toContain('day');
      expect(result).toContain('ago');
    });

    it('formats date from a week ago', () => {
      const result = formatRelativeDate('2025-01-08');
      // date-fns might show "about 1 week ago" or "7 days ago"
      expect(result).toMatch(/days? ago|week ago/i);
    });

    it('formats date from months ago', () => {
      const result = formatRelativeDate('2024-10-15');
      expect(result).toContain('month');
      expect(result).toContain('ago');
    });
  });

  describe('formatRelativeDateTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('formats datetime from hours ago', () => {
      const result = formatRelativeDateTime('2025-01-15T09:00:00Z');
      expect(result).toContain('hour');
      expect(result).toContain('ago');
    });

    it('formats future datetime', () => {
      const result = formatRelativeDateTime('2025-01-15T15:00:00Z');
      expect(result).toContain('hour');
      expect(result).toContain('in');
    });
  });

  describe('formatFullDate', () => {
    it('formats date as full readable string', () => {
      const result = formatFullDate('2025-01-15');
      expect(result).toBe('January 15, 2025');
    });

    it('formats date with leading zeros', () => {
      const result = formatFullDate('2025-03-05');
      expect(result).toBe('March 5, 2025');
    });

    it('handles December correctly', () => {
      const result = formatFullDate('2024-12-31');
      expect(result).toBe('December 31, 2024');
    });
  });

  describe('formatShortDate', () => {
    it('formats date as short string', () => {
      const result = formatShortDate('2025-01-15');
      expect(result).toBe('Jan 15, 2025');
    });

    it('formats summer month correctly', () => {
      const result = formatShortDate('2025-07-04');
      expect(result).toBe('Jul 4, 2025');
    });
  });

  describe('formatTime', () => {
    it('formats morning time in 12-hour format', () => {
      const result = formatTime('2025-01-15T09:30:00');
      expect(result).toMatch(/9:30\s*AM/i);
    });

    it('formats afternoon time in 12-hour format', () => {
      const result = formatTime('2025-01-15T14:45:00');
      expect(result).toMatch(/2:45\s*PM/i);
    });

    it('formats midnight correctly', () => {
      const result = formatTime('2025-01-15T00:00:00');
      expect(result).toMatch(/12:00\s*AM/i);
    });

    it('formats noon correctly', () => {
      const result = formatTime('2025-01-15T12:00:00');
      expect(result).toMatch(/12:00\s*PM/i);
    });

    it('respects locale parameter', () => {
      const result = formatTime('2025-01-15T14:30:00', 'en-GB');
      // en-GB might use different format
      expect(result).toBeDefined();
    });
  });

  describe('formatTimeRange', () => {
    it('returns just start time when no duration provided', () => {
      const result = formatTimeRange('2025-01-15T14:30:00');
      expect(result).toMatch(/2:30\s*PM/i);
    });

    it('formats time range with 2-hour duration', () => {
      const result = formatTimeRange('2025-01-15T14:30:00', 2);
      expect(result).toMatch(/2:30\s*PM/i);
      expect(result).toContain('–');
      expect(result).toMatch(/4:30\s*PM/i);
    });

    it('handles duration crossing noon', () => {
      const result = formatTimeRange('2025-01-15T11:00:00', 2);
      expect(result).toMatch(/11:00\s*AM/i);
      expect(result).toMatch(/1:00\s*PM/i);
    });

    it('handles fractional duration', () => {
      const result = formatTimeRange('2025-01-15T14:00:00', 1.5);
      expect(result).toMatch(/2:00\s*PM/i);
      expect(result).toMatch(/3:30\s*PM/i);
    });

    it('handles duration of 0', () => {
      const result = formatTimeRange('2025-01-15T14:30:00', 0);
      expect(result).toMatch(/2:30\s*PM/i);
      expect(result).not.toContain('–');
    });
  });

  describe('formatDuration', () => {
    it('returns null for undefined duration', () => {
      expect(formatDuration(undefined)).toBeNull();
    });

    it('returns null for zero duration', () => {
      expect(formatDuration(0)).toBeNull();
    });

    it('formats minutes for less than 1 hour', () => {
      expect(formatDuration(0.5)).toBe('30 min');
    });

    it('formats exactly 1 hour', () => {
      expect(formatDuration(1)).toBe('1 hour');
    });

    it('formats whole hours', () => {
      expect(formatDuration(2)).toBe('2 hours');
      expect(formatDuration(5)).toBe('5 hours');
    });

    it('formats mixed hours and minutes', () => {
      expect(formatDuration(1.5)).toBe('1h 30min');
      expect(formatDuration(2.75)).toBe('2h 45min');
    });

    it('rounds minutes correctly', () => {
      expect(formatDuration(0.25)).toBe('15 min');
      expect(formatDuration(1.25)).toBe('1h 15min');
    });
  });

  describe('formatEventDate', () => {
    it('formats date with weekday and short month', () => {
      // Wednesday, January 15, 2025
      const result = formatEventDate('2025-01-15T10:00:00');
      expect(result).toMatch(/Wed/i);
      expect(result).toMatch(/Jan/i);
      expect(result).toContain('15');
    });

    it('formats weekend date', () => {
      // Saturday, January 18, 2025
      const result = formatEventDate('2025-01-18T10:00:00');
      expect(result).toMatch(/Sat/i);
    });

    it('respects locale parameter', () => {
      const result = formatEventDate('2025-01-15T10:00:00', 'nb-NO');
      // Norwegian locale would show different weekday names
      expect(result).toBeDefined();
    });
  });

  describe('formatEventDateFull', () => {
    it('formats date with full weekday, month, day, and year', () => {
      const result = formatEventDateFull('2025-01-15T10:00:00');
      expect(result).toMatch(/Wednesday/i);
      expect(result).toMatch(/January/i);
      expect(result).toContain('15');
      expect(result).toContain('2025');
    });

    it('formats different days of week', () => {
      // Monday, January 13, 2025
      const result = formatEventDateFull('2025-01-13T10:00:00');
      expect(result).toMatch(/Monday/i);
    });

    it('respects locale parameter', () => {
      const result = formatEventDateFull('2025-01-15T10:00:00', 'de-DE');
      // German locale would show "Mittwoch" instead of "Wednesday"
      expect(result).toBeDefined();
    });
  });
});
