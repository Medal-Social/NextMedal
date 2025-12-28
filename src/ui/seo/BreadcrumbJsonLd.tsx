import type { BreadcrumbList, WithContext } from 'schema-dts';
import { BASE_URL } from '@/lib/env';
import { JsonLd } from '@/ui/seo';

type Props = {
  items: {
    name: string;
    path: string;
  }[];
};

export default function BreadcrumbJsonLd({ items }: Props) {
  const jsonLd: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.path}`,
    })),
  };

  return <JsonLd data={jsonLd} />;
}
