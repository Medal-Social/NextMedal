import { fetchJson } from '../fetch-json';
import { extractDateFromXOembedHtml, extractXOembedBodyHtml, stripHtml } from '../strip-html';
import type { ParsedSocialUrl, SocialEmbedData, SocialEmbedMedia } from '../types';

interface XOembedResponse {
  url?: string;
  author_name?: string;
  author_url?: string;
  html?: string;
  provider_name?: string;
}

interface XSyndicationUser {
  name?: string;
  screen_name?: string;
  profile_image_url_https?: string;
}

interface XSyndicationImageValue {
  url?: string;
  width?: number;
  height?: number;
  alt?: string;
}

interface XSyndicationCard {
  binding_values?: Record<string, { image_value?: XSyndicationImageValue; type?: string }>;
}

interface XSyndicationTweet {
  __typename?: string;
  text?: string;
  created_at?: string;
  user?: XSyndicationUser;
  card?: XSyndicationCard;
  photos?: Array<{ url?: string; width?: number; height?: number }>;
  mediaDetails?: Array<{
    media_url_https?: string;
    original_info?: { width?: number; height?: number };
  }>;
}

function pickCardMedia(card: XSyndicationCard | undefined): SocialEmbedMedia | null {
  const values = card?.binding_values;
  if (!values) return null;
  const preferred =
    values.photo_image_full_size_large?.image_value ??
    values.summary_photo_image?.image_value ??
    values.thumbnail_image_large?.image_value ??
    values.thumbnail_image?.image_value;
  if (!preferred?.url) return null;
  return {
    url: preferred.url,
    width: preferred.width,
    height: preferred.height,
    alt: preferred.alt,
  };
}

function pickPhotoMedia(tweet: XSyndicationTweet): SocialEmbedMedia | null {
  const photo = tweet.photos?.[0];
  if (photo?.url) {
    return { url: photo.url, width: photo.width, height: photo.height };
  }
  const detail = tweet.mediaDetails?.[0];
  if (detail?.media_url_https) {
    return {
      url: detail.media_url_https,
      width: detail.original_info?.width,
      height: detail.original_info?.height,
    };
  }
  return pickCardMedia(tweet.card);
}

function emptyX(parsed: ParsedSocialUrl): SocialEmbedData {
  return {
    platform: 'x',
    url: parsed.url,
    authorName: parsed.username,
    authorHandle: parsed.username ? `@${parsed.username}` : null,
    authorUrl: parsed.username ? `https://x.com/${parsed.username}` : null,
    authorAvatarUrl: null,
    text: null,
    title: null,
    publishedAt: null,
    media: null,
    youtubeId: null,
    isFallback: true,
  };
}

async function fetchSyndication(id: string): Promise<XSyndicationTweet | null> {
  const result = await fetchJson<XSyndicationTweet>(
    `https://cdn.syndication.twimg.com/tweet-result?id=${encodeURIComponent(id)}&lang=en&token=1`,
    {
      headers: {
        // Public syndication endpoint expects a browser-like UA; empty UA returns {}.
        'User-Agent': 'MedalSocial-NextMedal/1.0 (+https://medalsocial.com)',
      },
    }
  );
  if (!result.ok || !result.data?.text) return null;
  return result.data;
}

async function fetchOembed(url: string): Promise<XOembedResponse | null> {
  const endpoint = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true&dnt=true`;
  const result = await fetchJson<XOembedResponse>(endpoint);
  if (!result.ok || !result.data?.html) return null;
  return result.data;
}

export async function fetchXEmbed(parsed: ParsedSocialUrl): Promise<SocialEmbedData> {
  const base = emptyX(parsed);

  if (parsed.id) {
    const tweet = await fetchSyndication(parsed.id);
    if (tweet) {
      const handle = tweet.user?.screen_name ?? parsed.username;
      return {
        ...base,
        authorName: tweet.user?.name ?? handle ?? null,
        authorHandle: handle ? `@${handle}` : null,
        authorUrl: handle ? `https://x.com/${handle}` : null,
        authorAvatarUrl:
          tweet.user?.profile_image_url_https?.replace('_normal.', '_bigger.') ?? null,
        text: tweet.text ?? null,
        publishedAt: tweet.created_at ?? null,
        media: pickPhotoMedia(tweet),
        isFallback: false,
      };
    }
  }

  const oembed = await fetchOembed(parsed.url);
  if (oembed?.html) {
    // Keep only the tweet <p> body — the footer is `&mdash; Author (@handle) <a>Date</a>`
    // and must not be stripped via a greedy em-dash regex (cuts real dashes in the body).
    const text = stripHtml(extractXOembedBodyHtml(oembed.html)).trim();
    const handle = parsed.username;
    return {
      ...base,
      authorName: oembed.author_name ?? handle ?? null,
      authorHandle: handle ? `@${handle}` : null,
      authorUrl: oembed.author_url ?? (handle ? `https://x.com/${handle}` : null),
      text: text || null,
      publishedAt: extractDateFromXOembedHtml(oembed.html),
      isFallback: false,
    };
  }

  return base;
}
