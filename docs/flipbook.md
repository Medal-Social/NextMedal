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

## Using it in code

```tsx
import { Flipbook } from '@/components/blocks/objects/flipbook';

<Flipbook src={url} title="Annual report" startPage={3} poweredBy={false} onPageChange={({ page }) => track(page)} />
```

## Security notes

- pdf.js (`pdfjs-dist`) is the only third-party runtime dependency. It is pinned exactly; update it through the dependency routine.
- The worker is bundled same-origin (works with `script-src 'self'`). No CDN is used.
- The page-turn engine (`leaf.ts`) is in-house and has no dependencies.
