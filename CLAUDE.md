# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NextMedal is a Next.js 16 + Sanity CMS website template built by Medal Social. It features Server Components, Turbopack, i18n support (Norwegian/English/Arabic), Docker-optimized standalone output, and a flexible article system for content publishing.

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

# Testing (Vitest)
pnpm test                   # Run all unit/integration/component tests
pnpm test:watch             # Run tests in watch mode
pnpm test:unit              # Run unit tests only
pnpm test:components        # Run component tests only
pnpm test:integration       # Run integration tests only
pnpm test:contracts         # Run API contract tests
pnpm test:coverage          # Run tests with coverage report

# E2E Testing (Playwright)
pnpm e2e                    # Run full E2E tests
pnpm e2e:smoke              # Run smoke tests (quick critical paths)
pnpm e2e:visual             # Run visual regression tests
pnpm e2e:visual:update      # Update visual baselines
pnpm e2e:a11y               # Run accessibility tests
pnpm e2e:perf               # Run performance/Lighthouse tests

# Docker
pnpm docker:build           # Build production Docker image
```

## Architecture

### Directory Structure

```
project-root/
├── src/                    # Production source code
│   ├── app/                # Next.js 16 App Router
│   │   ├── (frontend)/     # Main website routes with [locale] parameter
│   │   ├── (studio)/       # Sanity CMS Studio at /studio
│   │   └── api/            # API routes (search, draft-mode)
│   ├── components/         # React components
│   │   ├── ui/             # Reusable base UI primitives (41 components)
│   │   ├── blocks/         # Content modules and page-level components (130+ files)
│   │   │   ├── modules/    # Content modules (hero, features, testimonials, etc.)
│   │   │   ├── objects/    # Reusable objects (CTA, icons, video, etc.)
│   │   │   ├── layout/     # Layout components (header, footer, banner)
│   │   │   └── seo/        # SEO components (JSON-LD, breadcrumbs)
│   │   ├── layout/         # Additional layout utilities
│   │   ├── icons/          # Icon components
│   │   └── dashboard/      # Sanity Studio dashboard components
│   ├── sanity/schemaTypes/ # 66 Sanity schema definitions
│   ├── lib/                # Core utilities (logger, env, utils, safe-action)
│   └── i18n/               # Internationalization config
│
└── tests/                  # All tests (85+ test files)
    ├── unit/               # Pure function tests (Vitest, ~30 files)
    │   ├── lib/            # Utils, helpers, pure logic
    │   ├── sanity/         # Sanity utilities
    │   └── config/         # Configuration validation
    ├── components/         # React component tests (Vitest + Testing Library, ~41 files)
    │   ├── ui/             # Base UI primitives
    │   ├── blocks/         # Block components
    │   └── layout/         # Layout components
    ├── integration/        # Multi-module tests (Vitest, ~14 files)
    │   ├── api/            # API route integration
    │   ├── hooks/          # Custom hooks
    │   └── forms/          # Form validation
    ├── contracts/          # API contract tests (Vitest + Zod)
    ├── e2e/                # End-to-end tests (Playwright, ~13 files)
    │   ├── smoke/          # Quick critical path tests
    │   ├── specs/          # Full E2E test specs
    │   ├── visual/         # Visual regression tests
    │   ├── performance/    # Lighthouse performance tests
    │   └── accessibility/  # WCAG compliance tests
    ├── fixtures/           # Shared test data
    │   ├── sanity/         # Sanity mock data
    │   └── playwright/     # Playwright fixtures
    └── setup/              # Test configuration
