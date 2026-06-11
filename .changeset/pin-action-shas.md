---
"@medalsocial/nextmedal": patch
---

Pin all third-party GitHub Actions to commit SHAs (supply-chain hardening). The deploy workflows (`cloudflare-prod`/`cloudflare-staging`) run with the Cloudflare API token and Worker secrets, so a compromised version tag on an action would have been able to exfiltrate them. `cloudflare/wrangler-action`, `actions/checkout`, `actions/setup-node`, `pnpm/action-setup`, and `actions/github-script` are now pinned to immutable SHAs (`# vN` retained as a comment for readability).
