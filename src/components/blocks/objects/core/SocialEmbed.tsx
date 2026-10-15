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
import { formatFullDate } from '@/lib/utils/dates';
import { SocialEmbedCard } from './social-embed/social-embed-card';

interface SocialEmbedProps {
  platform: SanitySocialPlatform;
  url: string;
}

function formatEmbedDate(
  value: string | null,
  locale: string
): { display: string | null; dateTime: string | null } {
  if (!value) return { display: null, dateTime: null };

  // ISO timestamps from syndication / APIs / normalized oEmbed dates
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      return { display: formatFullDate(value, locale), dateTime: value };
    } catch {
      return { display: value, dateTime: value };
    }
  }

  // Legacy English footer strings — parse then localize
  const parsed = Date.parse(`${value} UTC`);
  if (!Number.isNaN(parsed)) {
    const iso = new Date(parsed).toISOString();
    try {
      return { display: formatFullDate(iso, locale), dateTime: iso };
    } catch {
      return { display: value, dateTime: iso };
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
        }}
        formattedDate={formattedDate}
      />
    </>
  );
}
