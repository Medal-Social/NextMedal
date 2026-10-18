import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import SocialEmbed from '@/components/blocks/objects/core/SocialEmbed';
import { BreadcrumbJsonLd, JsonLd } from '@/components/blocks/seo';
import { BASE_URL, env, readAllowQaSocialEmbeds } from '@/lib/core/env';
import {
  isProductionDeployment,
  isSocialEmbedQaFixtureAllowed,
} from '@/lib/social-embed/qa-fixture-access';
import {
  buildQaFixtureMetadata,
  qaFixtureAbsoluteUrl,
  qaFixtureBreadcrumbs,
} from '@/lib/social-embed/qa-fixture-metadata';

/**
 * Checked on every request. A static prerender would bake the production 404 and
 * ignore `ALLOW_QA_SOCIAL_EMBEDS` set on the running container.
 */
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Fixture article-like page for Lighthouse gating of social embed cards.
 * Served only on non-production (dev / staging / preview) or when
 * `ALLOW_QA_SOCIAL_EMBEDS` is set. Production returns 404.
 * Not linked from site nav and excluded from the sitemap.
 */
const FIXTURES = [
  {
    key: 'x-anthropic',
    platform: 'twitter' as const,
    url: 'https://x.com/AnthropicAI/status/2110047081414987957',
    label: 'X · Anthropic (link preview)',
  },
  {
    key: 'x-gitlab',
    platform: 'twitter' as const,
    url: 'https://x.com/gitlab/status/2110167424234295775',
    label: 'X · GitLab (link preview)',
  },
  {
    key: 'youtube',
    platform: 'youtube' as const,
    // Real Medal Social channel video (not a meme / rickroll).
    url: 'https://www.youtube.com/watch?v=Svz_KbFAz9Y',
    label: 'YouTube · Medal Social (click-to-play facade)',
  },
  {
    key: 'fallback',
    platform: 'twitter' as const,
    // Intentionally unresolvable status id → graceful fallback card
    url: 'https://x.com/AnthropicAI/status/1',
    label: 'Fallback · post unavailable',
  },
] as const;

function assertQaFixtureAllowed(): void {
  if (
    !isSocialEmbedQaFixtureAllowed({
      appEnv: env.NEXT_PUBLIC_APP_ENV,
      vercelEnv: env.VERCEL_ENV,
      qaFlag: readAllowQaSocialEmbeds(),
      nodeEnv: process.env.NODE_ENV,
    })
  ) {
    notFound();
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  assertQaFixtureAllowed();

  const { locale } = await params;
  const isProd = isProductionDeployment({
    appEnv: env.NEXT_PUBLIC_APP_ENV,
    vercelEnv: env.VERCEL_ENV,
    nodeEnv: process.env.NODE_ENV,
  });

  // Staging/preview/dev: full SEO so Lighthouse can score 100.
  // Production (only reachable via ALLOW_QA_SOCIAL_EMBEDS): no canonical, noindex.
  return buildQaFixtureMetadata(locale, isProd);
}

export default async function SocialEmbedFixturePage({ params }: Props) {
  assertQaFixtureAllowed();

  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              name: 'Medal Social',
              url: BASE_URL,
            },
            {
              '@type': 'WebSite',
              name: 'Medal Social',
              url: BASE_URL,
            },
            {
              '@type': 'WebPage',
              name: 'Social embed cards',
              url: qaFixtureAbsoluteUrl(locale),
              isPartOf: { '@type': 'WebSite', name: 'Medal Social', url: BASE_URL },
            },
          ],
        }}
      />
      <BreadcrumbJsonLd items={qaFixtureBreadcrumbs(locale)} />
      <article className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        {/*
          First viewport is heading-only so mobile LCP is the h1 (paints with FCP).
          Cards sit one viewport below — still in the document for SEO/a11y audits,
          with aspect-ratio boxes holding CLS at 0 once scrolled into view.
        */}
        <header className="flex min-h-[85dvh] flex-col justify-center">
          <p className="font-semibold text-brand-600 text-xs uppercase tracking-[0.14em] dark:text-brand-300">
            Medal · QA · Social embeds
          </p>
          <h1 className="mt-3 font-semibold text-5xl tracking-tight sm:text-6xl">
            Social embed fixture article
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground text-sm leading-relaxed">
            Server-rendered X, YouTube, and fallback cards — Lighthouse gate, no third-party
            widgets.
          </p>
        </header>

        <div className="space-y-10 pb-16">
          {FIXTURES.map((fixture) => (
            <section key={fixture.key} aria-labelledby={`heading-${fixture.key}`}>
              <h2
                id={`heading-${fixture.key}`}
                className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide"
              >
                {fixture.label}
              </h2>
              <SocialEmbed platform={fixture.platform} url={fixture.url} />
            </section>
          ))}
        </div>
      </article>
    </>
  );
}
