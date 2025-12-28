'use client';

import * as Sentry from '@sentry/nextjs';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorComponent({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Error');

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6 ring-8 ring-destructive/5">
            <AlertCircle className="w-12 h-12 text-destructive" strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('title')}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed px-2">{t('description')}</p>
        </div>

        {error.digest && (
          <div className="inline-flex items-center gap-2 py-1.5 px-3 bg-muted rounded-full text-[10px] font-mono text-muted-foreground uppercase tracking-wider italic">
            <span className="opacity-50 font-sans font-semibold not-italic">{t('errorId')}</span>
            <span className="select-all">{error.digest}</span>
          </div>
        )}

        <div className="flex justify-center pt-4">
          <Button
            variant="default"
            size="lg"
            onClick={() => reset()}
            className="h-12 px-8 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            {t('tryAgain')}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground pt-8 opacity-50 italic">{t('persistsHint')}</p>
      </div>
    </div>
  );
}
