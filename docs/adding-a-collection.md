# Adding a Collection to NextMedal

## Overview

NextMedal uses a **collection-based content architecture** where content types (articles, documentation, newsletters, etc.) are organized into collections with dynamic URLs. Collections are CMS-managed, meaning **content editors can configure collection names and URLs** without code changes.

**Key Principle**: Collections are **auto-discovered at build time** from Sanity pages that have a "frontpage module". This guide will help you add a new collection type (e.g., Tutorials, Case Studies, Press Releases).

---

## Architecture Overview

### How Collections Work

1. **Collection Document Types** (`src/sanity/schemaTypes/documents/collections/`)
   - Define the content structure (e.g., `collection.article`, `collection.tutorial`)
   - Each collection item has a `metadata.slug` for its URL

2. **List blocks** (`src/sanity/schemaTypes/modules/frontpage/`)
   - The block editors place on a page (for example `articles-frontpage`, titled "Article list")
   - How the index looks (layout, filters, page size) is set in `src/components/blocks/modules/block-design.ts`, not in the Studio form
   - The block is offered and accepted only when its name is in `src/sanity/schemaTypes/page-blocks.ts`

3. **Build-Time Discovery** (`scripts/generate-collections.ts`)
   - Scans Sanity for pages with frontpage modules
   - Generates `src/lib/collections/generated/collections.generated.ts`
   - Creates locale-aware routing (e.g., `/en/tutorials`, `/nb/veiledninger`)

4. **Dynamic Routing**
   - Collections use Next.js dynamic routes: `/[locale]/[collection]/[slug]`
   - URLs are resolved at runtime using the generated configuration

### What You'll Create

For a new collection (e.g., **Tutorials**), you'll create:

1. **Collection Document Schema** (`collection.tutorial.tsx`)
2. **List block schema** (`tutorials-frontpage.ts`). No design fields
3. **Frontpage Component** (`TutorialsFrontpage.tsx`)
4. **Registry Configuration** (collection types and defaults)
5. **Page block registry and design** (`page-blocks.ts`, `block-design.ts`)
6. **Sanity Pages** (one per language, with the list block on **Page content**)

---

## Step-by-Step Guide

### Step 1: Create Collection Document Schema

This defines the structure of individual collection items (e.g., a single tutorial).

**File**: `src/sanity/schemaTypes/documents/collections/tutorial.tsx`

**Template** (based on `collection.article`):

```typescript
/**
 * Collection Tutorial Schema
 * @version 1.0.0
 * @lastUpdated 2026-01-04
 * @description Tutorials with flexible collection reference for dynamic URLs.
 */

import { ControlsIcon, RocketIcon, SearchIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { DEFAULT_LOCALE } from '@/i18n/config';
import { isUniqueAcrossLocale } from '@/sanity/lib/isUniqueAcrossLocale';
import PageIdentityField from '@/sanity/ui/PageIdentityField';
import PageIdentityInput from '@/sanity/ui/PageIdentityInput';

export default defineType({
  name: 'collection.tutorial',
  title: 'Tutorial',
  icon: RocketIcon,
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', icon: RocketIcon, default: true },
    { name: 'seo', title: 'SEO', icon: SearchIcon },
    { name: 'advanced', title: 'Advanced Options', icon: ControlsIcon },
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
      initialValue: DEFAULT_LOCALE,
    }),
    // Tutorial Identity
    defineField({
      name: 'metadata',
      type: 'object',
      group: 'content',
      components: {
        field: PageIdentityField,
        input: PageIdentityInput,
      },
      fields: [
        defineField({
          name: 'title',
          title: 'Tutorial Title',
          description: 'The title of the tutorial',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'slug',
          title: 'URL Slug',
          type: 'slug',
          description: 'The URL path for this tutorial',
          options: {
            source: (doc) => {
              const document = doc as { metadata?: { title?: string } };
              return document.metadata?.title || '';
            },
            isUnique: isUniqueAcrossLocale,
          },
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Content',
      description: 'The main content of the tutorial',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
          ],
        },
        { type: 'image' },
        { type: 'code' },
      ],
      group: 'content',
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty Level',
      description: 'Skill level required for this tutorial',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
        ],
        layout: 'radio',
      },
      group: 'content',
    }),
    defineField({
      name: 'publishDate',
      title: 'Publish Date',
      description: 'Date when the tutorial is published',
      type: 'date',
      initialValue: () => new Date().toISOString().split('T')[0],
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    // SEO Settings
    defineField({
      name: 'seo',
      type: 'seo-metadata',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'metadata.title',
      slug: 'metadata.slug.current',
      language: 'language',
      difficulty: 'difficulty',
    },
    prepare: ({ title, slug, language, difficulty }) => {
      const languageLabel =
        language === 'en' ? 'EN' : language === 'nb' ? 'NO' : language?.toUpperCase();
      const subtitle = [languageLabel, difficulty, `/${slug}`].filter(Boolean).join(' • ');

      return {
        title,
        subtitle,
        media: RocketIcon,
      };
    },
  },
});
```

