import type { Viewport } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from 'next-intl';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getLocaleMetadata } from '@/i18n/config';
import { routing } from '@/i18n/routing';
import '../embed-gate.css';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

/**
 * Lean layout for embed Lighthouse gates — locale + globals.css only.
 * No next/font here (and global-error no longer imports Geist) so this route
 * does not preload webfonts. Production article chrome still uses GeistSans
 * via `(frontend)/layout.tsx`.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function EmbedGateLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const dir = getLocaleMetadata(locale)?.dir ?? 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://pbs.twimg.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pbs.twimg.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
      </head>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
