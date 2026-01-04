import { defineRouting } from 'next-intl/routing';
import { DEFAULT_LOCALE, LOCALE_CONFIG, type SupportedLocale } from './config';

/**
 * @deprecated Use LOCALE_CONFIG from @/i18n/config instead.
 * This export is maintained for backward compatibility.
 */
export const localeConfig = LOCALE_CONFIG;

/**
 * @deprecated Use SupportedLocale from @/i18n/config instead.
 * This type alias is maintained for backward compatibility.
 */
export type Locale = SupportedLocale;

/**
 * Next-intl routing configuration
 * Automatically derived from LOCALE_CONFIG in @/i18n/config
 */
export const routing = defineRouting({
  locales: Object.keys(LOCALE_CONFIG) as SupportedLocale[],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
  localeDetection: false,
});
