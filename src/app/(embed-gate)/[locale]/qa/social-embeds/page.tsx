import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import SocialEmbed from '@/components/blocks/objects/core/SocialEmbed';
import { routing } from '@/i18n/routing';
import { BASE_URL, env } from '@/lib/core/env';
import {
  isProductionDeployment,
  isSocialEmbedQaFixtureAllowed,
  QA_SOCIAL_EMBEDS_PATH,
} from '@/lib/social-embed/qa-fixture-access';

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

function localePrefix(locale: string): string {
  return locale === routing.defaultLocale ? '' : `/${locale}`;
}

function assertQaFixtureAllowed(): void {
  if (
    !isSocialEmbedQaFixtureAllowed({
      appEnv: env.NEXT_PUBLIC_APP_ENV,
      vercelEnv: env.VERCEL_ENV,
      qaFlag: env.ALLOW_QA_SOCIAL_EMBEDS,
      nodeEnv: process.env.NODE_ENV,
    })
  ) {
    notFound();
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  assertQaFixtureAllowed();

  const { locale } = await params;
  const path = `${localePrefix(locale)}${QA_SOCIAL_EMBEDS_PATH}`;
  const absoluteUrl = `${BASE_URL}${path}`;
  const isProd = isProductionDeployment({
    appEnv: env.NEXT_PUBLIC_APP_ENV,
    vercelEnv: env.VERCEL_ENV,
    nodeEnv: process.env.NODE_ENV,
  });

  // Staging/preview/dev: indexable so Lighthouse SEO can score 100.
  // Production (only reachable via ALLOW_QA_SOCIAL_EMBEDS): no canonical, noindex.
  if (isProd) {
    return {
      title: 'Social embed fixture | Medal Social',
      description:
        'Internal Lighthouse fixture for Medal-branded social embed cards. Not for public indexing.',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: 'Social embed fixture | Medal Social',
    description:
      'Lighthouse and SEO gate page for Medal-branded social embed cards. Server-rendered X, YouTube, and fallback cards with no third-party widget scripts.',
    alternates: { canonical: absoluteUrl },
    openGraph: {
      title: 'Social embed fixture | Medal Social',
      description:
        'Server-rendered Medal social cards for Lighthouse Performance, Accessibility, Best Practices, and SEO.',
      url: absoluteUrl,
      siteName: 'Medal Social',
      locale,
      type: 'article',
    },
  };
}

export default async function SocialEmbedFixturePage({ params }: Props) {
  assertQaFixtureAllowed();

  const { locale } = await params;
  setRequestLocale(locale);

  return (
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
          Server-rendered X, YouTube, and fallback cards — Lighthouse gate, no third-party widgets.
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
  );
}
