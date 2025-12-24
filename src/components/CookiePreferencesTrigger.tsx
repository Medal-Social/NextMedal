'use client';

import { useLocale } from 'next-intl';
import * as CookieConsent from 'vanilla-cookieconsent';

export default function CookiePreferencesTrigger({ className }: { className?: string }) {
  const locale = useLocale();

  const label = locale === 'nb' ? 'Informasjonskapsler' : 'Cookie Preferences';

  return (
    <button
      type="button"
      onClick={() => CookieConsent.showPreferences()}
      className={className}
      aria-label={label}
    >
      {label}
    </button>
  );
}
