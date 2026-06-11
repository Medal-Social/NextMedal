---
"@medalsocial/nextmedal": patch
---

Retire the Azure Container Apps deploy path. NextMedal now deploys exclusively via Cloudflare Workers (`@opennextjs/cloudflare`). Removes `prod.yml` (the Azure prod deploy), `container-app.yaml`, and the three Azure per-PR `preview*.yml` workflows, and updates the docs/comments that referenced them. The generic `Dockerfile` is kept for self-hosting.
