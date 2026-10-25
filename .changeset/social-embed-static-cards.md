---
"@medalsocial/nextmedal": minor
---

Replace third-party social iframe widgets with an in-house embed library: server-side oEmbed/public fetches (cached Next revalidate), Medal Social-branded static cards, YouTube click-to-load `youtube-nocookie` facade, and a graceful link-out fallback when data cannot be fetched. Fixes Sanity draft/preview stega breaking platform detection via `stegaClean` (`twitter` → `x`). See `docs/SOCIAL_EMBEDS.md`.
