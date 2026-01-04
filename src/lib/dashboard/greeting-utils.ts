/**
 * Greeting Algorithm Utilities
 *
 * Provides context-aware greetings for the Sanity Studio dashboard.
 * Uses a seeded random number generator to ensure consistent greetings throughout the day.
 */

// ============================================================================
// Greeting Data
// ============================================================================

export const SPECIAL_OCCASION_GREETINGS = [
  {
    check: (date: Date) => date.getMonth() === 0 && date.getDate() === 1,
    message: 'New year, new scale',
  },
  {
    check: (date: Date) => date.getMonth() === 11 && date.getDate() === 25,
    message: 'Unplug and recharge',
  },
  {
    check: (date: Date) => date.getMonth() === 11 && date.getDate() === 31,
    message: 'Celebrate the wins',
  },
];

export const SEASONAL_GREETINGS: Record<string, string[]> = {
  spring: [
    'Q2 growth mode',
    'Planting seeds for scale',
    'Spring into action',
    'Fresh quarter, fresh strategy',
  ],
  summer: ['Heat up the growth', 'Summer shipping', 'Build momentum', 'Keep the pace'],
  autumn: ['Harvest the results', 'Q4 focus', 'Finish strong', 'Push to year-end'],
  winter: [
    'Cool head, hot strategy',
    'Year-end sprint',
    'Strategic planning mode',
    'Set up for success',
  ],
};

export const DAY_GREETINGS: Record<string, string[]> = {
  monday: ['Set the strategy', 'Ready to ship?', 'Start the week strong', 'Monday momentum'],
  tuesday: ['Execute the plan', 'Build and iterate', 'Keep shipping', 'Focus on impact'],
  wednesday: ['Mid-week momentum', 'Keep scaling', 'Halfway to the weekend', 'Sprint continues'],
  thursday: ['Almost there', 'Maintain velocity', 'Thursday grind', 'Push through'],
  friday: ['Ship it and quit it?', 'Close the week strong', 'Final push', 'Wrap up the wins'],
  saturday: ['Rest is productive too', 'Weekend mode', 'Recharge for growth', 'Take a break'],
  sunday: ['Recharge for growth', 'Prep for the week', 'Sunday planning', 'Rest and strategize'],
};

export const TIME_GREETINGS: Record<string, string[]> = {
  morning: ['Rise and scale', 'Start smart', 'Morning momentum', 'Fresh start'],
  afternoon: ['Deep work mode', 'Focus on impact', 'Afternoon execution', 'Keep building'],
  evening: ['Wrapping up the wins?', 'Prepare for tomorrow', 'Evening review', 'Close it out'],
  lateNight: [
    'Quiet hours, big moves',
    'Night owl mode',
    'Burning the midnight oil?',
    'Late night hustle',
  ],
};

export const POWER_GREETINGS = [
  'Ready to scale?',
  'Do more with less',
  'Focus on growth',
  'Ship 10x faster',
  'What are we shipping today?',
  'Work smarter',
  "Let's build",
  'Zero chaos',
  'Execute with precision',
  'Scale faster',
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getSeason(date: Date): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export function getDayOfWeek(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

export function getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'lateNight' {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 23) return 'evening';
  return 'lateNight';
}

/**
 * Generate a stable daily seed based on the date to make greetings consistent throughout the day
 */
export function getDailySeed(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return year * 10000 + month * 100 + day;
}

/**
 * Seeded random number generator for consistent daily greetings
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Get a context-aware greeting based on date, time, and season.
 * Uses seeded randomization to ensure consistent greetings throughout the day.
 */
export function getGreeting(): string {
  const now = new Date();
  const hour = now.getHours();
  const dailySeed = getDailySeed(now);

  // Priority 1: Special Occasions (always shown)
  for (const occasion of SPECIAL_OCCASION_GREETINGS) {
    if (occasion.check(now)) {
      return occasion.message;
    }
  }

  // Use seeded random for consistent greetings throughout the day
  const random = seededRandom(dailySeed);

  // Priority 2: Season (60% chance)
  if (random < 0.6) {
    const season = getSeason(now);
    const seasonalGreetings = SEASONAL_GREETINGS[season];
    const index = Math.floor(seededRandom(dailySeed + 1) * seasonalGreetings.length);
    return seasonalGreetings[index];
  }

  // Priority 3: Day of Week (25% chance)
  if (random < 0.85) {
    const day = getDayOfWeek(now);
    const dayGreetings = DAY_GREETINGS[day];
    const index = Math.floor(seededRandom(dailySeed + 2) * dayGreetings.length);
    return dayGreetings[index];
  }

  // Priority 4: Time of Day (10% chance)
  if (random < 0.95) {
    const timeOfDay = getTimeOfDay(hour);
    const timeGreetings = TIME_GREETINGS[timeOfDay];
    const index = Math.floor(seededRandom(dailySeed + 3) * timeGreetings.length);
    return timeGreetings[index];
  }

  // Fallback: Power Greetings (5% chance)
  const index = Math.floor(seededRandom(dailySeed + 4) * POWER_GREETINGS.length);
  return POWER_GREETINGS[index];
}
