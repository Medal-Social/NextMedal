# Social embeds

NextMedal renders Sanity `socialEmbed` blocks as **Medal-branded static cards** — no third-party widget scripts or cookies by default.

## Architecture

| Layer | Path | Role |
|-------|------|------|
| Detect / normalize | `src/lib/social-embed/detect.ts` | `stegaClean` on platform + URL (draft preview), `twitter` → `x`, URL parsers |
| Resolve (server) | `src/lib/social-embed/resolve.ts` | oEmbed / public endpoints via `fetch` + `next: { revalidate: 3600 }` |
| UI | `src/components/blocks/objects/core/SocialEmbed.tsx` | Async RSC → `SocialEmbedCard` / YouTube facade |
| Portable Text | `RichtextModule/Content.tsx` | Suspense around the async embed |

### Platforms

| Platform | Data source | Notes |
|----------|-------------|-------|
| X | Syndication CDN, then publish.twitter.com oEmbed | Avatar, text, media, date |
| YouTube | youtube.com oEmbed | Click-to-load `youtube-nocookie` facade |
| TikTok | tiktok.com oEmbed | Falls back to link card if oEmbed fails |
| Instagram / LinkedIn / Threads | — | Graceful link-out card (no public token-free oEmbed) |

## Preview / stega bug

Sanity draft mode stega-encodes string fields. Always pass `platform` and `url` through `stegaClean` from `@sanity/client/stega` before comparisons or URL parsing — otherwise `platform === 'twitter'` fails on invisible characters.

## i18n

User-facing copy lives under `socialEmbed.*` in `src/messages/{en,nb,ar}.json`.
