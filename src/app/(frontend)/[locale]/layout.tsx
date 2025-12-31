import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { ThemeProvider } from 'next-themes';
import '@/styles/globals.css';
import { notFound } from 'next/navigation';
import type { Locale } from 'next-intl';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Suspense } from 'react';
import { Analytics } from '@/components/Analytics';
import { ScrollToTop, SiteHeader, SkipToContent } from '@/components/blocks/layout';
import Footer from '@/components/blocks/layout/footer';
import { SiteJsonLd } from '@/components/blocks/seo';
import VisualEditingControls from '@/components/blocks/utility/VisualEditingControls';
import CookieConsentWrapper from '@/components/CookieConsentWrapper';
import { Toaster } from '@/components/ui/sonner';
import { routing } from '@/i18n/routing';
import { SanityLive } from '@/sanity/lib/live';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to critical external origins for faster resource loading */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
      </head>
      <body className="bg-background text-foreground dark:bg-background dark:text-foreground font-sans flex flex-col min-h-screen">
        <Suspense fallback={null}>
          <SiteJsonLd />
        </Suspense>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <NextIntlClientProvider locale={locale}>
              <SkipToContent />
              <SiteHeader />
              <main
                id="main-content"
                className="flex-1 w-full pt-[var(--header-height)] min-h-[calc(100dvh-var(--header-height)-var(--footer-height))]"
                tabIndex={-1}
              >
                {children}
              </main>
              <Suspense fallback={null}>
                <Footer />
              </Suspense>
              <VisualEditingControls />
              <Toaster />
              <Analytics />
              <Suspense fallback={null}>
                <CookieConsentWrapper locale={locale} />
              </Suspense>
              <ScrollToTop />
              <Suspense fallback={null}>
                <SanityLive />
              </Suspense>
            </NextIntlClientProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
