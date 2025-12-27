import type { Article, BreadcrumbList, Organization, WebSite, WithContext } from 'schema-dts';

type JsonLdProps = {
  data: WithContext<Article | Organization | WebSite | BreadcrumbList> | Record<string, unknown>;
};

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
