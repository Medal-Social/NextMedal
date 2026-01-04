/**
 * Get Language Options for Sanity Schema
 * @description Creates Sanity-compatible language options from centralized i18n config
 * @version 1.0.0
 * @lastUpdated 2026-01-04
 */

import { LOCALE_CONFIG } from '@/i18n/config';

/**
 * Generates language options for Sanity schema fields from the centralized i18n config.
 * This ensures languages are defined in one place only (src/i18n/config.ts).
 *
 * @returns Array of language options in Sanity's expected format
 *
 * @example
 * ```typescript
 * import { getLanguageOptions } from '@/sanity/lib/getLanguageOptions';
 *
 * defineField({
 *   name: 'language',
 *   type: 'string',
 *   options: {
 *     list: getLanguageOptions(),
 *     layout: 'radio',
 *   },
 * })
 * ```
 */
export function getLanguageOptions() {
  return Object.entries(LOCALE_CONFIG).map(([value, config]) => ({
    title: config.title,
    value,
  }));
}
