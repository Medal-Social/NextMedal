import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'nb'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false,
});
