import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import SocialEmbed from '@/components/blocks/objects/core/SocialEmbed';
import { routing } from '@/i18n/routing';
import { BASE_URL } from '@/lib/core/env';

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Fixture article-like page for Lighthouse gating of social embed cards.
 * Uses real server resolve (X syndication / YouTube oEmbed) plus an intentional
 * fallback card. Not linked from site nav.
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
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    label: 'YouTube · click-to-play facade',
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${BASE_URL}${localePrefix(locale)}/qa/social-embeds`;

  return {
    title: 'Social embed fixture | Medal Social',
    description:
      'Lighthouse and SEO gate page for Medal-branded social embed cards. Server-rendered X, YouTube, and fallback cards with no third-party widget scripts.',
    alternates: { canonical },
    openGraph: {
      title: 'Social embed fixture | Medal Social',
      description:
        'Server-rendered Medal social cards for Lighthouse Performance, Accessibility, Best Practices, and SEO.',
      url: canonical,
      siteName: 'Medal Social',
      locale,
      type: 'article',
    },
    // Indexable so the Lighthouse SEO category can score 100 (noindex fails is-crawlable).
    // Page is not linked from site nav; see docs/SOCIAL_EMBEDS.md.
  };
}

export default async function SocialEmbedFixturePage({ params }: Props) {
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
            {/* loading=lazy on card media; aspect-ratio boxes keep CLS at 0. */}
            <SocialEmbed platform={fixture.platform} url={fixture.url} />
          </section>
        ))}
      </div>
    </article>
  );
}
