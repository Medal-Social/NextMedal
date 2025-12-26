# CLAUDE.md - NextMedal AI Assistant Guide

This document provides comprehensive guidance for AI assistants working with the NextMedal codebase.

## Project Overview

NextMedal is a production-ready website template built with **Next.js 16** and **Sanity CMS** by Medal Social. It's designed for building high-performance, SEO-optimized, accessible websites with internationalization support.

## Quick Reference

```bash
# Development
pnpm dev          # Start dev server with Turbopack (http://localhost:3000)
pnpm build        # Production build
pnpm start        # Start production server

# Quality
pnpm lint         # Biome lint check
pnpm format       # Biome format with auto-fix
pnpm typecheck    # TypeScript type checking
pnpm test         # Run Vitest tests
pnpm test:watch   # Watch mode for tests
pnpm test:coverage # Coverage report
```

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components, Turbopack)
- **React**: 19 (latest features)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **CMS**: Sanity 5.1 with visual editing
- **Forms**: React Hook Form + Zod
- **Internationalization**: next-intl (en, nb)
- **Testing**: Vitest + Testing Library
- **Linting/Formatting**: Biome
- **Monitoring**: Sentry (optional)
- **Package Manager**: pnpm 10.26

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (frontend)/         # Public routes
│   │   └── [locale]/       # i18n locale routing
│   │       ├── page.tsx    # Home page
│   │       ├── [...slug]/  # Dynamic pages
│   │       └── blog/       # Blog routes
│   ├── (studio)/           # Sanity Studio (/admin)
│   └── api/                # API routes
│       ├── draft-mode/     # Preview mode
│       ├── search/         # Full-text search
│       └── og/             # Dynamic OG images
├── components/             # Shared React components
│   └── ui/                 # shadcn/ui primitives (48 files)
├── ui/                     # Feature modules (87 files)
│   ├── header/             # Site header
│   ├── footer/             # Site footer
│   ├── modules/            # Content builder modules
│   └── video/              # Video players
├── sanity/                 # Sanity CMS (46 schemas)
│   ├── lib/                # Client, queries, utilities
│   └── schemaTypes/        # Document/object schemas
├── lib/                    # Core utilities (13 files)
├── hooks/                  # Custom React hooks
├── contexts/               # React contexts
├── types/                  # TypeScript definitions
├── i18n/                   # Internationalization config
└── test/                   # Test setup and mocks
```

## Code Conventions

### TypeScript Path Aliases

```typescript
import { cn } from '@/lib/utils';    // @/* -> ./src/*
import config from '$/next.config';  // $/* -> ./
```

### Component Patterns

**Server Components** (default):
```typescript
// No directive needed - runs on server
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

**Client Components**:
```typescript
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Styling with Tailwind + cn()

```typescript
import { cn } from '@/lib/utils';

function Component({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* content */}
    </div>
  );
}
```

### Biome Formatting Rules

- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Required
- **Trailing commas**: ES5 style
- **Line width**: 100 characters
- **Line endings**: LF

### Key Linting Rules

- `a11y/useAltText`: **error** - Images must have alt text
- `correctness/noUnusedVariables`: warn
- `suspicious/noConsole`: warn - Use `logger` from `@/lib/logger`
- `suspicious/noExplicitAny`: off

## Sanity CMS Integration

### GROQ Queries

Queries are defined in `src/sanity/lib/queries.ts` with reusable fragments:

```typescript
import { groq } from 'next-sanity';

// Use fragments for common patterns
const LINK_QUERY = groq`{
  label,
  type,
  "internal": internal->metadata.slug.current,
  external
}`;

// Compose queries
const PAGE_QUERY = groq`*[_type == "page" && slug.current == $slug][0]{
  title,
  modules[],
  cta ${LINK_QUERY}
}`;
```

### Fetching Data

```typescript
import { fetchSanity } from '@/sanity/lib/fetch';

// Server-side fetch with caching
const data = await fetchSanity({
  query: PAGE_QUERY,
  params: { slug: 'about' },
  tags: ['page'],
});
```

### Document Types

| Type | Description |
|------|-------------|
| `site` | Global site settings (singleton) |
| `page` | Content pages with modules |
| `blog.post` | Blog articles |
| `blog.category` | Post categories |
| `navigation` | Menu structures |
| `placement` | Module injection rules |
| `redirect` | URL redirects |

## Module System

Modules are the content building blocks rendered in `src/ui/modules/index.tsx`:

```typescript
// Adding a new module:
// 1. Create schema in src/sanity/schemaTypes/modules/
// 2. Add to modules array in src/sanity/schemaTypes/fragments/modules.ts
// 3. Create component in src/ui/modules/
// 4. Add case to switch statement in src/ui/modules/index.tsx
```

Available modules: Hero, VideoHero, Features, LogoCloud, Team, Pricing, Accordion, Contact, BlogFrontpage, LatestArticles, RichtextModule, etc.

## Testing

### Running Tests

```bash
pnpm test              # Single run
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage report
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### Coverage Thresholds

