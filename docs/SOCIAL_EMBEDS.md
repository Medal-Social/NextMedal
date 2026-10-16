# Social embeds

NextMedal renders Sanity `socialEmbed` blocks as **Medal-branded static cards** — no third-party widget scripts or cookies by default. Layout matches the approved mockup (Geist, Medal palette, platform glyph, author, text, media/link preview, date, “View on \<platform\>”).

## Architecture

| Layer | Path | Role |
|-------|------|------|
| Detect / normalize | `src/lib/social-embed/detect.ts` | `stegaClean` on platform + URL (draft preview), `twitter` → `x`, URL parsers |
| Resolve (server) | `src/lib/social-embed/resolve.ts` | oEmbed / public endpoints via `fetch` + `next: { revalidate: 3600 }`, 8s timeout |
| UI (server) | `src/components/blocks/objects/core/SocialEmbed.tsx` | Async RSC → `SocialEmbedCard` / zero-JS YouTube facade |
| UI (client fallback) | `…/social-embed/social-embed-fallback.tsx` | Link-out card only — no `server-only` / oEmbed |
| Portable Text (server) | `RichtextModule/Content.server.tsx` | Articles, events, newsletters, ModuleRenderer — full oEmbed cards |
| Portable Text (client) | `RichtextModule/Content.tsx` + `client.tsx` | ComponentGallery — full richtext; social embeds degrade to the link-out card |

### Gallery vs article rendering

`GalleryModuleRenderer` is a client component. It must **not** import the server `SocialEmbed` / `resolve` path (that pulls `server-only` into the client graph and breaks Next Build). It uses `RichtextModule/client`, which keeps paragraphs, images, callouts, code, lead magnets, and video rendering — only `socialEmbed` blocks become the client-safe fallback link card. Article / event / newsletter pages and the server `RichtextModule` still use `Content.server` for full Medal oEmbed cards.

### Platforms

| Platform | Data source | Notes |
|----------|-------------|-------|
| X | Syndication CDN, then publish.twitter.com oEmbed | Avatar, text, link preview (domain/title/description/image), date |
| YouTube | youtube.com oEmbed | Click-to-load `youtube-nocookie` facade via `<details>`/`<summary>` (zero client JS) |
| TikTok | tiktok.com oEmbed | Falls back to link card if oEmbed fails |
| Instagram / LinkedIn / Threads | — | Graceful link-out card (see below) |

### Instagram / LinkedIn — why fallback only

Public, token-free enrichment is not available without third-party scripts:

- **Instagram** `oembed` endpoints redirect to a login HTML wall (no JSON without an app access token).
- **LinkedIn** has no public anonymous oEmbed; OG scrapes return 404 / login walls.

We keep the Medal fallback link-out card (no scripts, no tokens). Do not add Facebook/LinkedIn SDKs.

## SEO / a11y / CLS contract

- Cards are pure RSC — no client islands (YouTube facade is `<details>`/`<summary>` + lazy iframe).
- Media and link-preview images use `next/image` inside reserved `aspect-ratio` boxes (zero CLS from cards).
- Meaningful `alt` on content images; decorative avatar/poster may use empty alt with the name elsewhere.
- Link-outs use `rel="noopener noreferrer nofollow ugc"`.
- Semantic markup: `article`, `header`, `blockquote`, `figure`/`figcaption`, `time`; YouTube play control is a focusable `<summary>` with `aria-label`.
- Server fetches: `revalidate: 3600` + 8s abort so TTFB does not hang on a dead provider.
- Instagram / LinkedIn stay on the fallback link-out card: no public token-free oEmbed/OG (see above).

## Lighthouse gate

Fixture page: `/qa/social-embeds` (lean `(embed-gate)` layout — hand-rolled CSS + locale, no site chrome, no Geist preload).

**Availability:** served on non-production (development / staging / preview) so Lighthouse can run in CI and locally. **Production returns `notFound()` (404)** unless `ALLOW_QA_SOCIAL_EMBEDS` is explicitly set. A production-mode build with no `NEXT_PUBLIC_APP_ENV`/`VERCEL_ENV` counts as production; label local Lighthouse builds with `NEXT_PUBLIC_APP_ENV=development`. The path is **never** in the public sitemap; on production (even with the flag) metadata has **no canonical** and `robots: noindex`.

YouTube fixture uses a real Medal Social channel video (`Svz_KbFAz9Y`), not a meme/rickroll.

**Scores (2026-10-15 production build):** mobile **100 / 100 / 100 / 100**, desktop **100 / 100 / 100 / 100** (Perf / A11y / Best Practices / SEO). CLS **0**. Score table + reproduce steps: [`docs/lighthouse/social-embeds.md`](./lighthouse/social-embeds.md) (raw Lighthouse JSON/HTML are CI artifacts, not committed).

Hard requirement before merge: **100** in Performance, Accessibility, Best Practices, and SEO on **both** mobile and desktop for that fixture.

## Preview / stega bug

Sanity draft mode stega-encodes string fields. Always pass `platform` and `url` through `stegaClean` from `@sanity/client/stega` before comparisons or URL parsing — otherwise `platform === 'twitter'` fails on invisible characters.

## i18n

User-facing copy lives under `socialEmbed.*` in `src/messages/{en,nb,ar}.json`.
