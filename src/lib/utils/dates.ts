import { format, formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { DEFAULT_LOCALE, getLocaleMetadata } from '@/i18n/config';

/**
 * Formats a number as a USD currency string.
 * @param value - The number to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 * @example
 * formatCurrency(1234.5) // "$1,234.50"
 * formatCurrency(99) // "$99.00"
 */
export const { format: formatCurrency } = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

/**
 * Parses a date string into a Date object.
 * Handles both ISO strings with time and date-only strings.
 */
export function parseDate(value: string): Date {
  const dateStr = value.includes('T') ? value.split('T')[0] : value;
  return new Date(`${dateStr}T00:00:00`);
}

/**
 * Get date-fns locale from locale string
 */
function getDateFnsLocale(locale?: string) {
  return getLocaleMetadata(locale || DEFAULT_LOCALE)?.dateLocale ?? enUS;
}

/**
 * Formats a date as a relative time string like "2 days ago" or "3 months ago".
 */
export function formatRelativeDate(value: string, locale?: string): string {
  return formatDistanceToNow(parseDate(value), {
    addSuffix: true,
    locale: getDateFnsLocale(locale),
  });
}

/**
 * Formats a datetime as a relative time string like "in 3 days" or "2 hours ago".
 * Preserves the time component for more accurate relative times.
 */
export function formatRelativeDateTime(value: string, locale?: string): string {
  return formatDistanceToNow(new Date(value), {
    addSuffix: true,
    locale: getDateFnsLocale(locale),
  });
}

/**
 * Formats a date as a full readable string like "January 15, 2025".
 */
export function formatFullDate(value: string, locale?: string): string {
  return format(parseDate(value), 'MMMM d, yyyy', { locale: getDateFnsLocale(locale) });
}

/**
 * Formats a date as a short string like "Jan 15, 2025".
 */
export function formatShortDate(value: string, locale?: string): string {
  return format(parseDate(value), 'MMM d, yyyy', { locale: getDateFnsLocale(locale) });
}

/**
 * Formats a time from an ISO datetime string like "2:30 PM".
 */
export function formatTime(value: string, locale = 'en-US'): string {
  return new Date(value).toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a time range from start time and duration in hours.
 * Returns something like "2:30 PM – 4:00 PM".
 */
export function formatTimeRange(
  startDateTime: string,
  durationHours?: number,
  locale = 'en-US'
): string {
  const startTime = formatTime(startDateTime, locale);
  if (!durationHours) return startTime;

  const startDate = new Date(startDateTime);
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
  const endTime = endDate.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${startTime} – ${endTime}`;
}

/**
 * Formats a duration in hours to a human-readable string.
 * Returns something like "1 hour", "2 hours", "30 min", or "1h 30min".
 */
export function formatDuration(hours?: number): string | null {
  if (!hours) return null;
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours === 1) return '1 hour';
  if (hours % 1 === 0) return `${hours} hours`;
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours % 1) * 60);
  return `${wholeHours}h ${minutes}min`;
}

/**
 * Formats a date with day of week for events like "Mon, Jan 15".
 */
export function formatEventDate(value: string, locale = 'en-US'): string {
  return new Date(value).toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a full event date with year like "Monday, January 15, 2025".
 */
export function formatEventDateFull(value: string, locale = 'en-US'): string {
  return new Date(value).toLocaleDateString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
