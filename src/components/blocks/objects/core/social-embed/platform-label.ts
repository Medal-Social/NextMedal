import type { SocialPlatform } from '@/lib/social-embed';

/** Fallback English labels — prefer i18n `socialEmbed.platforms.*` at render time. */
export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  x: 'X',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  threads: 'Threads',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};
