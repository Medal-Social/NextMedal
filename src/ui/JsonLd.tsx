import type { Article, BreadcrumbList, Organization, WebSite, WithContext } from 'schema-dts';

type JsonLdProps = {
  data: WithContext<Article | Organization | WebSite | BreadcrumbList> | Record<string, any>;
};

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD data injection requires dangerouslySetInnerHTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
