import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from 'next-themes';
import { getSite } from '@/sanity/lib/fetch';
import ThemeColorSetter from '@/ui/ThemeColorSetter';
import { RootProvider } from 'fumadocs-ui/provider';
import '@/styles/globals.css';

// Define the base options directly in this file
const baseOptions: BaseLayoutProps = {
  githubUrl: 'https://github.com/Medal-Social/NextMedal',
  nav: {
    title: 'NextMedal',
  }
};

export default async function Layout({ children }: { children: ReactNode }) {
  // Get site data for theme settings
  const site = await getSite();
  const themeSettings = site.themeSettings || {
    defaultTheme: 'light',
  };

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
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
            <main id="main-content" className="flex-1">
              <DocsLayout 
                tree={source.pageTree} 
                {...baseOptions}
                containerProps={{
                  className: "pt-8 mt-2",
                }}
              >
                {children}
              </DocsLayout>
            </main>
          </RootProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 