'use client';

import { useTranslations } from 'next-intl';
import {
  cleanPlatform,
  cleanUrl,
  detectPlatformFromUrl,
  type SanitySocialPlatform,
  type SocialEmbedData,
  type SocialPlatform,
} from '@/lib/social-embed';
import { SocialEmbedCard } from './social-embed-card';

interface SocialEmbedFallbackProps {
  platform: SanitySocialPlatform;
  url: string;
}

/**
 * Client-safe social embed: Medal Social link-out card with no server fetch / server-only
 * imports. Used inside client trees (ComponentGallery) and as a graceful
 * degradation when the async oEmbed resolver cannot run.
 */
export function SocialEmbedFallback({ platform, url }: SocialEmbedFallbackProps) {
  const t = useTranslations('socialEmbed');

  const cleanedUrl = cleanUrl(url);
  if (!cleanedUrl) {
    return null;
  }

  const resolvedPlatform: SocialPlatform =
    cleanPlatform(platform) ?? detectPlatformFromUrl(cleanedUrl) ?? 'x';
  const platformName = t(`platforms.${resolvedPlatform}`);

  const data: SocialEmbedData = {
    platform: resolvedPlatform,
    url: cleanedUrl,
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

  return (
    <SocialEmbedCard
      data={data}
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
    />
  );
}