```

### Key Patterns

- **Server Components by default**: Use `'use client'` only when needed
- **Sanity integration**: Schemas in `sanity/schemaTypes/`, Studio at `/studio`
- **i18n routing**: `[locale]` dynamic segment for Norwegian (nb), English (en), and Arabic (ar)
- **Environment validation**: Zod-validated env vars in `lib/env.ts`
- **Structured logging**: Pino logger in `lib/logger.ts` with Sentry hooks (production-only)
- **Safe server actions**: Use `next-safe-action` wrapper in `lib/safe-action.ts`
- **Article system**: Flexible content publishing with categories, authors, and SEO optimization

## Internationalization (i18n)

### Single Source of Truth

**All language configuration is centralized in `src/i18n/config.ts`**. This is the ONLY file you need to edit to add a new language.

```typescript
// src/i18n/config.ts
export const LOCALE_CONFIG = {
  en: { title: 'English', dateLocale: enUS, dir: 'ltr' },
  nb: { title: 'Norsk', dateLocale: nb, dir: 'ltr' },
  ar: { title: 'العربية', dateLocale: ar, dir: 'rtl' },
} as const;
```

### Adding a New Language

To add a new language:
1. Import the date-fns locale in `src/i18n/config.ts`
2. Add an entry to `LOCALE_CONFIG` with title, dateLocale, and dir
3. Create a translation file in `src/messages/[locale].json`
4. Run `pnpm generate:collections`

Everything else (sitemap, routing, language switcher, Sanity Studio) updates automatically.

### Language Configuration Flow

```
src/i18n/config.ts (LOCALE_CONFIG)
  ↓
src/i18n/routing.ts (derives locales automatically)
  ↓
