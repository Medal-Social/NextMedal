import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { PortableText } from 'next-sanity';
import { Img } from '@/components/blocks/objects/core';
import { Social } from '@/components/blocks/utility';
import CookiePreferencesTrigger from '@/components/CookiePreferencesTrigger';
import { Section } from '@/components/ui/section';
import resolveUrl from '@/lib/sanity/resolve-url-server';
import { cn } from '@/lib/utils/index';
import { getFooterSettings } from '@/sanity/lib/fetch';
import { ErrorBoundary } from '../ErrorBoundary';
import { FooterFallback } from './FooterFallback';
import Navigation from './Navigation';
import SystemStatus from './SystemStatus';
import Wrapper from './wrapper';

const footerLinkStyles =
  'relative hover:text-foreground motion-safe:transition-all motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-primary after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-current motion-safe:after:transition-all motion-safe:after:duration-200 motion-safe:hover:after:w-full';

async function FooterInner() {
  const locale = await getLocale();
  const site = await getFooterSettings(locale);

  // If no site settings, return fallback (build-time and runtime safe)
  if (!site) {
    return <FooterFallback />;
  }

  // biome-ignore lint/suspicious/noExplicitAny: footerLinks and other fields are flattened by GROQ but not by generated types
  const { title, tagline, logo, copyright, footerLinks, systemStatus } = site as any;

  const logoImageDark = logo?.image?.dark || logo?.image?.default || logo?.image?.light;
  const logoImageLight = logo?.image?.light || logo?.image?.default || logo?.image?.dark;

  // Pre-resolve footer link URLs
  const resolvedFooterLinks = await Promise.all(
    // @ts-expect-error - footerLinks is flattened by the GROQ query but the type definition suggests a nested structure
    (footerLinks || []).map(async (link) => ({
      ...link,
      resolvedUrl:
        link.external ||
        (link.internal && (await resolveUrl(link.internal, { base: false }))) ||
        null,
    }))
  );

  return (
    <Wrapper className="bg-background text-foreground">
      <Section className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-12 gap-y-6 pb-8">
        <div className="flex flex-col gap-4">
          <Link
            className={cn(
              'h3 md:h2 max-w-max',
              'motion-safe:transition-all motion-safe:duration-200 hover:text-primary motion-safe:hover:scale-105 origin-left',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm'
            )}
            href="/"
            aria-label={`Return to ${title} homepage`}
          >
            {logoImageDark ? (
              <Img
                className="hidden dark:inline-block max-h-[1.5em] w-auto"
                image={logoImageDark}
                alt={`${logo?.name || title} logo - dark version`}
              />
            ) : (
              <span className="hidden dark:inline-block">{title}</span>
            )}
            {logoImageLight ? (
              <Img
                className="inline-block dark:hidden max-h-[1.5em] w-auto"
                image={logoImageLight}
                alt={`${logo?.name || title} logo - light version`}
              />
            ) : (
              <span className="inline-block dark:hidden">{title}</span>
            )}
          </Link>

          {tagline && (
            <div className="max-w-sm text-sm text-muted-foreground text-balance">
              <PortableText value={tagline} />
            </div>
          )}

          <Social aria-label="Social media links" />
        </div>

        <Navigation />
      </Section>

      <div className="relative">
        {/* Gradient separator */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <Section className="flex flex-wrap justify-between items-center py-4 gap-4" spacing="none">
          {/* Left: Copyright + Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {copyright ? (
              <span className="[&_p]:inline [&_p]:m-0 [&_a]:underline hover:[&_a]:text-foreground [&_a]:transition-colors">
                <PortableText value={copyright} />
              </span>
            ) : (
              <span>
                © {new Date().getFullYear()} {title}. All rights reserved.
              </span>
            )}
            {resolvedFooterLinks?.map((link) => {
              if (!link.resolvedUrl) return null;
              const isExternal = link.newTab || !!link.external;
              return (
                <Link
                  key={link.label}
                  href={link.resolvedUrl}
                  className={footerLinkStyles}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  aria-label={isExternal ? `${link.label} (opens in new tab)` : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {link.label}
                    {isExternal && <ExternalLink className="h-3 w-3" aria-hidden="true" />}
                  </span>
                </Link>
              );
            })}
            <CookiePreferencesTrigger locale={locale} className={footerLinkStyles} />
          </div>

          {/* Right: Utilities */}
          <div className="flex items-center gap-4">
            {systemStatus && <SystemStatus status={systemStatus} />}
          </div>
        </Section>
      </div>
    </Wrapper>
  );
}

export default function Footer() {
  return (
    <ErrorBoundary fallback={<FooterFallback />} componentName="Footer">
      <FooterInner />
    </ErrorBoundary>
  );
}
