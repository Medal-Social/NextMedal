import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nextmedal.com';

  return {
    title: 'Documentation | Medal Social',
    description:
      'Comprehensive documentation for Medal Social - guides, components, and best practices for building amazing apps.',
    alternates: {
      canonical: `${baseUrl}/${locale}/docs`,
      languages: {
        en: `${baseUrl}/en/docs`,
        nb: `${baseUrl}/nb/docs`,
      },
    },
    openGraph: {
      title: 'Documentation | Medal Social',
      description:
        'Comprehensive documentation for Medal Social - guides, components, and best practices.',
      url: `${baseUrl}/${locale}/docs`,
      siteName: 'Medal Social',
      locale: locale,
      type: 'website',
    },
  };
}

export default async function DocsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nextmedal.com';
  const currentUrl = `${baseUrl}/${locale}/docs`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${baseUrl}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Documentation',
        item: currentUrl,
      },
    ],
  };

  const techArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Medal Social Documentation',
    description:
      'Comprehensive documentation for Medal Social - guides, components, and best practices for building amazing apps.',
    url: currentUrl,
    author: {
      '@type': 'Organization',
      name: 'Medal Social',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Medal Social',
    },
    inLanguage: locale,
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleSchema) }}
      />
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Documentation</h1>
        <p className="text-xl text-muted-foreground text-balance">
          Welcome to the Medal Social documentation. Everything you need to build amazing apps.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article>
          <Link
            href="/docs/installation"
            className="group flex flex-col gap-2 rounded-xl border p-6 hover:bg-muted/50 hover:shadow-sm transition-all"
          >
            <div className="mb-2 rounded-md bg-primary/10 p-2 w-fit text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12s2.545-5 7-5c4.454 0 7 5 7 5s-2.546 5-7 5c-4.455 0-7-5-7-5z" />
                <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                <path d="M21 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2" />
                <path d="M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg group-hover:text-primary">Getting Started</h3>
            <p className="text-sm text-muted-foreground">
              Installation, configuration, and project structure.
            </p>
          </Link>
        </article>

        <article>
          <Link
            href="/docs/components"
            className="group flex flex-col gap-2 rounded-xl border p-6 hover:bg-muted/50 hover:shadow-sm transition-all"
          >
            <div className="mb-2 rounded-md bg-primary/10 p-2 w-fit text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2 0v12h12V6zM8 8h8v8H8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg group-hover:text-primary">Components</h3>
            <p className="text-sm text-muted-foreground">
              Pre-built accessible components for your app.
            </p>
          </Link>
        </article>

        <article>
          <Link
            href="/docs/guides"
            className="group flex flex-col gap-2 rounded-xl border p-6 hover:bg-muted/50 hover:shadow-sm transition-all"
          >
            <div className="mb-2 rounded-md bg-primary/10 p-2 w-fit text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg group-hover:text-primary">Guides</h3>
            <p className="text-sm text-muted-foreground">
              Best practices, theming, and deployment.
            </p>
          </Link>
        </article>
      </div>
    </div>
  );
}
