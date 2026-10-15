import 'server-only';

import { parseSocialEmbedInput } from './detect';
import { fetchTikTokEmbed } from './providers/tiktok';
import { fetchXEmbed } from './providers/x';
import { fetchYouTubeEmbed } from './providers/youtube';
import type { SanitySocialPlatform, SocialEmbedData, SocialPlatform } from './types';

function fallbackCard(
  platform: SocialPlatform,
  url: string,
  extras?: Partial<SocialEmbedData>
): SocialEmbedData {
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
    youtubeId: platform === 'youtube' ? (extras?.youtubeId ?? null) : null,
    isFallback: true,
    ...extras,
  };
}

/**
 * Resolve a Sanity socialEmbed block into Medal card data.
 * Always returns a card — never throws for missing provider data.
 */
export async function resolveSocialEmbed(
  platformRaw: SanitySocialPlatform | null | undefined,
  urlRaw: string | null | undefined
): Promise<SocialEmbedData | null> {
  const parsed = parseSocialEmbedInput(platformRaw, urlRaw);
  if (!parsed) return null;

  try {
    switch (parsed.platform) {
      case 'x':
        return await fetchXEmbed(parsed);
      case 'youtube':
        return await fetchYouTubeEmbed(parsed);
      case 'tiktok':
        return await fetchTikTokEmbed(parsed);
      case 'instagram':
      case 'linkedin':
      case 'threads':
        // No reliable public oEmbed without tokens — graceful link-out card.
        return fallbackCard(parsed.platform, parsed.url, {
          authorHandle: parsed.username ? `@${parsed.username}` : null,
          authorName: parsed.username,
        });
      default:
        return fallbackCard(parsed.platform, parsed.url);
    }
  } catch {
    return fallbackCard(parsed.platform, parsed.url, {
      youtubeId: parsed.platform === 'youtube' ? parsed.id : null,
    });
  }
}
