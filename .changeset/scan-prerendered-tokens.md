---
"@medalsocial/nextmedal": patch
---

`pnpm scan:client-tokens` also checks prerendered `.html` and `.rsc` files, and it skips `data:` URIs so inlined base64 does not look like a Sanity token.
