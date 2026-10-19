---
"@medalsocial/nextmedal": patch
---

Removes the old Video page top (`videoHero`), the page top's Mux branch, `module-options` and `uid-input`, now that content is migrated by `lean-schema`. Forks that still store `videoHero` blocks must run the `lean-schema` migration before taking this update. Mux stays opt-in for the video object. `sanity.cli.ts` sets the hosted Studio `appId` for the NextMedal project only (forks: `SANITY_STUDIO_APP_ID`). Drops the unused `video` message namespace.
