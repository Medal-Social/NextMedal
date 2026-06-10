---
"@medalsocial/nextmedal": minor
---

Add a Cloudflare Workers deployment path via the `@opennextjs/cloudflare` adapter (alongside the existing Azure Container Apps option). Includes `wrangler.jsonc` (staging + production targets), `open-next.config.ts`, a Worker entry that gzips HTML, `pnpm preview`/`deploy:staging`/`deploy:production` scripts, and dormant `cloudflare-staging`/`cloudflare-prod` CI workflows. On the Cloudflare build the image optimizer is disabled (no sharp on Workers) and the embedded Studio is excluded from the Worker (served from the hosted Studio instead). The i18n middleware moved from `proxy.ts` to `middleware.ts` so it runs on the Edge runtime OpenNext supports. See `docs/CLOUDFLARE.md`.
