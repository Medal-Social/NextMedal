---
"@medalsocial/nextmedal": patch
---

Upgrade dependencies to latest (Next.js 16.2.8, next-sanity 13, react-day-picker 10, Sanity 5.30, React 19.2.7, and others) and fix a batch of bugs found during the upgrade audit.

Notable fixes:

- **Middleware**: the proxy no longer double-appends next-intl's `x-middleware-*` headers, which corrupted forwarded `cookie`/`x-pathname` values reaching Server Components.
- **i18n links**: removed manual locale prefixes that double-prefixed hrefs (e.g. `/nb/nb/...`) through the locale-aware `<Link>` — affected the logo, brand menu, header fallback, and article cards/hero.
- **Error boundary**: log calls no longer detach pino methods (which threw and escalated caught errors into full-page crashes).
- **Video**: pass `src` (not the removed `url` prop) to react-player v3 so YouTube playback works; broaden hero YouTube URL parsing to `youtu.be`/`/embed`/`/shorts`.
- **Security**: close the draft-mode disable open-redirect (backslash bypass + same-origin check); reject protocol-relative URLs in `validateExternalUrl`.
- **Search/SEO**: filter search results to the requested locale; build hreflang alternates and the docs page canonical through the URL resolver so collection/locale segments are correct.
- **Sanity**: dereference Mux playback IDs in hero and body video projections; alias `seo.image` to the OG image on subpages; scope the latest-articles module by locale and fix its category filter; correct the studio "Missing SEO Metadata" field paths.
- **CMS redirects**: drop dangling-reference redirects (a deleted target no longer breaks every build) and map `index` to `/`.
- **UI**: unify heading-anchor slugging (Unicode-aware, matches the table of contents), fix Cmd+K opening duplicate command dialogs, close the mobile menu on navigation/Escape, remove a hydration-breaking `uploadDate` from YouTube JSON-LD, fix duplicated Features cards in sidebar mode, and render decimal prices correctly.
- Allow the Umami analytics origin through the CSP, and align the Dockerfile pnpm version with `packageManager`.
