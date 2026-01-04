/**
 * Core i18n configuration constants
 * These can be safely imported in both client and server contexts
 */

export const DEFAULT_LOCALE = 'en' as const;

export const SUPPORTED_LOCALES = ['en', 'nb', 'ar'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
