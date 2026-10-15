import { stegaClean } from '@sanity/client/stega';
import type { ParsedSocialUrl, SanitySocialPlatform, SocialPlatform } from './types';
import { SOCIAL_PLATFORMS } from './types';

const PLATFORM_SET = new Set<string>(SOCIAL_PLATFORMS);

/**
 * Clean stega-encoded Sanity preview strings and normalize `twitter` → `x`.
 * Draft/preview mode otherwise leaves invisible stega chars that break string equality.
 */
export function cleanPlatform(raw: SanitySocialPlatform | null | undefined): SocialPlatform | null {
  if (raw == null) return null;
  const cleaned = stegaClean(String(raw)).trim().toLowerCase();
  if (cleaned === 'twitter') return 'x';
  if (PLATFORM_SET.has(cleaned)) return cleaned as SocialPlatform;
  return null;
}

export function cleanUrl(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const cleaned = stegaClean(String(raw)).trim();
  if (!cleaned) return null;
  try {
    const parsed = new URL(cleaned);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function extractXStatusId(url: string): string | null {
  const match = url.match(/\/(?:status|statuses)\/(\d+)/i);
  return match?.[1] ?? null;
}

export function extractXUsername(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/([^/?#]+)\/(?:status|statuses)\//i);
  if (!match) return null;
  const handle = match[1];
  if (!handle || handle === 'i' || handle === 'intent') return null;
  return handle;
}

export function extractInstagramId(url: string): string | null {
  const match = url.match(/\/(?:p|reel|reels)\/([\w-]+)/i);
  return match?.[1] ?? null;
}

export function extractTikTokId(url: string): string | null {
  const match = url.match(/\/video\/(\d+)/i);
  return match?.[1] ?? null;
}

export function extractTikTokUsername(url: string): string | null {
  const match = url.match(/tiktok\.com\/@([^/?#]+)/i);
  return match?.[1] ?? null;
}

export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id?.split('?')[0] || null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (parsed.pathname.startsWith('/embed/') || parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/')[2] || null;
      }
      return parsed.searchParams.get('v');
    }
  } catch {
    return null;
  }
  return null;
}

export function extractLinkedInActivityId(url: string): string | null {
  const urn = url.match(/urn:li:activity:(\d+)/i);
  if (urn) return urn[1];
  const posts = url.match(/activity-(\d+)/i);
  return posts?.[1] ?? null;
}

export function extractThreadsId(url: string): string | null {
  const match = url.match(/\/post\/([\w-]+)/i);
  return match?.[1] ?? null;
}

export function extractThreadsUsername(url: string): string | null {
  const match = url.match(/\/@([\w.]+)\/post\//i);
  return match?.[1] ?? null;
}

/** Infer platform from a cleaned URL when Sanity's platform field is missing or corrupt. */
export function detectPlatformFromUrl(url: string): SocialPlatform | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'twitter.com' || host === 'x.com' || host === 'mobile.twitter.com') return 'x';
    if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) return 'linkedin';
    if (host === 'instagram.com') return 'instagram';
    if (host === 'threads.net') return 'threads';
    if (host === 'tiktok.com' || host === 'vm.tiktok.com') return 'tiktok';
    if (
      host === 'youtube.com' ||
      host === 'youtu.be' ||
      host === 'm.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      return 'youtube';
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Clean stega fields, normalize twitter→x, parse platform-specific ids.
 * Returns null only when both platform and URL are unusable.
 */
export function parseSocialEmbedInput(
  platformRaw: SanitySocialPlatform | null | undefined,
  urlRaw: string | null | undefined
): ParsedSocialUrl | null {
  const url = cleanUrl(urlRaw);
  if (!url) return null;

  const fromField = cleanPlatform(platformRaw);
  const fromUrl = detectPlatformFromUrl(url);
  const platform = fromField ?? fromUrl;
  if (!platform) return null;

  switch (platform) {
    case 'x':
      return {
        platform,
        url,
        id: extractXStatusId(url),
        username: extractXUsername(url),
      };
    case 'youtube':
      return {
        platform,
        url,
        id: extractYouTubeId(url),
        username: null,
      };
    case 'tiktok':
      return {
        platform,
        url,
        id: extractTikTokId(url),
        username: extractTikTokUsername(url),
      };
    case 'instagram':
      return {
        platform,
        url,
        id: extractInstagramId(url),
        username: null,
      };
    case 'linkedin':
      return {
        platform,
        url,
        id: extractLinkedInActivityId(url),
        username: null,
      };
    case 'threads':
      return {
        platform,
        url,
        id: extractThreadsId(url),
        username: extractThreadsUsername(url),
      };
    default:
      return { platform, url, id: null, username: null };
  }
}
