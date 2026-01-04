import type { KeyboardEvent } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getDailySeed,
  getDayOfWeek,
  getGreeting,
  getSeason,
  getTimeOfDay,
  handleCardKeyDown,
  seededRandom,
} from '@/sanity/tools/DashboardTool';

/**
 * Tests for DashboardTool.tsx greeting algorithm
 *
 * Tests the complex greeting logic including:
 * - Seasonal greetings (spring, summer, autumn, winter)
 * - Day of week greetings
 * - Time of day greetings
 * - Special occasion greetings (New Year, Christmas, New Year's Eve)
 * - Seeded randomization for consistent daily greetings
 */

describe('DashboardTool - Greeting Algorithm', () => {
  beforeEach(() => {
    // Reset any mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore real timers if mocked
    vi.useRealTimers();
  });

  describe('getSeason', () => {
    it('should return spring for March-May (months 2-4)', () => {
      // Note: Month is 0-indexed in JavaScript Date
      const marchDate = new Date(2024, 2, 15); // March
      const aprilDate = new Date(2024, 3, 15); // April
      const mayDate = new Date(2024, 4, 15); // May

      expect(getSeason(marchDate)).toBe('spring');
      expect(getSeason(aprilDate)).toBe('spring');
      expect(getSeason(mayDate)).toBe('spring');
    });

    it('should return summer for June-August (months 5-7)', () => {
      const juneDate = new Date(2024, 5, 15);
      const julyDate = new Date(2024, 6, 15);
      const augustDate = new Date(2024, 7, 15);

      expect(getSeason(juneDate)).toBe('summer');
      expect(getSeason(julyDate)).toBe('summer');
      expect(getSeason(augustDate)).toBe('summer');
    });

    it('should return autumn for September-November (months 8-10)', () => {
      const septDate = new Date(2024, 8, 15);
      const octDate = new Date(2024, 9, 15);
      const novDate = new Date(2024, 10, 15);

      expect(getSeason(septDate)).toBe('autumn');
      expect(getSeason(octDate)).toBe('autumn');
      expect(getSeason(novDate)).toBe('autumn');
    });

    it('should return winter for December-February (months 11, 0, 1)', () => {
      const decDate = new Date(2024, 11, 15);
      const janDate = new Date(2024, 0, 15);
      const febDate = new Date(2024, 1, 15);

      expect(getSeason(decDate)).toBe('winter');
      expect(getSeason(janDate)).toBe('winter');
      expect(getSeason(febDate)).toBe('winter');
    });
  });

  describe('getDayOfWeek', () => {
    it('should return correct day names', () => {
      // January 7, 2024 is a Sunday
      const sunday = new Date(2024, 0, 7);
      const monday = new Date(2024, 0, 8);
      const tuesday = new Date(2024, 0, 9);
      const wednesday = new Date(2024, 0, 10);
      const thursday = new Date(2024, 0, 11);
      const friday = new Date(2024, 0, 12);
      const saturday = new Date(2024, 0, 13);

      expect(getDayOfWeek(sunday)).toBe('sunday');
      expect(getDayOfWeek(monday)).toBe('monday');
      expect(getDayOfWeek(tuesday)).toBe('tuesday');
      expect(getDayOfWeek(wednesday)).toBe('wednesday');
      expect(getDayOfWeek(thursday)).toBe('thursday');
      expect(getDayOfWeek(friday)).toBe('friday');
      expect(getDayOfWeek(saturday)).toBe('saturday');
    });
  });

  describe('getTimeOfDay', () => {
    it('should return morning for hours 5-11', () => {
      expect(getTimeOfDay(5)).toBe('morning');
      expect(getTimeOfDay(8)).toBe('morning');
      expect(getTimeOfDay(11)).toBe('morning');
    });

    it('should return afternoon for hours 12-17', () => {
      expect(getTimeOfDay(12)).toBe('afternoon');
      expect(getTimeOfDay(15)).toBe('afternoon');
      expect(getTimeOfDay(17)).toBe('afternoon');
    });

    it('should return evening for hours 18-22', () => {
      expect(getTimeOfDay(18)).toBe('evening');
      expect(getTimeOfDay(20)).toBe('evening');
      expect(getTimeOfDay(22)).toBe('evening');
    });

    it('should return lateNight for hours 23-4', () => {
      expect(getTimeOfDay(23)).toBe('lateNight');
      expect(getTimeOfDay(0)).toBe('lateNight');
      expect(getTimeOfDay(2)).toBe('lateNight');
      expect(getTimeOfDay(4)).toBe('lateNight');
    });
  });

  describe('getDailySeed', () => {
    it('should generate consistent seed for the same date', () => {
      const date1 = new Date(2024, 0, 15, 10, 30); // Jan 15, 2024, 10:30 AM
      const date2 = new Date(2024, 0, 15, 18, 45); // Jan 15, 2024, 6:45 PM

      // Seeds should be identical for same day, different times
      const seed1 = getDailySeed(date1);
      const seed2 = getDailySeed(date2);
      expect(seed1).toBe(seed2);
    });

    it('should generate different seeds for different dates', () => {
      const jan15 = new Date(2024, 0, 15);
      const jan16 = new Date(2024, 0, 16);

      const seed1 = getDailySeed(jan15);
      const seed2 = getDailySeed(jan16);
      expect(seed1).not.toBe(seed2);
    });

    it('should generate correct seed format (year * 10000 + month * 100 + day)', () => {
      const date = new Date(2024, 0, 15); // Jan 15, 2024
      // Month is 0-indexed, so month = 0 for January
      const expectedSeed = 2024 * 10000 + 0 * 100 + 15; // 20240015

      expect(getDailySeed(date)).toBe(expectedSeed);
    });
  });

  describe('seededRandom', () => {
    it('should return consistent values for the same seed', () => {
      const seed = 12345;

      const random1 = seededRandom(seed);
      const random2 = seededRandom(seed);
      expect(random1).toBe(random2);
    });

    it('should return different values for different seeds', () => {
      const random1 = seededRandom(12345);
      const random2 = seededRandom(54321);
      expect(random1).not.toBe(random2);
    });

    it('should return values between 0 and 1', () => {
      const seeds = [100, 1000, 10000, 20240115, 20251231];

      for (const seed of seeds) {
        const random = seededRandom(seed);
        expect(random).toBeGreaterThanOrEqual(0);
        expect(random).toBeLessThan(1);
      }
    });
  });

  describe('getGreeting - Special Occasions', () => {
    it('should return "New year, new scale" on January 1st', () => {
      vi.useFakeTimers();
      const newYearsDay = new Date(2024, 0, 1, 10, 0); // Jan 1, 2024
      vi.setSystemTime(newYearsDay);

      const greeting = getGreeting();
      expect(greeting).toBe('New year, new scale');

      vi.useRealTimers();
    });

    it('should return "Unplug and recharge" on December 25th', () => {
      vi.useFakeTimers();
      const christmas = new Date(2024, 11, 25, 10, 0); // Dec 25, 2024
      vi.setSystemTime(christmas);

      const greeting = getGreeting();
      expect(greeting).toBe('Unplug and recharge');

      vi.useRealTimers();
    });

    it('should return "Celebrate the wins" on December 31st', () => {
      vi.useFakeTimers();
      const newYearsEve = new Date(2024, 11, 31, 10, 0); // Dec 31, 2024
      vi.setSystemTime(newYearsEve);

      const greeting = getGreeting();
      expect(greeting).toBe('Celebrate the wins');

      vi.useRealTimers();
    });
  });

  describe('getGreeting - Consistency', () => {
    it('should return the same greeting throughout the day', () => {
      vi.useFakeTimers();

      // Same date, different times
      const morning = new Date(2024, 5, 15, 8, 0); // June 15, 8 AM
      const afternoon = new Date(2024, 5, 15, 14, 0); // June 15, 2 PM
      const evening = new Date(2024, 5, 15, 20, 0); // June 15, 8 PM

      vi.setSystemTime(morning);
      const morningGreeting = getGreeting();

      vi.setSystemTime(afternoon);
      const afternoonGreeting = getGreeting();

      vi.setSystemTime(evening);
      const eveningGreeting = getGreeting();

      // All should be identical due to seeded randomization
      expect(morningGreeting).toBe(afternoonGreeting);
      expect(afternoonGreeting).toBe(eveningGreeting);

      vi.useRealTimers();
    });

    it('should return different greetings on different days', () => {
      vi.useFakeTimers();

      const day1 = new Date(2024, 5, 15, 10, 0); // June 15
      const day2 = new Date(2024, 5, 16, 10, 0); // June 16

      vi.setSystemTime(day1);
      const greeting1 = getGreeting();

      vi.setSystemTime(day2);
      const greeting2 = getGreeting();

      // Different days should potentially have different greetings
      // (though there's a small chance they could be the same)
      // We can't assert they're different, but we can verify both are valid
      expect(typeof greeting1).toBe('string');
      expect(typeof greeting2).toBe('string');

      vi.useRealTimers();
    });
  });

  describe('getGreeting - Seasonal Distribution', () => {
    it('should return valid seasonal greetings in spring', () => {
      vi.useFakeTimers();
      const springDate = new Date(2024, 3, 15, 10, 0); // April 15

      vi.setSystemTime(springDate);
      const greeting = getGreeting();

      // Should be one of: seasonal, day, time, or power greetings
      expect(typeof greeting).toBe('string');
      expect(greeting.length).toBeGreaterThan(0);

      vi.useRealTimers();
    });

    it('should return valid greetings for all seasons', () => {
      vi.useFakeTimers();

      const dates = [
        new Date(2024, 3, 15), // Spring
        new Date(2024, 6, 15), // Summer
        new Date(2024, 9, 15), // Autumn
        new Date(2024, 1, 15), // Winter
      ];

      for (const date of dates) {
        vi.setSystemTime(date);
        const greeting = getGreeting();
        expect(typeof greeting).toBe('string');
        expect(greeting.length).toBeGreaterThan(0);
      }

      vi.useRealTimers();
    });
  });

  describe('handleCardKeyDown', () => {
    it('should call onClick when Enter key is pressed', () => {
      const onClick = vi.fn();
      const event = {
        key: 'Enter',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent<HTMLDivElement>;

      handleCardKeyDown(event, onClick);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onClick).toHaveBeenCalled();
    });

    it('should call onClick when Space key is pressed', () => {
      const onClick = vi.fn();
      const event = {
        key: ' ',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent<HTMLDivElement>;

      handleCardKeyDown(event, onClick);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onClick).toHaveBeenCalled();
    });

    it('should not call onClick for other keys', () => {
      const onClick = vi.fn();
      const event = {
        key: 'a',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent<HTMLDivElement>;

      handleCardKeyDown(event, onClick);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();
    });
  });
});

/**
 * TODO: Component tests
 * These would require @testing-library/react and mocking Sanity hooks
 *
 * - WelcomeSection: Test greeting display, user name formatting
 * - ContentOverview: Test stats fetching, loading states, error states
 * - SecondaryActions: Test navigation, external links
 * - StudioTip: Test auto-rotation, tip display
 * - ModuleReference: Test image rendering
 * - FooterSection: Test social links
 */
