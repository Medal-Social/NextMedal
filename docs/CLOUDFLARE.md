# Deploying NextMedal to Cloudflare Workers

NextMedal can deploy to **Cloudflare Workers** via the
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) adapter, as an
alternative to the Azure Container Apps path (`prod.yml` / `Dockerfile`). This is
how `nextmedal.com` is intended to run.

## Files

| File | Purpose |
|------|---------|
| `wrangler.jsonc` | Worker config. Top level = staging (`nextmedal-staging` → `staging.nextmedal.com`); `env.production` = prod (`nextmedal` → `nextmedal.com` + `www`). |
| `open-next.config.ts` | OpenNext adapter config (defaults; cache/queue can be added later). |
| `cloudflare-worker.js` | Worker entry — wraps the generated OpenNext worker and gzips HTML responses. |
| `.dev.vars.example` | Template for local Worker preview env (`cp` to `.dev.vars`). |
| `.github/workflows/cloudflare-staging.yml` | Deploys on push to `dev`. |
| `.github/workflows/cloudflare-prod.yml` | Deploys on push to `prod`. |

## Local commands

```bash
pnpm preview            # Build + run the Worker locally (opennextjs-cloudflare preview)
pnpm deploy:staging     # Build + wrangler deploy (staging.nextmedal.com)
pnpm deploy:production   # Build + wrangler deploy --env production (nextmedal.com)
```

`pnpm dev` (plain `next dev`) is unaffected and still the day-to-day dev command.

## CI deploys (recommended)

The two workflows are **dormant by default**. To enable automatic deploys:

1. **Repository variable:** set `CLOUDFLARE_DEPLOY_ENABLED = true`
   (Settings → Secrets and variables → Actions → Variables).
2. **Environment secrets** — add to the `Staging` and `Prod` GitHub environments:
   - `CLOUDFLARE_API_TOKEN` — a token with *Workers Scripts: Edit* (+ *Workers
     Routes: Edit* for custom domains) on the Medal Cloudflare account.
   - `CLOUDFLARE_ACCOUNT_ID` — the account ID.
   - `NEXT_PUBLIC_SANITY_BROWSER_TOKEN`, `NEXT_PUBLIC_UMAMI_SCRIPT_URL`,
     `NEXT_PUBLIC_UMAMI_WEBSITE_ID` (optional — for live preview / analytics).
   - `SANITY_WRITE_TOKEN`, `MEDAL_API_KEY`, `MEDAL_API_ENDPOINT` (optional — only
     if those features are used). These are pushed to the Worker as secrets.

   The `Prod` environment already holds the Sanity secrets used by the Azure
   workflow; you only need to add the two `CLOUDFLARE_*` values there.

The public Sanity project/dataset/base-URL are hardcoded in the workflows and
`wrangler.jsonc` (they are `NEXT_PUBLIC_*`, inlined at build).

## Custom domains

`wrangler.jsonc` declares `custom_domain` routes for `staging.nextmedal.com`,
`nextmedal.com`, and `www.nextmedal.com`. The `nextmedal.com` zone must be on the
same Cloudflare account as the Worker; wrangler attaches the domains on first
deploy. Until DNS is cut over to Cloudflare, the Azure deploy keeps serving the
domain.

## Sanity Studio

On the Cloudflare build the **embedded Studio is excluded** from the Worker — the
`sanity.config` graph (every schema + Studio plugin) is several MB and would blow
past the Worker size limit. The `(studio)` route detects the `CLOUDFLARE_BUILD`
flag (inlined via `next.config.ts`), dead-code-eliminates the Studio import, and
redirects `/studio` to the **hosted Studio**.

➡️ **Deploy the hosted Studio once:** `npx sanity deploy` and choose the hostname
`nextmedal` so it lives at `https://nextmedal.sanity.studio`. On Azure/Vercel the
Studio stays embedded at `/studio` as before.

## Known considerations

- **Worker size:** the production Worker is ~6 MB gzipped (under the 10 MiB paid
  limit). Adding heavy server-side dependencies can push it over — re-check with
  `pnpm deploy:staging` (wrangler reports the size).
- **`isomorphic-dompurify` / `jsdom`:** pulled into the server bundle for HTML
  sanitization. Verify sanitized content (e.g. portable-text HTML) renders on the
  first Worker deploy.
- **Middleware runtime:** the i18n middleware lives in `src/middleware.ts` (Edge),
  not `proxy.ts` (Node) — OpenNext can't bundle Next 16's Node-runtime proxy yet
  ([opennextjs-cloudflare#972](https://github.com/opennextjs/opennextjs-cloudflare/issues/972)).
