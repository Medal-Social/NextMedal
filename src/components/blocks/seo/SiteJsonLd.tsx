import { BASE_URL } from '@/lib/core/env';
import { getSiteOptional } from '@/sanity/lib/fetch';
import { ErrorBoundary } from '../layout/ErrorBoundary';
import JsonLd from './JsonLd';
import { SiteJsonLdFallback } from './SiteJsonLdFallback';

async function SiteJsonLdInner() {
  const site = await getSiteOptional();

  // If no site settings, return null (SEO is nice-to-have, not critical)
  if (!site) {
    return <SiteJsonLdFallback />;
  }

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            name: site.title,
            url: BASE_URL,
            logo: {
              '@type': 'ImageObject',
              url: site.logo?.asset?.url,
            },
            sameAs: site.socialLinks?.map((link) => link.url),
          },
          {
            '@type': 'WebSite',
            name: site.title,
            url: BASE_URL,
          },
        ],
      }}
    />
  );
}

export default function SiteJsonLd() {
  return (
    <ErrorBoundary fallback={<SiteJsonLdFallback />} componentName="SiteJsonLd">
      <SiteJsonLdInner />
    </ErrorBoundary>
  );
}
