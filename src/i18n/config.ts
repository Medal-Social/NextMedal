/**
 * Core i18n configuration constants
 * These can be safely imported in both client and server contexts
 */

import type { Locale as DateFnsLocale } from 'date-fns';
import { ar, enUS, nb } from 'date-fns/locale';

/**
 * Language configuration metadata
 */
export interface LocaleMetadata {
  /** Display name shown in UI (e.g., "English", "Norsk", "العربية") */
  title: string;
  /** date-fns locale for date formatting */
  dateLocale: DateFnsLocale;
  /** Text direction (default: 'ltr') */
  dir?: 'ltr' | 'rtl';
}

/**
 * SINGLE SOURCE OF TRUTH: All supported languages and their metadata
 *
 * To add a new language:
 * 1. Import the date-fns locale at the top of this file
 * 2. Add an entry to this object with title, dateLocale, and dir
 * 3. Create a translation file in src/messages/[locale].json
 * 4. Run `pnpm generate:collections`
 *
 * Everything else (sitemap, routing, language switcher, Sanity Studio) updates automatically.
 */
export const LOCALE_CONFIG = {
  en: {
    title: 'English',
    dateLocale: enUS,
    dir: 'ltr',
  },
  nb: {
    title: 'Norsk',
    dateLocale: nb,
    dir: 'ltr',
  },
  ar: {
    title: 'العربية',
    dateLocale: ar,
    dir: 'rtl',
  },
} as const satisfies Record<string, LocaleMetadata>;

/**
 * Type-safe locale keys derived from config
 */
export type SupportedLocale = keyof typeof LOCALE_CONFIG;

/**
 * Default locale for the application
 */
export const DEFAULT_LOCALE: SupportedLocale = 'en';

/**
 * Array of all supported locale codes (derived from config)
 * @deprecated This is maintained for backward compatibility.
 * Consider using LOCALE_CONFIG directly for richer metadata.
 */
export const SUPPORTED_LOCALES = Object.keys(LOCALE_CONFIG) as SupportedLocale[];

/**
 * Get locale metadata by locale code
 */
export function getLocaleMetadata(locale: string): LocaleMetadata | undefined {
  return LOCALE_CONFIG[locale as SupportedLocale];
}

/**
 * Check if a locale is supported
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return locale in LOCALE_CONFIG;
}
