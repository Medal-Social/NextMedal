'use client';

import * as Sentry from '@sentry/nextjs';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { AlertCircle, Home, RefreshCcw } from 'lucide-react';
import { useEffect } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/index';
import '@/styles/globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-background text-foreground flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-6 ring-8 ring-destructive/5">
              <AlertCircle className="w-12 h-12 text-destructive" strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Something went wrong</h1>
            <p className="text-muted-foreground text-lg leading-relaxed px-2">
              We encountered an unexpected error. Our team has been notified and we're working on a
              fix.
            </p>
          </div>

          {error.digest && (
            <div className="inline-flex items-center gap-2 py-1.5 px-3 bg-muted rounded-full text-[10px] font-mono text-muted-foreground uppercase tracking-wider italic">
              <span className="font-sans font-semibold not-italic">Error ID:</span>
              <span className="select-all">{error.digest}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              variant="default"
              size="lg"
              onClick={() => reset()}
              className="w-full sm:w-auto h-12 px-8 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try again
            </Button>
            <a
              href="/"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'w-full sm:w-auto h-12 px-8 text-base font-semibold transition-all hover:bg-muted/50'
              )}
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </a>
          </div>

          <p className="text-xs text-muted-foreground pt-8 italic">
            If the problem persists, please contact support.
          </p>
        </div>
      </body>
    </html>
  );
}
