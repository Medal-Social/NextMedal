import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { ThemeProvider } from 'next-themes';
import '@/styles/globals.css';
import { notFound } from 'next/navigation';
import type { Locale } from 'next-intl';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Suspense } from 'react';
import { Analytics } from '@/components/Analytics';
import { ScrollToTop, SiteHeader, SkipToContent } from '@/components/blocks/layout';
import Footer from '@/components/blocks/layout/footer';
import { SiteJsonLd } from '@/components/blocks/seo';
import VisualEditingControls from '@/components/blocks/utility/VisualEditingControls';
import CookieConsentWrapper from '@/components/CookieConsentWrapper';
import { TranslationDialog } from '@/components/TranslationDialog';
import { Toaster } from '@/components/ui/sonner';
import { getLocaleMetadata } from '@/i18n/config';
import { routing } from '@/i18n/routing';
import { CollectionProvider } from '@/lib/collections/context';
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

  // Load messages for client components
  const messages = await getMessages();

  // Get text direction from locale metadata
  const dir = getLocaleMetadata(locale)?.dir ?? 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to critical external origins for faster resource loading */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
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
            <NextIntlClientProvider locale={locale} messages={messages}>
              <CollectionProvider locale={locale}>
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
                <TranslationDialog />
                <Toaster />
                <Analytics />
                <Suspense fallback={null}>
                  <CookieConsentWrapper locale={locale} />
                </Suspense>
                <ScrollToTop />
                <Suspense fallback={null}>
                  <SanityLive />
                </Suspense>
              </CollectionProvider>
            </NextIntlClientProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
