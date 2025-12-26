/**
 * Header configuration constants
 * Centralized configuration for header behavior and responsive breakpoints
 */

/** Scroll threshold in pixels before header background changes */
export const SCROLL_THRESHOLD = 10;

/** Desktop breakpoint in pixels (matches Tailwind's lg breakpoint) */
export const DESKTOP_BREAKPOINT = 1024;

/** Animation durations in milliseconds */
export const ANIMATION_DURATION = {
  /** Header background transition */
  headerTransition: 200,
  /** Mobile menu slide animation */
  mobileMenuSlide: 500,
  /** Stagger delay between menu items */
  menuItemStagger: 50,
  /** Delay before menu items start animating */
  menuItemsDelay: 200,
  /** Individual menu item animation */
  menuItemAnimation: 300,
} as const;

/** Animation easing curves */
export const ANIMATION_EASING = {
  /** Smooth easing for mobile menu */
  mobileMenu: [0.32, 0.72, 0, 1] as const,
} as const;

/** Z-index values for header layers */
export const Z_INDEX = {
  /** Main header */
  header: 50,
  /** Mobile menu toggle button */
  mobileToggle: 101,
  /** Mobile navigation overlay */
  mobileNavigation: 40,
} as const;
