import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { ThemeProvider } from 'next-themes';
import '@/styles/globals.css';
import { notFound } from 'next/navigation';
import type { Locale } from 'next-intl';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from '@/components/ui/sonner';
import { routing } from '@/i18n/routing';
import { getSite } from '@/sanity/lib/fetch';
import Banner from '@/ui/Banner';
import Footer from '@/ui/footer';
import Header from '@/ui/header';
import SiteJsonLd from '@/ui/SiteJsonLd';
import SkipToContent from '@/ui/SkipToContent';
import VisualEditingControls from '@/ui/VisualEditingControls';

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

  // Static generation is now possible since we're not using the connection() API
  await getSite();

  return (
    <html
      lang={locale}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground font-sans flex flex-col min-h-screen">
        <SiteJsonLd />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <NextIntlClientProvider locale={locale}>
              <SkipToContent />
              <Banner />
              <Header />
              <main
                id="main-content"
                className="flex-1 w-full min-h-[calc(100dvh-var(--header-height)-var(--footer-height))]"
                tabIndex={-1}
              >
                {children}
              </main>
              <Footer />
              <VisualEditingControls />
              <Toaster />
            </NextIntlClientProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
