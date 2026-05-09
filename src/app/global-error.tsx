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
      <body className="flex min-h-screen items-center justify-center bg-background p-4 font-sans text-foreground antialiased">
        <div className="fade-in zoom-in w-full max-w-md animate-in space-y-8 text-center duration-500">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-6 ring-8 ring-destructive/5">
              <AlertCircle className="h-12 w-12 text-destructive" strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-bold text-3xl tracking-tight sm:text-4xl">Something went wrong</h1>
            <p className="px-2 text-lg text-muted-foreground leading-relaxed">
              We encountered an unexpected error. Our team has been notified and we're working on a
              fix.
            </p>
          </div>

          {error.digest && (
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 font-mono text-[10px] text-muted-foreground uppercase italic tracking-wider">
              <span className="font-sans font-semibold not-italic">Error ID:</span>
              <span className="select-all">{error.digest}</span>
            </div>
          )}

          <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row">
            <Button
              variant="default"
              size="lg"
              onClick={() => reset()}
              className="h-12 w-full px-8 font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <a
              href="/"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'h-12 w-full px-8 font-semibold text-base transition-all hover:bg-muted/50 sm:w-auto'
              )}
            >
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </a>
          </div>

          <p className="pt-8 text-muted-foreground text-xs italic">
            If the problem persists, please contact support.
          </p>
        </div>
      </body>
    </html>
  );
}
