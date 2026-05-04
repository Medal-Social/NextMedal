import { Settings } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Section } from '@/components/ui/section';
import { Link } from '@/i18n/navigation';
import Wrapper from './wrapper';

export async function FooterFallback() {
  try {
    const t = await getTranslations('setup.footer');
    const currentYear = new Date().getFullYear();

    return (
      <Wrapper className="bg-background text-foreground">
        <Section className="grid grid-cols-1 gap-x-12 gap-y-6 pb-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Link href="/" className="font-semibold text-lg">
                {t('brandName')}
              </Link>
              <p className="max-w-sm text-muted-foreground text-sm">{t('description')}</p>
            </div>
            <Link
              href="/studio/structure/site"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
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
            className="flex flex-wrap items-center justify-between gap-4 py-4"
            spacing="none"
          >
            {/* Left: Copyright */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground text-sm">
              <span>
                {t.rich('copyright', {
                  year: currentYear,
                  link: (children) => (
                    <a
                      href="https://www.medalsocial.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 transition-colors hover:text-foreground"
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
              <Link href="/" className="font-semibold text-lg">
                NextMedal
              </Link>
              <p className="max-w-sm text-muted-foreground text-sm">
                Configure site settings in Sanity Studio
              </p>
            </div>
            <Link
              href="/studio/structure/site"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings className="size-3" />
              Configure Site
            </Link>
          </div>
        </Section>

        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <Section
            className="flex flex-wrap items-center justify-between gap-4 py-4"
            spacing="none"
          >
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground text-sm">
              <span>© {currentYear} Medal Social. All rights reserved.</span>
            </div>
          </Section>
        </div>
      </Wrapper>
    );
  }
}
