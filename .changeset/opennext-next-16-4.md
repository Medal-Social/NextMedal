---
"@medalsocial/nextmedal": patch
---

Bump `@opennextjs/cloudflare` to 1.20.12 and `wrangler` to 4.151 so the Cloudflare Worker supports Next 16.4. With 1.20.4 every request failed with `Unexpected loadManifest(/.next/server/preview-props.json) call!` (staging 500 since the Next 16.3.8 bump resolved to 16.4.2).
