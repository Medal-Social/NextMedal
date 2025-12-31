'use client';

import { ExternalLink, Eye } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/index';

const BANNER_HEIGHT = 56; // Height in pixels

export default function DraftModeControls() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const t = useTranslations('DraftMode');

  useEffect(() => {
    setMounted(true);

    // Add padding to body to prevent banner from covering footer
    const originalPaddingBottom = document.body.style.paddingBottom;
    document.body.style.paddingBottom = `${BANNER_HEIGHT}px`;

    return () => {
      // Restore original padding on unmount
      document.body.style.paddingBottom = originalPaddingBottom;
    };
  }, []);

  const exitPreview = useCallback(() => {
    startTransition(() => {
      window.location.href = `/api/draft-mode/disable?slug=${pathname}`;
    });
  }, [pathname]);

  // Don't render until mounted (for portal)
  if (!mounted) return null;

  const banner = (
    // biome-ignore lint/a11y/useSemanticElements: No semantic element exists for status banners, role="status" is correct
    <div
      className={cn(
        // Position
        'fixed bottom-0 inset-x-0 z-[9999]',
        // Layout
        'flex items-center justify-center',
        // Padding
        'px-4 py-3',
        // Background
        'bg-brand-vibrant',
        'dark:bg-brand-900',
        // Top border
        'border-t border-white/20',
        // Shadow
        'shadow-[0_-4px_20px_rgba(0,0,0,0.15)]'
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-4 w-full max-w-screen-xl">
        {/* Left: Status indicator */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex items-center justify-center size-8 rounded-full shrink-0',
              'bg-white/20 dark:bg-white/10'
            )}
          >
            <Eye className="size-4 text-white" aria-hidden="true" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="font-semibold text-white text-sm">{t('title')}</span>
            <span className="hidden sm:inline text-white/60">·</span>
            <span className="text-white/80 text-sm">{t('description')}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Learn more link */}
          <a
            href="https://www.medalsocial.com/docs"
            target="_blank"
            rel="noopener"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'text-white/80 hover:text-white hover:bg-white/10'
            )}
          >
            <span className="hidden sm:inline">{t('learnMore')}</span>
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>

          {/* Exit button - primary CTA inverted for dark background */}
          <Button
            size="sm"
            onClick={exitPreview}
            disabled={pending}
            className="bg-white text-brand-vibrant hover:bg-white/90 dark:bg-white dark:text-brand-900"
          >
            {pending && (
              <span className="size-3.5 border-2 border-brand-vibrant/30 border-t-brand-vibrant rounded-full animate-spin" />
            )}
            {pending ? t('exiting') : t('exit')}
          </Button>
        </div>
      </div>
    </div>
  );

  // Render banner in portal to ensure it's above everything
  return createPortal(banner, document.body);
}
