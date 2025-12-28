import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { PortableText } from 'next-sanity';
import CookiePreferencesTrigger from '@/components/CookiePreferencesTrigger';
import { Section } from '@/components/ui/section';
import resolveUrl from '@/lib/resolveUrl';
import { cn } from '@/lib/utils';
import { getSite } from '@/sanity/lib/fetch';
import { Img } from '@/ui/base';
import ThemeToggleWrapper from '@/ui/header/ThemeToggleWrapper';
import LocaleSwitcher from '@/ui/language-switcher';
import { Social } from '@/ui/utility';
import Navigation from './Navigation';
import SystemStatus from './SystemStatus';
import Wrapper from './wrapper';

export default async function Footer() {
  const { title, tagline, logo, copyright, footerLinks, systemStatus } = await getSite();

  const logoImageDark = logo?.image?.dark || logo?.image?.default || logo?.image?.light;
  const logoImageLight = logo?.image?.light || logo?.image?.default || logo?.image?.dark;

  return (
    <Wrapper className="bg-background text-foreground">
      <Section className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-12 gap-y-6 pb-8">
        <div className="flex flex-col gap-6">
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
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-center text-sm text-muted-foreground">
            <div>
              {copyright ? (
                <div className="text-sm [&_p]:m-0 [&_a]:underline hover:[&_a]:text-foreground [&_a]:transition-colors">
                  <PortableText value={copyright} />
                </div>
              ) : (
                <p className="m-0">
                  © {new Date().getFullYear()} {title}. All rights reserved.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {footerLinks?.map((link) => {
                const url =
                  link.external || (link.internal && resolveUrl(link.internal, { base: false }));
                if (!url) return null;
                const isExternal = link.newTab || !!link.external;
                return (
                  <Link
                    key={link.label}
                    href={url}
                    className="relative hover:text-foreground motion-safe:transition-all motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-primary after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-current motion-safe:after:transition-all motion-safe:after:duration-200 motion-safe:hover:after:w-full"
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
              <CookiePreferencesTrigger className="relative hover:text-foreground motion-safe:transition-all motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-primary after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-current motion-safe:after:transition-all motion-safe:after:duration-200 motion-safe:hover:after:w-full" />
            </div>
          </div>

          {/* Right: Utilities */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <LocaleSwitcher
                dropdownAlign="end"
                className="[&>span]:inline-block text-muted-foreground hover:text-foreground hover:bg-transparent h-auto p-0 font-normal transition-colors duration-200"
              />
            </div>
            <div className="hidden lg:block">
              <ThemeToggleWrapper
                dropdownAlign="end"
                className="[&>span]:inline-block text-muted-foreground hover:text-foreground hover:bg-transparent h-auto p-0 font-normal transition-colors duration-200"
              />
            </div>
            {systemStatus && <SystemStatus status={systemStatus} />}
          </div>
        </Section>
      </div>
    </Wrapper>
  );
}
