/**
 * Social Embed Schema
 * @version 1.2.0
 * @lastUpdated 2026-01-02
 * @description Multi-platform social media embed object supporting X, LinkedIn, Instagram,
 * Threads, TikTok, and YouTube with lazy-loading for performance.
 * @changelog
 * - 1.2.0: Removed Bluesky (script-based embed removed for CSP compliance)
 * - 1.1.0: Removed Facebook (X-Frame-Options blocking prevents iframe embeds)
 * - 1.0.0: Initial version with 8 platform support
 */

import { ShareIcon } from '@sanity/icons';
import type { PreviewProps, Rule } from 'sanity';
import { defineField } from 'sanity';

import {
  IconInstagram,
  IconLink,
  IconLinkedin,
  IconThreads,
  IconTiktok,
  IconTwitterX,
  IconYoutube,
} from '@/components/icons/social-icons';

// Platform-specific URL validation patterns
const platformPatterns = {
  twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.*\/status\/\d+/,
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/(posts|feed\/update)\/.*$/,
  instagram: /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[\w-]+/,
  threads: /^https?:\/\/(www\.)?threads\.net\/@[\w.]+\/post\/[\w-]+/,
  tiktok: /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)\/.*/,
  youtube: /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/,
};

// Platform icon components
function PlatformIcon({ platform }: { platform?: string }) {
  const iconStyle = { width: '20px', height: '20px', fill: 'currentColor' };

  switch (platform) {
    case 'twitter':
      return <IconTwitterX style={iconStyle} />;
    case 'linkedin':
      return <IconLinkedin style={iconStyle} />;
    case 'instagram':
      return <IconInstagram style={iconStyle} />;
    case 'threads':
      return <IconThreads style={iconStyle} />;
    case 'tiktok':
      return <IconTiktok style={iconStyle} />;
    case 'youtube':
      return <IconYoutube style={iconStyle} />;
    default:
      return <IconLink style={iconStyle} />;
  }
}

// Custom preview component for Studio
function SocialEmbedPreview(props: PreviewProps & { platform?: string; url?: string }) {
  const { platform, url } = props;

  const platformLabels: Record<string, string> = {
    twitter: 'X (Twitter)',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    threads: 'Threads',
    tiktok: 'TikTok',
    youtube: 'YouTube',
  };

  const platformColors: Record<string, string> = {
    twitter: '#000000',
    linkedin: '#0077B5',
    instagram: '#E4405F',
    threads: '#000000',
    tiktok: '#000000',
    youtube: '#FF0000',
  };

  const platformName = platform ? platformLabels[platform] : 'Social Embed';
  const iconColor = platform ? platformColors[platform] : '#666';

  return (
    <div
      style={{
        padding: '12px 16px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
      }}
    >
      <div style={{ color: iconColor, display: 'flex', alignItems: 'center' }}>
        <PlatformIcon platform={platform} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{platformName}</div>
        <div
          style={{
            fontSize: '12px',
            color: '#666',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {url || 'No URL provided'}
        </div>
      </div>
    </div>
  );
}

export default defineField({
  name: 'socialEmbed',
  title: 'Social Media Embed',
  type: 'object',
  icon: ShareIcon,
  components: {
    preview: SocialEmbedPreview,
  },
  preview: {
    select: {
      platform: 'platform',
      url: 'url',
    },
  },
  fields: [
    {
      name: 'platform',
      title: 'Platform',
      type: 'string',
      description: 'Select the social media platform',
      options: {
        list: [
          { title: 'X (Twitter)', value: 'twitter' },
          { title: 'LinkedIn', value: 'linkedin' },
          { title: 'Instagram', value: 'instagram' },
          { title: 'Threads', value: 'threads' },
          { title: 'TikTok', value: 'tiktok' },
          { title: 'YouTube', value: 'youtube' },
        ],
        layout: 'dropdown',
      },
      validation: (rule: Rule) => rule.required(),
    },
    {
      name: 'url',
      title: 'Post URL',
      type: 'url',
      description: 'Paste the full URL of the post/video you want to embed',
      validation: (rule: Rule) =>
        rule.required().custom((url, context) => {
          const parent = context.parent as { platform?: string } | undefined;
          if (!parent?.platform || !url || typeof url !== 'string') return true;

          const pattern = platformPatterns[parent.platform as keyof typeof platformPatterns];
          if (pattern && !pattern.test(url)) {
            return `This doesn't look like a valid ${parent.platform} URL. Please check the URL and try again.`;
          }

          return true;
        }),
    },
  ],
});
