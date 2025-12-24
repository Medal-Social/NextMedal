import { BASE_URL } from '@/lib/env';
import { getSite } from '@/sanity/lib/fetch';
import JsonLd from '@/ui/JsonLd';

export default async function SiteJsonLd() {
  const site = await getSite();

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