**Customization Tips**:
- Add custom fields relevant to your collection (e.g., `difficulty`, `duration`, `author`)
- Use existing schemas as templates (`collection.article`, `collection.newsletter`)
- Keep the `language`, `metadata`, and `seo` fields—they're essential for URL routing and SEO

---

### Step 2: Register Collection Type

**File**: `src/lib/collections/types.ts`

Add your collection type to the union:

```typescript
export type CollectionType =
  | 'collection.article'
  | 'collection.documentation'
  | 'collection.changelog'
  | 'collection.newsletter'
  | 'collection.events'
  | 'collection.tutorial'; // Add this
```

---

### Step 3: Update Collection Generator Script

**File**: `scripts/generate-collections.ts`

#### 3.1 Add Default Slug

```typescript
const DEFAULT_COLLECTION_SLUGS: Record<CollectionType, string> = {
  'collection.article': 'articles',
  'collection.documentation': 'docs',
  'collection.changelog': 'changelog',
  'collection.newsletter': 'newsletter',
  'collection.events': 'events',
  'collection.tutorial': 'tutorials', // Add this
};
```

#### 3.2 Add Display Name

```typescript
const COLLECTION_NAMES: Record<CollectionType, string> = {
  'collection.article': 'Articles',
  'collection.documentation': 'Documentation',
  'collection.changelog': 'Changelog',
  'collection.newsletter': 'Newsletter',
  'collection.events': 'Events',
  'collection.tutorial': 'Tutorials', // Add this
};
```

#### 3.3 Add Frontpage Mapping

```typescript
const FRONTPAGE_TO_COLLECTION: Record<string, CollectionType> = {
  'articles-frontpage': 'collection.article',
  'docs-frontpage': 'collection.documentation',
  'changelog-frontpage': 'collection.changelog',
  'newsletter-frontpage': 'collection.newsletter',
  'events-frontpage': 'collection.events',
  'tutorials-frontpage': 'collection.tutorial', // Add this
};
```

#### 3.4 Update GROQ Query

Add your frontpage type to the query filter:

```typescript
const FRONTPAGE_PAGES_QUERY = groq`
  *[_type == 'page' && defined(modules) && count(modules[_type in [
    'articles-frontpage',
    'docs-frontpage',
    'changelog-frontpage',
    'newsletter-frontpage',
    'events-frontpage',
    'tutorials-frontpage' // Add this
  ]]) > 0] | order(_updatedAt desc) {
    _id,
    "slug": metadata.slug.current,
    "locale": language,
    'frontpageType': modules[_type in [
      'articles-frontpage',
      'docs-frontpage',
      'changelog-frontpage',
      'newsletter-frontpage',
      'events-frontpage',
      'tutorials-frontpage' // Add this
    ]][0]._type,
    _updatedAt
  }
`;
```

---

### Step 4: Create the list block schema

The block marks which page is the collection index. It does not take editor fields for design. Page size, filters and layout are set in code and applied before render (`Modules` calls `blockDesign`). Copy `articles-frontpage` ("Article list"): a plain title, a description, a hidden placeholder field (Sanity requires one field on an object type), and `blockPreview`.

