import { Settings } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Section } from '@/components/ui/section';
import Wrapper from './wrapper';

export async function FooterFallback() {
  try {
    const t = await getTranslations('setup.footer');
    const currentYear = new Date().getFullYear();

    return (
      <Wrapper className="bg-background text-foreground">
        <Section className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-12 gap-y-6 pb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-lg font-semibold">
                {t('brandName')}
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm">{t('description')}</p>
            </div>
            <Link
              href="/studio/structure/site"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md w-fit hover:bg-muted hover:text-foreground transition-colors"
            >
              <Settings className="size-3" />
              {t('configureHint')}
            </Link>
          </div>
        </Section>

        <div className="relative">
          {/* Gradient separator */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <Section
            className="flex flex-wrap justify-between items-center py-4 gap-4"
            spacing="none"
          >
            {/* Left: Copyright */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span>
                {t.rich('copyright', {
                  year: currentYear,
                  link: (children) => (
                    <a
                      href="https://www.medalsocial.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground underline underline-offset-4 transition-colors"
                    >
                      {children}
                    </a>
                  ),
                })}
              </span>
            </div>
          </Section>
        </div>
      </Wrapper>
    );
  } catch {
    // Ultra-fallback: minimal footer with hardcoded strings
    const currentYear = new Date().getFullYear();
    return (
      <Wrapper className="bg-background text-foreground">
        <Section className="grid grid-cols-1 gap-y-6 pb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-lg font-semibold">
                NextMedal
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm">
                Configure site settings in Sanity Studio
              </p>
            </div>
            <Link
              href="/studio/structure/site"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md w-fit hover:bg-muted hover:text-foreground transition-colors"
            >
              <Settings className="size-3" />
              Configure Site
            </Link>
          </div>
        </Section>

        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <Section
            className="flex flex-wrap justify-between items-center py-4 gap-4"
            spacing="none"
          >
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span>© {currentYear} Medal Social. All rights reserved.</span>
            </div>
          </Section>
        </div>
      </Wrapper>
    );
  }
}
