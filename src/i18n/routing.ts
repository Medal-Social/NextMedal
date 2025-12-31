import { defineRouting } from 'next-intl/routing';

export const localeConfig = {
  en: { title: 'English' },
  nb: { title: 'Norsk' },
  ar: { title: 'العربية' },
} as const;

export type Locale = keyof typeof localeConfig;

export const routing = defineRouting({
  locales: Object.keys(localeConfig) as Locale[],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false,
});