All systems (sitemap, routing, UI) use dynamic configuration
```

**Do NOT** manually update `src/i18n/routing.ts` when adding languages - it derives from `config.ts` automatically.

### Supported Languages

- **English (en)** - Default, LTR
- **Norwegian Bokmål (nb)** - LTR
- **Arabic (ar)** - RTL

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
| Articles | `Article` | ✅ Implemented |
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
- **URL structure**: Lowercase, hyphens, descriptive slugs (`/articles/seo-best-practices`)

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

## Content System

### Article Architecture

The article system is the primary content publishing mechanism, replacing the legacy blog structure:

**Key Features:**
- **Multi-language support**: Articles available in Norwegian (nb), English (en), and Arabic (ar)
- **Category taxonomy**: Organize articles with categories (e.g., "Guide", "News", "Tutorial")
- **Author attribution**: Link articles to author profiles with bio, image, and social links
- **SEO optimization**: Auto-generated metadata, structured data (Article schema), and social sharing
- **RSS feeds**: Per-locale RSS feeds at `/[locale]/articles/rss.xml`
- **Flexible frontpage**: Featured articles, category filtering, and pagination

**Schema Types:**
- `article` - Main content document type (replaces legacy `blog`)
- `article.category` - Category taxonomy (replaces `blog.category`)
- `author` - Author profiles
- `articlesFrontpage` - Frontpage module configuration
- `latestArticles` - Reusable latest articles widget

**Routing:**
- Article collection: `/[locale]/articles`
- Individual article: `/[locale]/articles/[slug]`
- Category filter: `/[locale]/articles?category=guide`
- RSS feed: `/[locale]/articles/rss.xml`

**Important Notes:**
- The term "blog" is deprecated - always use "article" in code, documentation, and UI
- Article slugs must be unique per locale
- Published date controls visibility and ordering
- Categories are shared across all locales

## Sanity Guidelines

**Schema patterns:**
- Use `defineType`, `defineField`, `defineArrayMember` helpers
- Export named const matching filename (e.g., `articleType` in `article.tsx`)
- Images require `options.hotspot: true`
- Prefer `string` with `options.list` over `boolean` fields
- Use arrays of references, not single references
- **Inline objects in arrays MUST have a `name` property** - required for copy/paste, GraphQL, and TypeGen
  - Bad: `defineArrayMember({ type: 'object', fields: [...] })`
  - Good: `defineArrayMember({ name: 'my-item', type: 'object', fields: [...] })`
  - Run `npx tsx scripts/lint-sanity-schemas.ts` to check for missing names
- GROQ variables: SCREAMING_SNAKE_CASE (e.g., `ARTICLE_QUERY`)
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

### Testing Philosophy

**The Testing Pyramid**

We follow Martin Fowler's testing pyramid approach:
- **Many unit tests** (fast, isolated, cheap to run)
- **Fewer integration tests** (combine modules, test boundaries)
- **Minimal E2E tests** (slow, expensive, but highest confidence)

**When to Write Tests**

| Scenario | Required | Recommended |
|----------|----------|-------------|
| Bug fix | ✅ Regression test | - |
| New feature | ✅ Core functionality | Edge cases |
| API change | ✅ Contract test | Integration |
| Refactor | - | ✅ Before refactoring |
| UI component | - | ✅ Accessibility |

**What NOT to Test**
- Third-party library internals (trust the library)
- Simple pass-through functions
- CSS styling (use visual regression tests instead)
- Framework behavior (Next.js, React internals)
- Getter/setter methods without logic

**Test Quality Guidelines**
- Tests should fail when behavior breaks, not when implementation changes
- Avoid testing implementation details (mock minimally)
- One logical assertion per test when possible
- Use descriptive test names that explain intent and expected outcome
- Arrange-Act-Assert pattern for test structure

### Test Types

| Type | Purpose | Tool | Location |
|------|---------|------|----------|
| **Unit** | Test isolated functions/components | Vitest | `tests/unit/` |
| **Component** | Test React components with providers | Vitest + Testing Library | `tests/components/` |
| **Integration** | Test combined modules (API routes, hooks) | Vitest | `tests/integration/` |
| **Contract** | Verify API response shapes match schemas | Vitest + Zod | `tests/contracts/` |
| **Smoke** | Quick critical path sanity checks | Playwright | `tests/e2e/smoke/` |
| **E2E** | Test full user flows in browser | Playwright | `tests/e2e/specs/` |
| **Visual** | Catch unintended UI changes | Playwright screenshots | `tests/e2e/visual/` |
| **Performance** | Core Web Vitals, Lighthouse | Playwright + Lighthouse | `tests/e2e/performance/` |
| **Accessibility** | WCAG compliance | Playwright + axe-core | `tests/e2e/accessibility/` |

### Configuration

- **Vitest setup**: `tests/setup/vitest.setup.ts` (mocks ResizeObserver, PointerEvent, scrollIntoView)
- **Test providers**: `tests/setup/providers.tsx` (React testing wrappers)
- **Fixtures**: `tests/fixtures/` (shared mock data for all test types)
- **Path alias**: `@tests/*` maps to `tests/*`

### Coverage Thresholds

- Lines: 40%
- Functions: 35%
- Branches: 25%

### Test Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Unit | `{name}.test.ts` | `utils.test.ts` |
| Component | `{component}.test.tsx` | `button.test.tsx` |
| Integration | `{feature}.test.ts` | `search-api.test.ts` |
| Contract | `{api}.contract.ts` | `search-api.contract.ts` |
| Smoke | `{feature}.smoke.ts` | `navigation.smoke.ts` |
| E2E | `{flow}.spec.ts` | `checkout.spec.ts` |
| Visual | `{component}.visual.ts` | `header.visual.ts` |

## Documentation

### Documentation Inventory

| Document | Location | Purpose | Audience |
|----------|----------|---------|----------|
| README.md | Root | Project overview, setup, deployment | All |
| CLAUDE.md | Root | Developer guide, standards, architecture | Developers |
| CODE_OF_CONDUCT.md | .github/ | Community standards | Contributors |
| .env.example | Root | Environment configuration | Developers |
| Workflow YAMLs | .github/workflows/ | CI/CD documentation | DevOps |

### Where to Document

| Type of Information | Where to Document |
|---------------------|-------------------|
| Getting started, installation | README.md |
| Code standards, patterns, architecture | CLAUDE.md |
| API endpoints | Inline JSDoc + OpenAPI (future) |
| Component props and usage | JSDoc/TSDoc in component file |
| Architecture decisions | Live site at /docs |
| Schema definitions | Inline comments in schemaTypes/ |

### Documentation Maintenance

**Update documentation when:**
- Adding new features or CLI commands
- Changing architecture patterns
- Modifying environment variables
- Updating dependencies significantly
- Changing deployment or CI/CD process

**Documentation standards:**
- README.md: Focus on getting started quickly
- CLAUDE.md: Detailed developer reference (this file)
- Use tables for structured information
- Include code examples for complex patterns
- Keep documentation close to the code it describes

## Package Manager

This project uses **pnpm** (enforced via `packageManager` field). Do not use npm or yarn.

## Environment Variables

Required:
```
NEXT_PUBLIC_SANITY_PROJECT_ID    # Sanity project ID
NEXT_PUBLIC_SANITY_DATASET       # Sanity dataset (usually "production")
NEXT_PUBLIC_BASE_URL             # Site base URL
```

Optional:
```
NEXT_PUBLIC_SANITY_BROWSER_TOKEN # Sanity API token for live preview/draft mode (CLIENT-EXPOSED, MUST be read-only/Viewer permissions)
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

