import type { Article, BreadcrumbList, Organization, WebSite, WithContext } from 'schema-dts';

type JsonLdProps = {
  data: WithContext<Article | Organization | WebSite | BreadcrumbList> | Record<string, unknown>;
};

export default function JsonLd({ data }: JsonLdProps) {
  // Escape closing script tags to prevent XSS
  const safeJson = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson }} />;
}
