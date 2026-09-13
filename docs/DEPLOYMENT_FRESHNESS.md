# Fresh pages across deployments

The Cloudflare entry point applies `cloudflare/freshness.js` to outgoing HTML and
RSC responses. Browsers must revalidate these responses; existing `no-store`
policies remain intact. Internal server caches, API policies, and compressed
response bodies are preserved. `public/_headers` caches content-versioned
`/_next/static/*` files immutably so repeat visits reuse JavaScript, CSS and fonts.

`next.config.ts` sets `deploymentId` from `NEXT_DEPLOYMENT_ID` or `GITHUB_SHA`.
GitHub Actions supplies the latter. For other build systems, set a stable unique
`NEXT_DEPLOYMENT_ID` when building and use that same build when deploying. This
also enables Next.js deployment handling on non-Cloudflare targets, but the
Cloudflare response wrapper and `_headers` only apply on Cloudflare; configure
your other hosting adapter's outgoing page/asset policies separately.

The Cloudflare production and staging workflows run `scripts/ci/smoke.mjs`.
It verifies the deployed ID on ordinary/repeated/cookie-bearing homepage loads,
checks navigation responses, and verifies immutable build assets. Outside CI:

```sh
SMOKE_URL=https://your-site.example SMOKE_EXPECTED_DEPLOYMENT_ID=your-build-id node scripts/ci/smoke.mjs
```

Run `node --test scripts/ci/*.test.mjs` for the smoke-check tests and
`pnpm exec vitest run --project unit tests/unit/cloudflare/freshness.test.ts` for
the response policy. The implementation is self-contained for cloned templates.

Next.js can recover across deployments when navigation reaches the server.
There is no timer forcing idle tabs to reload. Already-prefetched routes can
remain in client memory until another server request. Test a persistent browser
across two staging releases, including forms and checkout, before adding broader
update behavior. Do not interrupt unsaved work to force an immediate refresh.
