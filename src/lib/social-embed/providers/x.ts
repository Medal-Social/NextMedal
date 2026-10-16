import { fetchJson } from '../fetch-json';
import { extractDateFromXOembedHtml, extractXOembedBodyHtml, stripHtml } from '../strip-html';
import type {
  ParsedSocialUrl,
  SocialEmbedData,
  SocialEmbedLinkPreview,
  SocialEmbedMedia,
} from '../types';

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

interface XSyndicationBindingValue {
  type?: string;
  string_value?: string;
  image_value?: XSyndicationImageValue;
}

interface XSyndicationCard {
  binding_values?: Record<string, XSyndicationBindingValue>;
  url?: string;
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

function stringBinding(
  values: Record<string, XSyndicationBindingValue> | undefined,
  key: string
): string | null {
  const value = values?.[key]?.string_value?.trim();
  return value || null;
}

function imageBinding(
  values: Record<string, XSyndicationBindingValue> | undefined,
  ...keys: string[]
): SocialEmbedMedia | null {
  if (!values) return null;
  for (const key of keys) {
    const preferred = values[key]?.image_value;
    if (preferred?.url) {
      const width = preferred.width;
      const height = preferred.height;
      return {
        url: preferred.url,
        width,
        height,
        alt: preferred.alt,
        aspectRatio: width && height && height > 0 ? `${width} / ${height}` : '1.91 / 1',
      };
    }
  }
  return null;
}

function pickLinkPreview(card: XSyndicationCard | undefined): SocialEmbedLinkPreview | null {
  const values = card?.binding_values;
  if (!values) return null;

  const title = stringBinding(values, 'title');
  const description = stringBinding(values, 'description');
  const domain = stringBinding(values, 'vanity_url') ?? stringBinding(values, 'domain');
  const url = stringBinding(values, 'card_url') ?? card.url ?? null;
  const image = imageBinding(
    values,
    'photo_image_full_size_large',
    'summary_photo_image',
    'thumbnail_image_large',
    'thumbnail_image'
  );

  if (!title && !description && !domain && !image) return null;

  const alt =
    stringBinding(values, 'photo_image_full_size_alt_text') ??
    stringBinding(values, 'summary_photo_image_alt_text') ??
    title ??
    undefined;

  return {
    domain,
    title,
    description,
    url,
    image: image ? { ...image, alt: alt ?? image.alt } : null,
  };
}

function pickPhotoMedia(tweet: XSyndicationTweet): SocialEmbedMedia | null {
  const photo = tweet.photos?.[0];
  if (photo?.url) {
    const width = photo.width;
    const height = photo.height;
    return {
      url: photo.url,
      width,
      height,
      aspectRatio: width && height && height > 0 ? `${width} / ${height}` : '1 / 1',
    };
  }
  const detail = tweet.mediaDetails?.[0];
  if (detail?.media_url_https) {
    const width = detail.original_info?.width;
    const height = detail.original_info?.height;
    return {
      url: detail.media_url_https,
      width,
      height,
      aspectRatio: width && height && height > 0 ? `${width} / ${height}` : '1 / 1',
    };
  }
  return null;
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
    linkPreview: null,
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
      const linkPreview = pickLinkPreview(tweet.card);
      // Prefer native photos for the media slot; card images live on linkPreview.
      const media = pickPhotoMedia(tweet);
      return {
        ...base,
        authorName: tweet.user?.name ?? handle ?? null,
        authorHandle: handle ? `@${handle}` : null,
        authorUrl: handle ? `https://x.com/${handle}` : null,
        authorAvatarUrl:
          tweet.user?.profile_image_url_https?.replace('_normal.', '_bigger.') ?? null,
        text: tweet.text ?? null,
        publishedAt: tweet.created_at ?? null,
        media,
        linkPreview,
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
