'use client';

import { useTranslations } from 'next-intl';
import * as CookieConsent from 'vanilla-cookieconsent';

interface CookiePreferencesTriggerProps {
  className?: string;
  locale?: string;
}

export default function CookiePreferencesTrigger({ className }: CookiePreferencesTriggerProps) {
  const t = useTranslations('cookies');

  return (
    <button
      type="button"
      onClick={() => CookieConsent.showPreferences()}
      className={className}
      aria-label={t('preferences')}
    >
      {t('preferences')}
    </button>
  );
}
