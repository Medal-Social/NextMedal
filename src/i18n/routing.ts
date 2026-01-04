import { ar, enUS, nb } from 'date-fns/locale';
import { defineRouting } from 'next-intl/routing';
import { DEFAULT_LOCALE } from './config';

export const localeConfig = {
  en: { title: 'English', dateLocale: enUS },
  nb: { title: 'Norsk', dateLocale: nb },
  ar: { title: 'العربية', dateLocale: ar },
} as const;

export type Locale = keyof typeof localeConfig;

export const routing = defineRouting({
  locales: Object.keys(localeConfig) as Locale[],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
  localeDetection: false,
});
