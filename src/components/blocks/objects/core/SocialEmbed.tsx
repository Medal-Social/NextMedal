/**
 * Social Media Embed — Medal-branded static cards.
 * Fetches post metadata server-side (oEmbed / public endpoints), never loads
 * third-party widget scripts or cookies by default. YouTube uses a
 * click-to-load youtube-nocookie facade.
 *
 * Import this module directly — do not re-export it from the core barrel
 * (client importers of Img/Video would pull in server-only resolve).
 */

import { stegaClean } from '@sanity/client/stega';
import { getLocale, getTranslations } from 'next-intl/server';
import {
  cleanPlatform,
  cleanUrl,
  detectPlatformFromUrl,
  type SanitySocialPlatform,
  type SocialEmbedData,
  type SocialPlatform,
} from '@/lib/social-embed';
import { resolveSocialEmbed } from '@/lib/social-embed/resolve';
import { SocialEmbedCard } from './social-embed/social-embed-card';

interface SocialEmbedProps {
  platform: SanitySocialPlatform;
  url: string;
}

/** Date-only stamp: "13 Oct 2026" (locale-aware, UTC). */
function formatEmbedDateOnly(isoOrDate: string, locale: string): string {
  const date = new Date(isoOrDate.includes('T') ? isoOrDate : `${isoOrDate}T00:00:00.000Z`);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Mockup-aligned stamp: "13 Oct 2026 · 18:36 UTC" (locale digits, explicit UTC). */
function formatEmbedStamp(iso: string, locale: string): string {
  const date = new Date(iso);
  const dayMonth = formatEmbedDateOnly(iso, locale);
  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date);
  // Syndication timestamps are absolute UTC; label the zone so readers do not
  // mistake 16:36Z for local wall-clock (e.g. Oslo 18:36).
  return `${dayMonth} · ${time} UTC`;
}

function formatEmbedDate(
  value: string | null,
  locale: string
): { display: string | null; dateTime: string | null } {
  if (!value) return { display: null, dateTime: null };

  // Date-only (`YYYY-MM-DD`) from X oEmbed footers — never invent a clock time.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    try {
      return { display: formatEmbedDateOnly(value, locale), dateTime: value };
    } catch {
      return { display: value, dateTime: value };
    }
  }

  // Full ISO timestamps from syndication / APIs
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    try {
      return { display: formatEmbedStamp(value, locale), dateTime: value };
    } catch {
      return { display: value, dateTime: value };
    }
  }

  // Legacy English footer strings — date-only (no clock time in the source)
  const parsed = Date.parse(`${value} UTC`);
  if (!Number.isNaN(parsed)) {
    const dateOnly = new Date(parsed).toISOString().slice(0, 10);
    try {
      return { display: formatEmbedDateOnly(dateOnly, locale), dateTime: dateOnly };
    } catch {
      return { display: value, dateTime: dateOnly };
    }
  }

  return { display: value, dateTime: null };
}

function emergencyFallback(
  platformRaw: SanitySocialPlatform,
  urlRaw: string
): SocialEmbedData | null {
  const url =
    cleanUrl(urlRaw) ??
    (() => {
      const cleaned = stegaClean(String(urlRaw ?? '')).trim();
      try {
        const parsed = new URL(cleaned);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.toString();
      } catch {
        /* ignore */
      }
      return null;
    })();
  if (!url) return null;

  const platform: SocialPlatform = cleanPlatform(platformRaw) ?? detectPlatformFromUrl(url) ?? 'x';

  return {
    platform,
    url,
    authorName: null,
    authorHandle: null,
    authorUrl: null,
    authorAvatarUrl: null,
    text: null,
    title: null,
    publishedAt: null,
    media: null,
    linkPreview: null,
    youtubeId: null,
    isFallback: true,
  };
}

export default async function SocialEmbed({ platform, url }: SocialEmbedProps) {
  const [t, locale] = await Promise.all([getTranslations('socialEmbed'), getLocale()]);
  const data = (await resolveSocialEmbed(platform, url)) ?? emergencyFallback(platform, url);

  // Truly empty input — nothing to link out to.
  if (!data) {
    return null;
  }

  const platformName = t(`platforms.${data.platform}`);
  const { display: formattedDate, dateTime } = formatEmbedDate(data.publishedAt, locale);
  const cardData =
    dateTime && data.publishedAt !== dateTime ? { ...data, publishedAt: dateTime } : data;

  return (
    <>
      {data.platform === 'youtube' && data.youtubeId && !data.isFallback ? (
        <script
          type="application/ld+json"
          // Validated YouTube id from URL parse; escape `<` for XSS-safe JSON-LD.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'VideoObject',
              name: data.title ?? platformName,
              embedUrl: `https://www.youtube-nocookie.com/embed/${data.youtubeId}`,
              thumbnailUrl:
                data.media?.url ?? `https://i.ytimg.com/vi/${data.youtubeId}/hqdefault.jpg`,
              ...(data.publishedAt ? { uploadDate: data.publishedAt } : {}),
            }).replace(/</g, '\\u003c'),
          }}
        />
      ) : null}
      <SocialEmbedCard
        data={cardData}
        labels={{
          platformName,
          viewOn: t('viewOn', { platform: platformName }),
          playVideo: t('playVideo'),
          openOriginal: t('openOriginal'),
          fallbackTitle: t('fallbackTitle'),
          fallbackDescription: t('fallbackDescription', { platform: platformName }),
          clickToPlay: t('clickToPlay'),
          postOn: t('postOn', { platform: platformName }),
        }}
        formattedDate={formattedDate}
      />
    </>
  );
}
