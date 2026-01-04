# NextMedal Documentation

This directory contains developer guides for extending and customizing NextMedal.

## Available Guides

### [Adding a Language](./adding-a-language.md)

Learn how to add a new language to the NextMedal i18n system. Covers:

- Updating i18n configuration
- Creating translation files
- Configuring date localization
- RTL language support
- Testing and verification

**When to use**: You want to support a new language (e.g., French, Spanish, German) on your site.

---

### [Adding a Collection](./adding-a-collection.md)

Learn how to create a new content collection type (e.g., Tutorials, Case Studies, Press Releases). Covers:

- Creating collection schemas
- Building frontpage modules
- Setting up dynamic routing
- Locale-aware URL configuration
- Search and RSS integration

**When to use**: You want to add a new type of content with its own index page and individual item pages (similar to Articles, Documentation, or Newsletter).

---

## Quick Reference

### Adding a Language (Quick Steps)

1. Add locale to `src/i18n/config.ts` and `src/i18n/routing.ts`
2. Create `src/messages/[locale].json` with translations
3. Import and configure date-fns locale
4. Run `pnpm generate:collections`
5. Test URL routing and translations

### Adding a Collection (Quick Steps)

1. Create collection schema in `src/sanity/schemaTypes/documents/collections/`
2. Create frontpage module in `src/sanity/schemaTypes/modules/frontpage/`
3. Update `src/lib/collections/types.ts` and `scripts/generate-collections.ts`
4. Create frontpage component in `src/components/blocks/modules/frontpage/`
5. Register in `ModuleRenderer.tsx` and `schemaTypes/index.ts`
6. Run `pnpm generate:collections`
7. Create pages in Sanity Studio (one per language)
8. Test frontpage and individual items

---

## Architecture Principles

### Centralized Configuration

NextMedal uses **single source of truth** patterns:

- **Languages**: Defined in `src/i18n/routing.ts`, automatically propagated to Sanity schemas and routing
- **Collections**: Auto-discovered from Sanity pages at build time, no hardcoding needed
- **Environment variables**: Validated with Zod in `src/lib/env.ts`

### CMS-First Design

Content editors control:

- Collection names and URLs (via Sanity pages)
- Navigation structure (via Site Settings)
- Redirects (via Redirect documents)
- Metadata and SEO (per page/document)

Developers provide:

- Schemas and validation
- Components and rendering
- Business logic and integrations

### Build-Time Optimization

Configuration is generated at build time:

- `pnpm generate:collections` queries Sanity for collection pages
- Creates TypeScript files with type-safe routing
- Falls back to defaults if Sanity is unavailable

---

## Getting Help

- **Project README**: See `/README.md` for setup and deployment
- **CLAUDE.md**: See `/CLAUDE.md` for full developer reference
- **Code comments**: Schemas and utilities have JSDoc comments
- **Examples**: Existing collections (articles, docs, newsletter) serve as templates

---

## Contributing

When creating new guides:

1. **Start with the big picture**: Explain the architecture before diving into code
2. **Include examples**: Show complete, working code snippets
3. **Add verification steps**: Provide checklists and testing instructions
4. **Document common issues**: Include troubleshooting section
5. **Keep it simple**: Assume the reader is a developer but may be new to the project

Follow the structure of existing guides in this directory.
