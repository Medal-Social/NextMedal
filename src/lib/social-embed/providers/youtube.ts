import { fetchJson } from '../fetch-json';
import type { ParsedSocialUrl, SocialEmbedData } from '../types';

interface YouTubeOembedResponse {
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
}

function emptyYouTube(parsed: ParsedSocialUrl): SocialEmbedData {
  const id = parsed.id;
  return {
    platform: 'youtube',
    url: parsed.url,
    authorName: null,
    authorHandle: null,
    authorUrl: null,
    authorAvatarUrl: null,
    text: null,
    title: null,
    publishedAt: null,
    media: id
      ? {
          url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          width: 480,
          height: 360,
        }
      : null,
    youtubeId: id,
    isFallback: !id,
  };
}

export async function fetchYouTubeEmbed(parsed: ParsedSocialUrl): Promise<SocialEmbedData> {
  const base = emptyYouTube(parsed);
  if (!parsed.id) return base;

  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(parsed.url)}&format=json`;
  const result = await fetchJson<YouTubeOembedResponse>(endpoint);

  if (!result.ok) {
    // Still expose the click-to-load facade with the stock thumbnail when oEmbed fails.
    return { ...base, isFallback: false };
  }

  const data = result.data;
  return {
    ...base,
    authorName: data.author_name ?? null,
    authorUrl: data.author_url ?? null,
    title: data.title ?? null,
    text: data.title ?? null,
    media: data.thumbnail_url
      ? {
          url: data.thumbnail_url,
          width: data.thumbnail_width,
          height: data.thumbnail_height,
          alt: data.title,
        }
      : base.media,
    isFallback: false,
  };
}
