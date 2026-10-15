/**
 * Social Media Embed — Medal-branded static cards.
 * Fetches post metadata server-side (oEmbed / public endpoints), never loads
 * third-party widget scripts or cookies by default. YouTube uses a
 * click-to-load youtube-nocookie facade.
 */

import { getLocale, getTranslations } from 'next-intl/server';
import type { SanitySocialPlatform } from '@/lib/social-embed';
import { resolveSocialEmbed } from '@/lib/social-embed/resolve';
import { formatFullDate } from '@/lib/utils/dates';
import { SocialEmbedCard } from './social-embed/social-embed-card';

interface SocialEmbedProps {
  platform: SanitySocialPlatform;
  url: string;
}

function formatEmbedDate(value: string | null, locale: string): string | null {
  if (!value) return null;
  // ISO timestamps from syndication / APIs
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      return formatFullDate(value, locale);
    } catch {
      return value;
    }
  }
  // Already-human strings from oEmbed HTML footers (e.g. "October 13, 2026")
  return value;
}

export default async function SocialEmbed({ platform, url }: SocialEmbedProps) {
  const [t, locale] = await Promise.all([getTranslations('socialEmbed'), getLocale()]);
  const data = await resolveSocialEmbed(platform, url);

  if (!data) {
    return null;
  }

  const platformName = t(`platforms.${data.platform}`);

  return (
    <SocialEmbedCard
      data={data}
      labels={{
        platformName,
        viewOn: t('viewOn', { platform: platformName }),
        playVideo: t('playVideo'),
        openOriginal: t('openOriginal'),
      }}
      formattedDate={formatEmbedDate(data.publishedAt, locale)}
    />
  );
}
