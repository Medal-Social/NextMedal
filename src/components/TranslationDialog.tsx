'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { routing } from '@/i18n/routing';

const STORAGE_KEY = 'translation-request';

interface TranslationRequest {
  targetLocale: string;
  targetLocaleName: string;
  availableLocales?: Array<{ locale: string; url: string }>;
  timestamp: number;
}

/**
 * Get localized name for a locale code
 */
function getLocaleName(locale: string): string {
  const localeConfig: Record<string, string> = {
    en: 'English',
    nb: 'Norsk',
    ar: 'العربية',
  };
  return localeConfig[locale] || locale;
}

export function TranslationDialog() {
  const [request, setRequest] = useState<TranslationRequest | null>(null);
  const router = useRouter();
  const t = useTranslations('TranslationDialog');

  useEffect(() => {
    const checkForRequest = () => {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored) as TranslationRequest;
          // Only show if less than 10 seconds old (prevent stale dialogs)
          const isRecent = Date.now() - data.timestamp < 10000;
          if (isRecent) {
            setRequest(data);
          } else {
            sessionStorage.removeItem(STORAGE_KEY);
          }
        } catch {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      }
    };

    // Check immediately
    checkForRequest();

    // Listen for custom event (fired by language switcher)
    window.addEventListener('translation-request', checkForRequest);

    return () => window.removeEventListener('translation-request', checkForRequest);
  }, []);

  const handleGoToHome = () => {
    if (!request) return;
    const homeUrl =
      request.targetLocale === routing.defaultLocale ? '/' : `/${request.targetLocale}`;
    sessionStorage.removeItem(STORAGE_KEY);
    setRequest(null);
    router.push(homeUrl);
  };

  const handleStay = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setRequest(null);
  };

  if (!request) return null;

  return (
    <AlertDialog open={!!request} onOpenChange={(open) => !open && handleStay()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('description', { locale: request.targetLocaleName })}

            {/* Show available locales with quick-switch buttons */}
            {request.availableLocales && request.availableLocales.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">{t('availableIn')}</p>
                <div className="flex flex-wrap gap-2">
                  {request.availableLocales.map(({ locale, url }) => (
                    <Button
                      key={locale}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        sessionStorage.removeItem(STORAGE_KEY);
                        setRequest(null);
                        router.push(url);
                      }}
                    >
                      {getLocaleName(locale)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleStay}>{t('stay')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleGoToHome}>
            {t('goToHome', { locale: request.targetLocaleName })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
