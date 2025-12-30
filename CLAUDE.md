# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NextMedal is a Next.js 16 + Sanity CMS website template built by Medal Social. It features Server Components, Turbopack, i18n support (Norwegian/English), and Docker-optimized standalone output.

## Commands

```bash
# Development
pnpm dev                    # Start dev server with Turbopack (http://localhost:3000)
pnpm build                  # Production build
pnpm start                  # Run production build

# Code Quality
pnpm lint                   # Run Biome linting
pnpm format                 # Auto-format with Biome
pnpm typecheck              # TypeScript type checking

# Testing
pnpm test                   # Run all tests once
pnpm test:watch             # Run tests in watch mode
vitest src/test/components/ui/header-footer.test.tsx  # Run single test file

# Docker
pnpm docker:build           # Build production Docker image
```

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js 16 App Router
│   ├── (frontend)/         # Main website routes with [locale] parameter
│   ├── (studio)/           # Sanity CMS Studio at /studio
│   └── api/                # API routes (search, draft-mode)
├── ui/                     # 30+ page-level UI components and modules
├── components/ui/          # Reusable base UI primitives
├── sanity/schemaTypes/     # 38 Sanity schema definitions
├── lib/                    # Core utilities (logger, env, utils, safe-action)
├── i18n/                   # Internationalization config
└── test/                   # Vitest test setup and test files
```

### Key Patterns

- **Server Components by default**: Use `'use client'` only when needed
- **Sanity integration**: Schemas in `sanity/schemaTypes/`, Studio at `/studio`
- **i18n routing**: `[locale]` dynamic segment for Norwegian (nb) and English (en)
- **Environment validation**: Zod-validated env vars in `lib/env.ts`
- **Structured logging**: Pino logger in `lib/logger.ts` with Sentry hooks (production-only)
- **Safe server actions**: Use `next-safe-action` wrapper in `lib/safe-action.ts`

### Next.js 16 Middleware Naming

In Next.js 16+, middleware MUST be named `proxy.ts` (not `middleware.ts`) and export a function named `proxy`.

## Code Style (Biome)

- **Formatting**: 2 spaces, single quotes, semicolons always, 100 char line width
- **Imports**: Organize alphabetically by group (built-ins → external → internal)
- **Accessibility**: `alt` text required on all images (error)
- **Console**: Minimize `console.log` in production code
- **React hooks**: Exhaustive dependencies required
- **Non-null assertions (`!`)**: Allowed but use sparingly

Component organization: Hooks first → derived state → internal functions → return statement

### Naming Conventions

- **Descriptive variable names**: Avoid single-letter variables for non-trivial objects. Use self-documenting names that convey meaning.
  - Bad: `source: (d) => d.title`
  - Good: `source: (doc) => doc.title` or `source: (document) => document.title`
- **Callback parameters**: Use meaningful names in callbacks, especially for Sanity schema definitions where `doc`, `document`, or the specific type name (e.g., `post`, `author`) makes the code more readable.
- **Loop variables**: Single-letter variables like `i`, `j`, `k` are acceptable for simple loop indices, but prefer descriptive names for complex iterations.

## Responsive Design Requirements

All UI components and design work MUST be tested across these device sizes:

### Target Devices (2025 Standard)

| Device | Width | Priority |
|--------|-------|----------|
| Samsung Galaxy / Android baseline | 360px | Required |
| iPhone 14/15 | 390px | Required |
| Large phones landscape | 640px | Required |
| iPad Mini portrait | 768px | Required |
| iPad Air portrait | 820px | Recommended |
| Small laptops | 1024px | Required |
| Desktop | 1280px+ | Required |

### Tailwind CSS Breakpoints

| Breakpoint | Min Width | Use For |
|------------|-----------|---------|
| Base (no prefix) | 0px | Mobile-first styles |
| `sm` | 640px | Large phones, phablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops, large tablets landscape |
| `xl` | 1280px | Desktops |

### Design Principles

- **Mobile-first**: Write base styles for mobile, add complexity at larger breakpoints
- **Touch targets**: Minimum 44px for interactive elements (Apple HIG)
- **Target spacing**: Minimum 8px between adjacent touch targets (WCAG 2.2)
- **Collapsible patterns**: Hide secondary UI on mobile, provide toggle to reveal
- **Responsive spacing**: Use smaller gaps on mobile (e.g., `gap-3 sm:gap-4`)
- **Responsive sizing**: Scale elements appropriately (e.g., `size-7 md:size-9`)

### Accessibility Requirements (WCAG 2.2 + Vercel Guidelines)

- **Color independence**: Don't rely on color alone; include text labels
- **Reduced motion**: Honor `prefers-reduced-motion` media query
- **Semantic HTML**: Use `<button>`, `<a>`, `<label>` before ARIA attributes
- **Focus indicators**: Visible focus states on all interactive elements
- **Color contrast**: 4.5:1 for normal text, 3:1 for large text (WCAG AA)

### Testing Checklist

Before completing any UI/design work, verify:

- [ ] Layout works at 360px width (Android baseline)
- [ ] Layout works at 390px width (iPhone 14/15)
- [ ] Layout works at 768px width (tablet)
- [ ] Layout works at 1280px+ width (desktop)
- [ ] Touch targets are at least 44px
- [ ] 8px minimum spacing between adjacent targets
- [ ] Text is readable without horizontal scrolling
- [ ] Interactive elements are easily tappable
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1 / 3:1)

## SEO Requirements

All pages MUST meet these standards for maximum search visibility.

### Core Web Vitals Thresholds (Google)

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | ≤2.5s | 2.5s–4s | >4s |
| INP (Interaction to Next Paint) | ≤200ms | 200ms–500ms | >500ms |
| CLS (Cumulative Layout Shift) | ≤0.1 | 0.1–0.25 | >0.25 |

### Metadata Requirements

Every page MUST have:
- **Title**: 50-60 characters, unique per page, primary keyword near start
- **Description**: 70-160 characters, compelling call-to-action
- **Canonical URL**: Absolute URL, one per page
- **OG Image**: 1200×630px, unique or auto-generated
- **hreflang**: For all language variants (handled by `processMetadata.ts`)

### Structured Data (JSON-LD)

Required schemas by content type:

| Content Type | Required Schema | Status |
|--------------|-----------------|--------|
| All pages | `Organization`, `WebSite`, `BreadcrumbList` | ✅ Implemented |
| Blog posts | `BlogPosting` or `Article` | ✅ Implemented |
| Newsletter | `NewsArticle` | ✅ Implemented |
| Documentation | `TechArticle` | ✅ Implemented |
| Events | `Event` | ✅ Implemented |
| Pricing pages | `Product` with `Offer` | Required |
| FAQ sections | `FAQPage` with `Question`/`Answer` | Required |
| Video content | `VideoObject` | Required |
| Testimonials | `Review` or `AggregateRating` | Required |
| Tutorials | `HowTo` with `HowToStep` | Recommended |

**Implementation notes:**
- `FAQPage`: Add to any page with FAQ accordion/section (improves featured snippets)
- `Product`: Required for pricing tiers, include `offers` with `price` and `priceCurrency`
- `VideoObject`: Required for embedded YouTube/Vimeo, include `thumbnailUrl`, `duration`, `uploadDate`
- `Review`: Add to testimonial sections with `author`, `reviewRating`
- Validate all schemas with [Google Rich Results Test](https://search.google.com/test/rich-results)

### Content Structure

- **One `<h1>` per page**: Contains primary keyword
- **Logical heading hierarchy**: h1 → h2 → h3 (never skip levels)
- **Internal links**: Link to related content using descriptive anchor text
- **Image alt text**: Descriptive, includes keywords where natural
- **URL structure**: Lowercase, hyphens, descriptive slugs (`/blog/seo-best-practices`)

### Image Optimization

- **Format**: WebP preferred, fallback to JPEG/PNG
- **Sizing**: Use `next/image` with explicit width/height (prevents CLS)
- **Loading**: `loading="lazy"` for below-fold, `priority` for LCP images
- **Alt text**: Required on all images, descriptive and keyword-aware
- **Aspect ratio**: Maintain consistent ratios to prevent layout shift

### Performance Optimization

- **Server Components**: Default for all pages (faster TTFB)
- **Code splitting**: Dynamic imports for heavy components
- **Font loading**: `next/font` with `display: swap`
- **Third-party scripts**: Load async/defer, use `next/script`
- **Preconnect**: Add for external domains (CDN, analytics)

### SEO Checklist

Before publishing any page, verify:

**Metadata**
- [ ] Title is 50-60 characters with primary keyword
- [ ] Description is 70-160 characters with CTA
- [ ] OG image is present (custom or auto-generated)
- [ ] Canonical URL is correct

**Content**
- [ ] Single `<h1>` with primary keyword
- [ ] Logical heading hierarchy (h1 → h2 → h3)
- [ ] All images have descriptive alt text
- [ ] Internal links to related content
- [ ] URLs are clean and descriptive

**Performance**
- [ ] LCP ≤2.5s (test with Lighthouse)
- [ ] INP ≤200ms
- [ ] CLS ≤0.1
- [ ] No render-blocking resources

**Structured Data**
- [ ] Appropriate schema for content type
- [ ] Validated with Google Rich Results Test
- [ ] No errors in Search Console

## Sanity Guidelines

**Schema patterns:**
- Use `defineType`, `defineField`, `defineArrayMember` helpers
- Export named const matching filename (e.g., `lessonType` in `lessonType.ts`)
- Images require `options.hotspot: true`
- Prefer `string` with `options.list` over `boolean` fields
- Use arrays of references, not single references
- **Inline objects in arrays MUST have a `name` property** - required for copy/paste, GraphQL, and TypeGen
  - Bad: `defineArrayMember({ type: 'object', fields: [...] })`
  - Good: `defineArrayMember({ name: 'my-item', type: 'object', fields: [...] })`
  - Run `pnpm lint:sanity` to check for missing names
- GROQ variables: SCREAMING_SNAKE_CASE (e.g., `POST_QUERY`)
- After schema changes: `npx sanity@latest schema extract`

**Data fetching:**
- Use `sanityFetch` from `@/sanity/lib/live` (wraps Live Content API)
- Revalidation is automatic via `<SanityLive>` component - no webhooks needed
- Use GROQ projections - only fetch fields you need
- Use `useCdn: false` only in draft/preview mode

**Portable Text:**
- Use Next.js `<Link>` for internal links in custom components
- Handle missing references gracefully (deleted docs may be referenced)

## Testing

- Framework: Vitest + Testing Library + vitest-axe for accessibility
- Setup file: `src/test/setup.tsx` (mocks ResizeObserver, PointerEvent, scrollIntoView)
- Coverage thresholds: 40% lines, 35% functions, 25% branches

## Package Manager

This project uses **pnpm** (enforced via `packageManager` field). Do not use npm or yarn.

## Environment Variables

Required:
```
NEXT_PUBLIC_SANITY_PROJECT_ID    # Sanity project ID
NEXT_PUBLIC_SANITY_DATASET       # Sanity dataset (usually "production")
NEXT_PUBLIC_SANITY_BROWSER_TOKEN            # Sanity API token for server-side fetching
NEXT_PUBLIC_BASE_URL             # Site base URL
```

Optional:
```
NEXT_PUBLIC_SENTRY_DSN           # Enables Sentry error tracking (production-only)
NEXT_PUBLIC_UMAMI_SCRIPT_URL     # Umami analytics script URL
NEXT_PUBLIC_IMAGE_PROXY_URL      # Custom image proxy (enables custom loader)
```

## Git Workflow

- **Main branch**: `dev`
- **Production deploy**: Push to `prod` branch triggers Azure Container Apps deployment
- **Pre-commit hook**: Runs `pnpm lint` (Biome check)

## Image Handling

Allowed remote image sources:
- `cdn.sanity.io` (Sanity assets)
- `image.mux.com` (Mux video thumbnails)
- `img.youtube.com` (YouTube thumbnails)

SVGs are allowed via `dangerouslyAllowSVG`. Custom image proxy can be enabled via `NEXT_PUBLIC_IMAGE_PROXY_URL`.

## CMS-Managed Redirects

Redirects are fetched from Sanity at build time using the `redirect` document type. To add a redirect, create a new redirect document in Sanity Studio rather than hardcoding in `next.config.ts`.

## Error Monitoring (Sentry)

- Sentry initializes **only in production** (see `instrumentation.ts`)
- Uses `/monitoring` tunnel route to bypass ad-blockers
- Source maps are uploaded during build then deleted
- PII transmission is disabled for privacy
- Integrates with Pino logger - error-level logs auto-report to Sentry

