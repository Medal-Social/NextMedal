---
"@medalsocial/nextmedal": patch
---

Coerce empty-string environment variables to `undefined` before validation. CI/CD systems expand unset secrets (e.g. GitHub Actions `${{ secrets.MISSING }}`) to `""`, which previously slipped past `.optional()` and then failed `url()` / `min(1)` validation — crashing every request at runtime with "Invalid environment variables". Optional vars passed as empty strings are now treated as absent, so a deploy with some optional secrets unconfigured boots correctly.
