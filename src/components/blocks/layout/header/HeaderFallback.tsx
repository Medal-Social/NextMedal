import { Settings } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import LocaleSwitcher from '@/components/blocks/layout/language-switcher';
import { Link } from '@/i18n/navigation';
import ThemeToggle from './ThemeToggle';

export async function HeaderFallback() {
  try {
    const t = await getTranslations('setup.header');

    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="flex w-full flex-1 items-center justify-between">
            {/* Logo / Site Title */}
            <div className="flex items-center gap-3">
              <Link href="/" className="font-semibold text-lg">
                {t('yourSite')}
              </Link>
              <Link
                href="/studio/structure/site"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
              >
                <Settings className="size-3" />
                {t('configureHint')}
              </Link>
            </div>

            {/* Right side controls */}
            <div className="relative z-[101] flex shrink-0 items-center gap-2 md:gap-4">
              {/* Complete Setup CTA */}
              <Link
                href="/studio/structure/site"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 sm:inline-flex"
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
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="flex w-full flex-1 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="font-semibold text-lg">
                NextMedal
              </Link>
              <Link
                href="/studio/structure/site"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
              >
                <Settings className="size-3" />
                Configure Site
              </Link>
            </div>

            <div className="relative z-[101] flex shrink-0 items-center gap-2 md:gap-4">
              <Link
                href="/studio/structure/site"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 sm:inline-flex"
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
