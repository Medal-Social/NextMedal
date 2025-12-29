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

