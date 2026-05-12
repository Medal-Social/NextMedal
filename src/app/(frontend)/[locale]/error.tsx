'use client';

import { AlertCircle, RefreshCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function ErrorComponent({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Error');

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="fade-in zoom-in w-full max-w-md animate-in space-y-8 text-center duration-500">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6 ring-8 ring-destructive/5">
            <AlertCircle className="h-12 w-12 text-destructive" strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-bold text-3xl tracking-tight sm:text-4xl">{t('title')}</h1>
          <p className="px-2 text-lg text-muted-foreground leading-relaxed">{t('description')}</p>
        </div>

        {error.digest && (
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 font-mono text-[10px] text-muted-foreground uppercase italic tracking-wider">
            <span className="font-sans font-semibold not-italic opacity-50">{t('errorId')}</span>
            <span className="select-all">{error.digest}</span>
          </div>
        )}

        <div className="flex justify-center pt-4">
          <Button
            variant="default"
            size="lg"
            onClick={() => reset()}
            className="h-12 px-8 font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            {t('tryAgain')}
          </Button>
        </div>

        <p className="pt-8 text-muted-foreground text-xs italic opacity-50">{t('persistsHint')}</p>
      </div>
    </div>
  );
}
