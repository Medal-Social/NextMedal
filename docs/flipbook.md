# Flipbook block

Upload a PDF in Studio (**Add block → Content Sections → Flipbook**) and it renders as a
page-turning book: spreads on desktop, single pages on phones, tap/swipe/drag to turn,
double-tap to zoom, thumbnails, fullscreen and download.

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
- **PostCSS cascade-layer polyfills.** Sites that flatten Tailwind's `@layer` rules (e.g. Medal's
  `@medalsocial/postcss-compat`) boost the preflight reset above plain component CSS. Import
  `@medalsocial/postcss-compat/page-scoped-layers.css` at the top of `flipbook.css` there.
- **Large PDFs.** pdf.js downloads the whole file (Sanity's CDN doesn't expose range support to
  the browser). A 145-page / 48 MB book works (usable in a few seconds, ~10 s for all pages), but
  readers pay the full download.

## Using it in code

```tsx
import { Flipbook } from '@/components/blocks/objects/flipbook';

<Flipbook src={url} title="Annual report" startPage={3} poweredBy={false} onPageChange={({ page }) => track(page)} />
```

## Security notes

- pdf.js (`pdfjs-dist`) is the only third-party runtime dependency. It is pinned exactly; update it through the dependency routine.
- The worker is bundled same-origin (works with `script-src 'self'`). No CDN is used.
- The page-turn engine (`leaf.ts`) is in-house and has no dependencies.
