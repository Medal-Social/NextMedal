---
"@medalsocial/nextmedal": patch
---

Keep the Sanity Viewer token on the server. Draft mode, visual editing, and server reads use `SANITY_API_READ_TOKEN` from a `server-only` module, and `defineLive` no longer receives a browser token. `pnpm scan:client-tokens` fails the build when a Sanity token pattern or a `*TOKEN` value is present in `.next/static` or a Studio bundle.
