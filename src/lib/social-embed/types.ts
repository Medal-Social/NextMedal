/**
 * In-house social embed types — Medal-branded static cards, no third-party widgets.
 */

export const SOCIAL_PLATFORMS = [
  'x',
  'linkedin',
  'instagram',
  'threads',
  'tiktok',
  'youtube',
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

/** Sanity schema still stores `twitter`; we normalize to `x` at the boundary. */
export type SanitySocialPlatform = SocialPlatform | 'twitter' | (string & {});

export interface SocialEmbedMedia {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  /** CSS aspect-ratio string when known (e.g. "1.91 / 1", "16 / 9"). */
  aspectRatio?: string;
}

/** Open-graph style link card attached to a post (X summary cards, etc.). */
export interface SocialEmbedLinkPreview {
  domain: string | null;
  title: string | null;
  description: string | null;
  url: string | null;
  image: SocialEmbedMedia | null;
}

export interface SocialEmbedData {
  platform: SocialPlatform;
  url: string;
  authorName: string | null;
  authorHandle: string | null;
  authorUrl: string | null;
  authorAvatarUrl: string | null;
  text: string | null;
  title: string | null;
  publishedAt: string | null;
  media: SocialEmbedMedia | null;
  linkPreview: SocialEmbedLinkPreview | null;
  /** YouTube video id when platform is youtube — used by the click-to-load facade. */
  youtubeId: string | null;
  /** True when we could not fetch rich data and should render the link-out fallback. */
  isFallback: boolean;
}

export interface ParsedSocialUrl {
  platform: SocialPlatform;
  url: string;
  id: string | null;
  username: string | null;
}