Titles use plain language: one capital at the start, then lowercase words (`Tutorial list`, not "Tutorials Frontpage"). At most five editor-visible fields. Design names such as `limit`, `displayFilters`, `layout` and `showRssLink` are not allowed. A content field such as an intro is allowed (see `events-frontpage`).

**File**: `src/sanity/schemaTypes/modules/frontpage/tutorials-frontpage.ts`

```typescript
/**
 * Tutorial list: all tutorials, newest first. No editor fields: page size
 * comes from blockDesign. The page holding this block is the tutorials
 * collection index.
 */

import { BookIcon } from '@sanity/icons/Book';
import { defineField, defineType } from 'sanity';
import { blockPreview } from '../preview';

export default defineType({
  name: 'tutorials-frontpage',
  title: 'Tutorial list',
  description: 'All tutorials, newest first.',
  icon: BookIcon,
  type: 'object',
  // Sanity needs one field on an object type. Hidden: nothing to fill in, nothing stored.
  fields: [defineField({ name: 'list', title: 'List', type: 'string', hidden: true })],
  preview: blockPreview('Tutorial list'),
});
```

**Design in code**

**File**: `src/components/blocks/modules/block-design.ts`

Add a constant and a case next to `ARTICLE_LIST`. The component reads these values as props; editors never set them.

```typescript
export const TUTORIAL_LIST = { limit: 12 } as const;

// inside blockDesign, with the other list cases:
case 'tutorials-frontpage':
  Object.assign(out, TUTORIAL_LIST);
  break;
```

Add a grid thumbnail at `public/block-previews/tutorials-frontpage.png` (at most 600×420). The insert menu loads `/block-previews/<name>.png`. `tests/unit/sanity/page-blocks-guard.test.ts` checks the registry, the field budget and that thumbnail.

---

### Step 5: Register the schema and the page block

Registering the schema alone does not put the block on a page. `src/sanity/schemaTypes/fragments/modules.ts` builds the page `modules` array ("Page content") from `src/sanity/schemaTypes/page-blocks.ts`. `PAGE_BLOCK_NAMES` is derived from `INSERT_GROUPS`; add the list block to the Lists group so the insert menu offers it. `DEVELOPER_BLOCK_NAMES` (the developer showcase) is accepted on the page and kept out of every insert menu. A collection list belongs in the Lists group, not in that hidden list. A name in neither list is neither offered nor accepted.

**File**: `src/sanity/schemaTypes/page-blocks.ts`

```typescript
{
  name: 'Lists',
  of: [
    'articles-frontpage',
    'changelog-frontpage',
    'docs-frontpage',
    'events-frontpage',
    'newsletter-frontpage',
    'tutorials-frontpage', // Add this
  ],
},
```

**File**: `src/sanity/schemaTypes/index.ts`

Import and add your new schemas:

```typescript
// Collections
import collectionArticle from './documents/collections/article';
import collectionChangelog from './documents/collections/changelog';
import collectionDocumentation from './documents/collections/documentation';
import collectionEvents from './documents/collections/events';
import collectionNewsletter from './documents/collections/newsletter';
import collectionTutorial from './documents/collections/tutorial'; // Add this

// Frontpage modules
import articlesFrontpage from './modules/frontpage/articles-frontpage';
import changelogFrontpage from './modules/frontpage/changelog-frontpage';
import docsFrontpage from './modules/frontpage/docs-frontpage';
import eventsFrontpage from './modules/frontpage/events-frontpage';
import newsletterFrontpage from './modules/frontpage/newsletter-frontpage';
import tutorialsFrontpage from './modules/frontpage/tutorials-frontpage'; // Add this

export const schemaTypes = [
  // ... existing schemas
  collectionTutorial, // Add this
  tutorialsFrontpage, // Add this
];
```

---

### Step 6: Create Frontpage Component

This React component renders the collection index page on the frontend.

