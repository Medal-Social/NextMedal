# Flipbook block

Upload a PDF in Studio (**Add block → Content Sections → Flipbook**) and it renders as a
page-turning book: spreads on desktop, single pages on phones, tap/swipe/drag to turn,
double-tap to zoom, thumbnails, fullscreen and download.

On phones the book runs edge to edge, and **Read full screen** opens a reading mode whose
toolbar floats over the page and steps aside after a moment (tap the middle of the page to
bring it back). Tapping a page edge turns at once; inline, a tap in the middle turns too.

## Re-skinning for a customer site

The flipbook paints only from `--fb-*` CSS custom properties. Override them in the site's
`globals.css`:

```css
.fb {
  --fb-accent: var(--color-brand-700);
  --fb-accent-strong: var(--color-brand-900);
  --fb-accent-soft: var(--color-brand-100);
  --fb-stage-bg: linear-gradient(180deg, var(--color-brand-100), var(--color-brand-200));
  --fb-radius: 8px;
}
```

Dark sites get dark chrome automatically (`.dark .fb { … }` in the stylesheet); override the
same tokens under `.dark .fb` to change it.

The full token list is in `src/components/blocks/objects/flipbook/flipbook.css` (top block).

Overrides win regardless of stylesheet order: the component's defaults use `:where(.fb)` (zero
specificity), so any `.fb { … }` rule in the site beats them.

## Requirements per site

- **Sanity CORS origins.** Sanity's CDN enforces the project's CORS origins on file downloads
  (`403 CORS Origin not allowed` otherwise). Every origin that shows a flipbook — production,
  staging, preview hosts and the local port you develop on — must be listed in
  sanity.io/manage → API → CORS origins.
- **Content-Security-Policy.** If the site sets `connect-src`, allow the project's file assets:
  `https://cdn.sanity.io/files/<projectId>/`. Page images are `blob:` URLs; if the site sets
  `img-src`, include `blob:`. pdf.js runs in a same-origin module worker; if the site sets `worker-src`,
  include `'self'`.
- **PostCSS cascade-layer polyfills.** Sites that flatten Tailwind's `@layer` rules (e.g. Medal Social's
  `@medalsocial/postcss-compat`) boost the preflight reset above plain component CSS. Import
  `@medalsocial/postcss-compat/page-scoped-layers.css` at the top of `flipbook.css` there.
- **Large PDFs.** pdf.js downloads the whole file (Sanity's CDN doesn't expose range support to
  the browser), so readers pay the full download. A 145-page / 48 MB book is usable in a few
  seconds. Pages are then prepared on demand around the reading position (`page-cache.ts`:
  nearest first, paused while a page turns, at most 24 page images kept), and thumbnails only
  for what the drawer shows, so big books stay smooth and light.
  A jump cancels obsolete window work, including the wait for canvas encoding.
  Native encoding may finish later, but cancelled results never enter the cache:
  late object URLs are revoked and the newly visible spread can render immediately.
  Only recent explicit page requests are requeued, within the existing queue cap.
- **Ported copies.** Sites that carry their own copy of the block also need the
  `readFullscreen` label in their messages and `className="max-sm:px-0"` on the module's
  `<Section>` (the edge-to-edge phone book).

## Using it in code

```tsx
import { Flipbook } from '@/components/blocks/objects/flipbook';

<Flipbook src={url} title="Annual report" startPage={3} poweredBy={false} onPageChange={({ page }) => track(page)} />
```

## Security notes

- pdf.js (`pdfjs-dist`) is the only third-party runtime dependency. It is pinned exactly; update it through the dependency routine.
- The worker is bundled same-origin (works with `script-src 'self'`). No CDN is used.
- The page-turn engine (`leaf.ts`) is in-house and has no dependencies.
