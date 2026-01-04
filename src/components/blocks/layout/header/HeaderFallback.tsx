import { Settings } from 'lucide-react';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import LocaleSwitcher from '@/components/blocks/layout/language-switcher';
import { DEFAULT_LOCALE } from '@/i18n/config';
import ThemeToggle from './ThemeToggle';

export async function HeaderFallback() {
  try {
    const t = await getTranslations('setup.header');
    const locale = await getLocale();
    const homeHref = locale === DEFAULT_LOCALE ? '/' : `/${locale}`;

    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex min-h-16 items-center w-full px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-1 items-center justify-between w-full">
            {/* Logo / Site Title */}
            <div className="flex items-center gap-3">
              <Link href={homeHref} className="text-lg font-semibold">
                {t('yourSite')}
              </Link>
              <Link
                href="/studio/structure/site"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md hover:bg-muted hover:text-foreground transition-colors"
              >
                <Settings className="size-3" />
                {t('configureHint')}
              </Link>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2 md:gap-4 relative z-[101] shrink-0">
              {/* Complete Setup CTA */}
              <Link
                href="/studio/structure/site"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {t('completeSetup')}
              </Link>

              {/* Theme + Language Controls */}
              <div className="flex items-center gap-1">
                <ThemeToggle className="hover:bg-accent/50" />
                <LocaleSwitcher />
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  } catch {
    // Ultra-fallback: minimal header with hardcoded strings
    // Note: Using "/" for homepage since this is an emergency fallback
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex min-h-16 items-center w-full px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-1 items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-lg font-semibold">
                NextMedal
              </Link>
              <Link
                href="/studio/structure/site"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md hover:bg-muted hover:text-foreground transition-colors"
              >
                <Settings className="size-3" />
                Configure Site
              </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4 relative z-[101] shrink-0">
              <Link
                href="/studio/structure/site"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Complete Setup
              </Link>

              <div className="flex items-center gap-1">
                <ThemeToggle className="hover:bg-accent/50" />
                <LocaleSwitcher />
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
}