**File**: `src/components/blocks/modules/frontpage/tutorials/TutorialsFrontpage.tsx`

```typescript
import { sanityFetch } from '@/sanity/lib/live';
import { groq } from 'next-sanity';

interface TutorialsFrontpageProps {
  data: Sanity.Module['tutorials-frontpage'];
  locale: string;
}

const TUTORIALS_QUERY = groq`
  *[_type == 'collection.tutorial' && language == $locale] | order(publishDate desc) [0...$limit] {
    _id,
    metadata {
      title,
      slug
    },
    difficulty,
    publishDate,
    seo {
      description,
      image
    }
  }
`;

export default async function TutorialsFrontpage({
  data,
  locale,
}: TutorialsFrontpageProps) {
  // limit is applied by blockDesign before render (Step 4), not stored on the block.
  const { limit = 12 } = data;

  const { data: tutorials } = await sanityFetch({
    query: TUTORIALS_QUERY,
    params: { locale, limit },
  });

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">Tutorials</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tutorials?.map((tutorial) => (
          <article key={tutorial._id} className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">
              {tutorial.metadata.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {tutorial.difficulty}
            </p>
            <p className="mt-4">{tutorial.seo?.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
```

**Customization**:
- Add filtering, pagination, search (see `ArticlesFrontpage.tsx` for examples)
- Style according to your design system
- Integrate with existing UI components

---

### Step 7: Register Component in Module Renderer

**File**: `src/components/blocks/modules/ModuleRenderer.tsx`

Add an import and a case in the existing switch. Wrap the case in `Suspense` when the component fetches. This case does not add the block to the page; Step 5's `page-blocks.ts` entry does that. `Modules` runs `blockDesign` before this switch.

```typescript
import TutorialsFrontpage from './frontpage/tutorials/TutorialsFrontpage';

// In the switch:
case 'tutorials-frontpage':
  return (
    <Suspense fallback={<ModuleSkeleton />}>
      <TutorialsFrontpage data={module} locale={page?.language} />
    </Suspense>
  );
```

---

### Step 8: Generate Collection Configuration

Run the generator script to create the routing configuration:

```bash
pnpm generate:collections
```

**What this does**:
- Queries Sanity for pages with `tutorials-frontpage` module
- Extracts their slugs and languages
- Generates TypeScript configuration with locale-aware routing
- Falls back to default slug (`tutorials`) if no pages found

---

### Step 9: Create Pages in Sanity Studio

For each language you support, create a collection frontpage:

#### English Page

1. Go to Sanity Studio (`/studio`)
2. Create a new **Page**
3. Set **Language**: `English`
4. Set **Metadata > Title**: `Tutorials`
5. Set **Metadata > Slug**: `tutorials`
6. In **Page content**, add **Tutorial list** (Lists group)
7. **Publish** (there are no design options on the block)

#### Norwegian Page

1. Create another **Page**
2. Set **Language**: `Norsk`
3. Set **Metadata > Title**: `Veiledninger`
4. Set **Metadata > Slug**: `veiledninger` (localized slug!)
5. In **Page content**, add **Tutorial list**
6. **Publish**

Repeat for other languages (Arabic, etc.).

---

### Step 10: Regenerate and Test

#### 10.1 Regenerate Collections

```bash
pnpm generate:collections
```

This will detect your new pages and create locale-specific routes:
- English: `/tutorials`
- Norwegian: `/nb/veiledninger`
- Arabic: `/ar/[your-arabic-slug]`

#### 10.2 Restart Dev Server

```bash
pnpm dev
```

#### 10.3 Test Collection Pages

Visit the collection pages:
- `http://localhost:3000/tutorials` (English)
- `http://localhost:3000/nb/veiledninger` (Norwegian)

#### 10.4 Create Sample Content

1. Go to Sanity Studio
2. Create **Tutorial** documents with different languages
3. Verify they appear on the frontpage

---

## Advanced: Additional Features

### Add RSS Feed

If you want an RSS feed for your collection (like `/tutorials/rss.xml`):

