'use client';

import * as CookieConsent from 'vanilla-cookieconsent';

interface CookiePreferencesTriggerProps {
  className?: string;
  locale?: string;
}

export default function CookiePreferencesTrigger({
  className,
  locale = 'en',
}: CookiePreferencesTriggerProps) {
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
