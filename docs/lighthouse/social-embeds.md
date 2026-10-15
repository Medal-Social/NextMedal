# Social embeds — Lighthouse gate scores

Fixture: production build (`next build` + standalone `node server.js`) of `/qa/social-embeds`
(lean `(embed-gate)` layout). Measured 2026-10-15 against local `http://127.0.0.1:3000/qa/social-embeds`.

The route is available on staging / preview / local (non-production) for this gate. Customer-facing
production returns 404 unless `ALLOW_QA_SOCIAL_EMBEDS` is set; the path is excluded from the sitemap
and carries no canonical URL in production.

Raw Lighthouse JSON/HTML reports for these runs are saved as CI/agent artifacts
(`social-embeds-mobile.report.{json,html}`, `social-embeds-desktop.report.{json,html}`).
Reproduce locally with the commands below to regenerate them beside this file.

## Scores

| Form factor | Performance | Accessibility | Best Practices | SEO |
|-------------|------------:|--------------:|---------------:|----:|
| **Mobile**  | **100**     | **100**       | **100**        | **100** |
| **Desktop** | **100**     | **100**       | **100**        | **100** |

### Key metrics (same runs)

| Metric | Mobile | Desktop |
|--------|--------|---------|
| LCP | 1.7 s (score 0.99) | 0.5 s |
| FCP | 0.8 s | 0.2 s |
| CLS | **0** | **0** |
| TBT | 30 ms | 0 ms |
| Speed Index | 0.8 s | 0.2 s |
| Observed LCP (unthrottled) | ~67 ms | ~74 ms |

## Gate checklist (verified)

- [x] Medal mockup card layout (glyph, author, text, media/link preview, date, “View on \<platform\>”)
- [x] Zero CLS from cards — reserved `aspect-ratio` + width/height on sized `<img>`
- [x] Meaningful `alt` on content images; decorative avatar/poster empty alt
- [x] Pure RSC — YouTube facade is `<details>`/`<summary>` + lazy iframe (no client island)
- [x] Link-outs use `rel="noopener noreferrer nofollow ugc"`
- [x] Semantic markup: `article` / `header` / `blockquote` / `figure` / `time`; play control is focusable `<summary aria-label=…>`
- [x] Server fetches: `revalidate: 3600` + 8s abort timeout
- [x] Instagram / LinkedIn: fallback only (no public token-free oEmbed/OG — login walls)

## Reproduce

```bash
pnpm build
# standalone (output: 'standalone'):
cp -a .next/static .next/standalone/open/NextMedal/.next/static
cp -a public .next/standalone/open/NextMedal/public
cd .next/standalone/open/NextMedal && PORT=3000 node server.js

npx lighthouse http://localhost:3000/qa/social-embeds \
  --form-factor=mobile --screenEmulation.mobile \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output=html \
  --output-path=docs/lighthouse/social-embeds-mobile

npx lighthouse http://localhost:3000/qa/social-embeds \
  --preset=desktop \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output=html \
  --output-path=docs/lighthouse/social-embeds-desktop
```