**File**: `src/app/(frontend)/[locale]/[collection]/rss.xml/route.ts`

This file already exists and should work automatically if you followed the naming conventions. Update the GROQ query to support your new collection type if needed.

### Add Search Integration

**File**: `src/app/api/search/route.ts`

Add your collection to the search index:

```typescript
// In the GROQ query, add your collection type
*[_type in ['page', 'collection.article', 'collection.tutorial', ...] && ...
```

Update the search result mapping to include tutorials.

### Add to Sitemap

**File**: `src/app/sitemap/[locale]/route.ts`

Add your collection to the sitemap generation:

```typescript
const TUTORIAL_QUERY = groq`
  *[_type == 'collection.tutorial' && language == $locale] {
    "slug": metadata.slug.current,
    _updatedAt
  }
`;
```

---

## Verification Checklist

Before deploying, verify:

- [ ] Collection schema created in `documents/collections/`
- [ ] Collection type added to `types.ts`
- [ ] Default slug added to `generate-collections.ts`
- [ ] Frontpage mapping added to `generate-collections.ts`
- [ ] List block schema created (no design fields such as `limit` or `displayFilters`)
- [ ] Design (page size, filters, layout) set in `block-design.ts`
- [ ] Block name added to the Lists group in `src/sanity/schemaTypes/page-blocks.ts`
- [ ] Preview image added at `public/block-previews/<block>.png` (at most 600×420)
- [ ] Frontpage component created
- [ ] Component registered in `ModuleRenderer.tsx`
- [ ] Schemas registered in `schemaTypes/index.ts`
- [ ] `pnpm generate:collections` ran successfully
- [ ] Pages created in Sanity for each language
- [ ] Collection frontpage loads correctly
- [ ] Individual collection items load correctly
- [ ] URLs are locale-aware (e.g., `/en/tutorials`, `/nb/veiledninger`)
- [ ] SEO metadata works (title, description, OG image)
- [ ] Search integration works (optional)
- [ ] RSS feed works (optional)

---

## Common Issues

### Issue: Collection Page 404s

**Cause**: Generator didn't detect the frontpage page, or dev server not restarted.

**Solution**:
1. Verify you created a Page with the frontpage module in Sanity
2. Run `pnpm generate:collections`
3. Check `src/lib/collections/generated/collections.generated.ts` includes your collection
4. Restart dev server

### Issue: Individual Items 404

**Cause**: Dynamic route not catching the collection, or URL resolution failing.

**Solution**:
1. Verify collection type is in `resolve-url.ts` `COLLECTION_TYPES` array
2. Check that item has `metadata.slug.current` populated
3. Verify item's `language` field matches the locale

### Issue: Generator Script Fails

**Cause**: GROQ query syntax error or Sanity credentials missing.

**Solution**:
1. Check `.env` for `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`
2. Verify GROQ query syntax in `generate-collections.ts`
3. Run with verbose output: `tsx scripts/generate-collections.ts`

### Issue: List block not showing in Sanity

**Cause**: Schema not registered, name missing from `page-blocks.ts`, or dev server needs restart.

**Solution**:
1. Verify the schema is imported and added to the `schemaTypes` array
2. Verify the name is in the Lists group of `INSERT_GROUPS` in `page-blocks.ts` (schema registration alone does not add it to **Page content**)
3. Restart the dev server
4. Clear the browser cache and reload Studio

---

## Summary

Adding a collection involves:

1. **Create collection document schema** (individual items)
2. **Create the list block schema** (plain title, no design fields)
3. **Set list design in `block-design.ts`** (page size, filters, layout)
4. **Update generator script** (types, defaults, mappings)
5. **Create frontpage component** (React component)
6. **Register the schema, the `page-blocks.ts` entry, and the component**
7. **Generate configuration** (`pnpm generate:collections`)
8. **Create pages in Sanity** (one per language; add the block under **Page content**)
9. **Test thoroughly** (frontpage, individual items, locales)

The architecture is designed to be **CMS-first**—editors can configure collection URLs and content without code changes, while developers provide the schema and rendering logic.
