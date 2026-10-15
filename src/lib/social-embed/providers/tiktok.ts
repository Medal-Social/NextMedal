import { fetchJson } from '../fetch-json';
import { stripHtml } from '../strip-html';
import type { ParsedSocialUrl, SocialEmbedData } from '../types';

interface TikTokOembedResponse {
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  html?: string;
}

function emptyTikTok(parsed: ParsedSocialUrl): SocialEmbedData {
  return {
    platform: 'tiktok',
    url: parsed.url,
    authorName: parsed.username,
    authorHandle: parsed.username ? `@${parsed.username}` : null,
    authorUrl: parsed.username ? `https://www.tiktok.com/@${parsed.username}` : null,
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

export async function fetchTikTokEmbed(parsed: ParsedSocialUrl): Promise<SocialEmbedData> {
  const base = emptyTikTok(parsed);
  const endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(parsed.url)}`;
  const result = await fetchJson<TikTokOembedResponse>(endpoint);

  if (!result.ok) return base;

  const data = result.data;
  const text = data.title || (data.html ? stripHtml(data.html) : null);

  return {
    ...base,
    authorName: data.author_name ?? parsed.username ?? null,
    authorHandle: parsed.username ? `@${parsed.username}` : null,
    authorUrl: data.author_url ?? base.authorUrl,
    text,
    title: data.title ?? null,
    media: data.thumbnail_url
      ? {
          url: data.thumbnail_url,
          width: data.thumbnail_width,
          height: data.thumbnail_height,
          alt: data.title,
          aspectRatio:
            data.thumbnail_width && data.thumbnail_height && data.thumbnail_height > 0
              ? `${data.thumbnail_width} / ${data.thumbnail_height}`
              : '9 / 16',
        }
      : null,
    linkPreview: null,
    isFallback: false,
  };
}
