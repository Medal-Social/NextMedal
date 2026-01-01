import { getSiteOptional } from '@/sanity/lib/fetch';
import CookieConsent from './CookieConsent';

interface CookieConsentWrapperProps {
  locale: string;
}

export default async function CookieConsentWrapper({ locale }: CookieConsentWrapperProps) {
  const site = await getSiteOptional();

  if (!site?.cookieConsent) {
    return null;
  }

  return <CookieConsent config={site.cookieConsent} locale={locale} />;
}