- Lines: 40%
- Statements: 40%
- Functions: 35%
- Branches: 25%

Coverage scope: `src/components/`, `src/ui/`, `src/lib/`, `src/app/api/`

## Environment Variables

Required:
```env
NEXT_PUBLIC_BASE_URL=https://example.com
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

Optional:
```env
SANITY_API_READ_TOKEN=       # For private datasets
NEXT_PUBLIC_SENTRY_DSN=      # Error monitoring
SENTRY_ORG=                  # Sentry org slug
SENTRY_PROJECT=              # Sentry project slug
NEXT_PUBLIC_UMAMI_SCRIPT_URL= # Analytics
NEXT_PUBLIC_UMAMI_WEBSITE_ID= # Analytics
```

Environment validation happens at runtime via Zod in `src/lib/env.ts`.

## Server Actions & Forms

Use the safe action pattern with built-in security:

```typescript
import { actionClient, withSecurity } from '@/lib/safe-action';
import { z } from 'zod';

const schema = withSecurity(z.object({
  email: z.string().email(),
  message: z.string().min(10),
}));

export const submitForm = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    // Process form
    return { success: true };
  });
```

The `withSecurity` wrapper adds:
- Honeypot field for bot detection
- 3-second minimum submission time
- Server-side error logging

## Internationalization

Locales: `en` (default), `nb`

```typescript
// Routing config in src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'nb'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // No prefix for default locale
});
```

Translation files are in `messages/` directory.

## Error Handling

### Public Errors (user-visible)

```typescript
import { PublicError } from '@/lib/errors';

throw new PublicError('Email already exists');
```

### Logging

```typescript
import { logger } from '@/lib/logger';

logger.info({ userId }, 'User logged in');
logger.error({ err }, 'Failed to process request');
```

## Git Workflow

### Pre-commit Hook

The `.husky/pre-commit` hook runs `pnpm lint` before every commit. Fix any issues before committing.

### Branch Naming

Follow the pattern: `feature/description`, `fix/description`, `chore/description`

### Commit Messages

Use conventional commits:
- `feat: add new feature`
- `fix: resolve bug`
- `refactor: improve code structure`
- `docs: update documentation`
- `test: add tests`
- `chore: maintenance tasks`

## OpenSpec Integration

This project uses OpenSpec for managing change proposals. For major changes:

1. Check `@/openspec/AGENTS.md` for proposal guidelines
2. Create proposals for: new capabilities, breaking changes, architecture shifts
3. Follow the spec format defined in the OpenSpec documentation

## Common Patterns

### Adding a New Page

1. Create route in `src/app/(frontend)/[locale]/your-page/page.tsx`
2. Add Sanity document if content-managed
3. Generate metadata with `processMetadata()`

### Adding a New API Route

1. Create route in `src/app/api/your-route/route.ts`
2. Export HTTP method handlers: `GET`, `POST`, etc.
3. Add tests in `src/test/api-routes/`

### Adding a New Component

1. Create in `src/components/` (shared) or `src/ui/` (feature)
2. Follow existing naming: PascalCase files, default exports
3. Add tests for complex logic

## Performance Considerations

- Use Server Components by default
- Leverage ISR (Incremental Static Regeneration) for dynamic content
- Use `next/image` for optimized images
- Console logs are stripped in production (except `error`)
- Package imports are optimized for: `@sanity/ui`, `@sanity/icons`, `framer-motion`, `@base-ui/react`

## Accessibility Requirements

- All images must have `alt` text (enforced by Biome)
- Use semantic HTML elements
- Provide skip links (SkipToContent component)
- Maintain proper heading hierarchy
- Test with vitest-axe for automated a11y checks

## Deployment

- **Output**: Standalone (Docker-ready)
- **Platforms**: Vercel, Coolify, any Docker host
- **Build command**: `pnpm build`
- **Start command**: `pnpm start`

Docker build:
```bash
pnpm docker:build           # Creates 'nextmedal' image
./scripts/docker-build.sh my-image  # Custom image name
```

## Troubleshooting

### Type Errors
Run `pnpm typecheck` to identify issues. Check `tsconfig.json` for path alias configuration.

### Lint Errors
Run `pnpm lint` then `pnpm format` to auto-fix formatting issues.

### Test Failures
Check test environment variables in `vitest.config.ts`. Mock data is in `src/test/mocks/`.

### Build Failures
Ensure all required environment variables are set. During build, missing env vars generate warnings but don't fail the build.
