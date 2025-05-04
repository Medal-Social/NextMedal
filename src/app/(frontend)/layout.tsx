import { ThemeProvider } from 'next-themes';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '@/styles/globals.css';
import { getSite } from '@/sanity/lib/fetch';
import Announcement from '@/ui/Announcement';
import SkipToContent from '@/ui/SkipToContent';
import ThemeColorSetter from '@/ui/ThemeColorSetter';
import VisualEditingControls from '@/ui/VisualEditingControls';
import Footer from '@/ui/footer';
import Header from '@/ui/header';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { RootProvider } from 'fumadocs-ui/provider';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Static generation is now possible since we're not using the connection() API
  const site = await getSite();
  const themeSettings = site.themeSettings || {
    defaultTheme: 'light',
  };

  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground font-sans flex flex-col min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme={themeSettings.defaultTheme || 'light'}
          enableSystem
          disableTransitionOnChange
        >
          <RootProvider>
            <ThemeColorSetter
              lightTheme={themeSettings.lightMode}
              darkTheme={themeSettings.darkMode}
            />
            <NuqsAdapter>
              <SkipToContent />
              <Announcement />
              <Header />
              <main
                id="main-content"
                className="min-h-[calc(100dvh-var(--header-height)-var(--footer-height))]"
                tabIndex={-1}
              >
                {children}
              </main>
              <Footer />
              <VisualEditingControls />
            </NuqsAdapter>
          </RootProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
