/**
 * Documentation Frontpage Module Component
 * @version 2.0.0
 * @lastUpdated 2025-12-30
 * @description Displays a navigation/listing of documentation articles from a collection.
 * Supports sidebar, cards, and categorized layouts with category-based organization.
 */

'use client';

import { Book, ChevronDown, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils/index';

// Types
interface DocCategory {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  icon?: string;
  order: number;
}

interface DocItem {
  _id: string;
  metadata: {
    title: string;
    slug: { current: string };
  };
  excerpt?: string;
  icon?: string;
  order: number;
  category?: {
    _id: string;
    title: string;
    slug: { current: string };
    icon?: string;
  };
  parent?: {
    _id: string;
  };
  children?: DocItem[];
}

interface DocsFrontpageClientProps {
  docs: DocItem[];
  categories: DocCategory[];
  categoryOrder: string[];
  layout: 'sidebar' | 'cards' | 'categorized';
  sidebarStyle: 'collapsible' | 'expanded' | 'flat';
  showCategoryDescriptions: boolean;
  showCategoryIcons: boolean;
  showUncategorized: boolean;
  uncategorizedLabel: string;
  uncategorizedPosition: 'start' | 'end';
  collectionSlug: string;
  intro?: React.ReactNode;
  showSearch?: boolean;
}

// Build tree structure from flat list
function buildDocTree(docs: DocItem[]): DocItem[] {
  const docMap = new Map<string, DocItem>();
  const roots: DocItem[] = [];

  // First pass: create map and initialize children arrays
  for (const doc of docs) {
    docMap.set(doc._id, { ...doc, children: [] });
  }

  // Second pass: build tree
  for (const doc of docs) {
    const current = docMap.get(doc._id);
    if (!current) continue;
    if (doc.parent?._id) {
      const parent = docMap.get(doc.parent._id);
      if (parent?.children) {
        parent.children.push(current);
      } else {
        roots.push(current);
      }
    } else {
      roots.push(current);
    }
  }

  return roots;
}

// Create uncategorized category placeholder
function createUncategorizedCategory(label: string, order: number): DocCategory {
  return {
    _id: '__uncategorized__',
    title: label,
    slug: { current: 'other' },
    order,
  };
}

// Initialize category map with all categories
function initializeCategoryMap(
  categories: DocCategory[],
  categoryOrder: string[]
): Map<string | null, DocItem[]> {
  const categoryMap = new Map<string | null, DocItem[]>();

  for (const catId of categoryOrder) {
    categoryMap.set(catId, []);
  }

  for (const cat of categories) {
    if (!categoryMap.has(cat._id)) {
      categoryMap.set(cat._id, []);
    }
  }

  categoryMap.set(null, []);
  return categoryMap;
}

// Populate category map with docs
function populateCategoryMap(docs: DocItem[], categoryMap: Map<string | null, DocItem[]>): void {
  for (const doc of docs) {
    const catId = doc.category?._id || null;
    const existing = categoryMap.get(catId) || [];
    existing.push(doc);
    categoryMap.set(catId, existing);
  }
}

// Get ordered categories from map
function getOrderedCategories(
  categories: DocCategory[],
  categoryOrder: string[],
  categoryMap: Map<string | null, DocItem[]>
): Array<{ category: DocCategory; docs: DocItem[] }> {
  const result: Array<{ category: DocCategory; docs: DocItem[] }> = [];

  for (const catId of categoryOrder) {
    const cat = categories.find((c) => c._id === catId);
    const catDocs = categoryMap.get(catId) || [];
    if (cat && catDocs.length > 0) {
      result.push({ category: cat, docs: catDocs });
    }
  }

  const remainingCats = categories
    .filter((c) => !categoryOrder.includes(c._id))
    .sort((a, b) => a.order - b.order);

  for (const cat of remainingCats) {
    const catDocs = categoryMap.get(cat._id) || [];
    if (catDocs.length > 0) {
      result.push({ category: cat, docs: catDocs });
    }
  }

  return result;
}

// Group docs by category
function groupDocsByCategory(
  docs: DocItem[],
  categories: DocCategory[],
  categoryOrder: string[],
  showUncategorized: boolean,
  uncategorizedLabel: string,
  uncategorizedPosition: 'start' | 'end'
): Array<{ category: DocCategory | null; docs: DocItem[] }> {
  const categoryMap = initializeCategoryMap(categories, categoryOrder);
  populateCategoryMap(docs, categoryMap);

  const result: Array<{ category: DocCategory | null; docs: DocItem[] }> = [];
  const uncategorizedDocs = categoryMap.get(null) || [];
  const shouldAddUncategorized = showUncategorized && uncategorizedDocs.length > 0;

  if (shouldAddUncategorized && uncategorizedPosition === 'start') {
    result.push({
      category: createUncategorizedCategory(uncategorizedLabel, -1),
      docs: uncategorizedDocs,
    });
  }

  result.push(...getOrderedCategories(categories, categoryOrder, categoryMap));

  if (shouldAddUncategorized && uncategorizedPosition === 'end') {
    result.push({
      category: createUncategorizedCategory(uncategorizedLabel, 9999),
      docs: uncategorizedDocs,
    });
  }

  return result;
}

// Single doc link component
function DocLink({
  doc,
  collectionSlug,
  level = 0,
}: {
  doc: DocItem;
  collectionSlug: string;
  level?: number;
}) {
  const hasChildren = doc.children && doc.children.length > 0;

  return (
    <div>
      <Link
        href={`/${collectionSlug}/${doc.metadata.slug.current}`}
        className={cn(
          'group flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors',
          level > 0 && 'pl-4 border-l border-border ml-2'
        )}
      >
        {doc.icon ? (
          <span className="text-base">{doc.icon}</span>
        ) : (
          <Book className="w-4 h-4 opacity-50" />
        )}
        <span className="flex-1">{doc.metadata.title}</span>
        {hasChildren && <ChevronRight className="w-4 h-4 opacity-50" />}
      </Link>
      {hasChildren && doc.children && (
        <div className="mt-1">
          {doc.children.map((child) => (
            <DocLink
              key={child._id}
              doc={child}
              collectionSlug={collectionSlug}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Collapsible category section
function CategorySection({
  category,
  docs,
  collectionSlug,
  style,
  showDescription,
  showIcon,
}: {
  category: DocCategory | null;
  docs: DocItem[];
  collectionSlug: string;
  style: 'collapsible' | 'expanded' | 'flat';
  showDescription: boolean;
  showIcon: boolean;
}) {
  const [isOpen, setIsOpen] = useState(style === 'expanded');
  const tree = buildDocTree(docs);

  if (style === 'flat' || !category) {
    return (
      <div className="space-y-1">
        {tree.map((doc) => (
          <DocLink key={doc._id} doc={doc} collectionSlug={collectionSlug} />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => style === 'collapsible' && setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 w-full text-left py-2 font-medium text-foreground',
          style === 'collapsible' && 'cursor-pointer hover:text-primary'
        )}
        disabled={style !== 'collapsible'}
      >
        {style === 'collapsible' && (
          <ChevronDown className={cn('w-4 h-4 transition-transform', !isOpen && '-rotate-90')} />
        )}
        {showIcon && category.icon && <span className="text-lg">{category.icon}</span>}
        <span>{category.title}</span>
        <span className="text-xs text-muted-foreground ml-auto">({docs.length})</span>
      </button>

      {showDescription && category.description && (
        <p className="text-sm text-muted-foreground mb-2 ml-6">{category.description}</p>
      )}

      {(style === 'expanded' || isOpen) && (
        <div className="mt-2 ml-4 space-y-1">
          {tree.map((doc) => (
            <DocLink key={doc._id} doc={doc} collectionSlug={collectionSlug} />
          ))}
        </div>
      )}
    </div>
  );
}

// Sidebar layout with categories
function SidebarLayout({
  groupedDocs,
  collectionSlug,
  style,
  showDescription,
  showIcon,
}: {
  groupedDocs: Array<{ category: DocCategory | null; docs: DocItem[] }>;
  collectionSlug: string;
  style: 'collapsible' | 'expanded' | 'flat';
  showDescription: boolean;
  showIcon: boolean;
}) {
  return (
    <nav className="space-y-2">
      {groupedDocs.map(({ category, docs }) => (
        <CategorySection
          key={category?._id || 'uncategorized'}
          category={category}
          docs={docs}
          collectionSlug={collectionSlug}
          style={style}
          showDescription={showDescription}
          showIcon={showIcon}
        />
      ))}
    </nav>
  );
}

// Cards layout component
function CardsLayout({
  groupedDocs,
  collectionSlug,
  showIcon,
  showDescription,
}: {
  groupedDocs: Array<{ category: DocCategory | null; docs: DocItem[] }>;
  collectionSlug: string;
  showIcon: boolean;
  showDescription: boolean;
}) {
  return (
    <div className="space-y-8">
      {groupedDocs.map(({ category, docs }) => {
        const rootDocs = docs.filter((doc) => !doc.parent);

        return (
          <div key={category?._id || 'uncategorized'}>
            {category && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {showIcon && category.icon && <span>{category.icon}</span>}
                  {category.title}
                </h2>
                {showDescription && category.description && (
                  <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                )}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rootDocs.map((doc) => (
                <Link
                  key={doc._id}
                  href={`/${collectionSlug}/${doc.metadata.slug.current}`}
                  className="group block p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {doc.icon ? (
                      <span className="text-2xl">{doc.icon}</span>
                    ) : (
                      <Book className="w-6 h-6 text-primary" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {doc.metadata.title}
                      </h3>
                      {doc.excerpt && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {doc.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Categorized layout (grouped list)
function CategorizedLayout({
  groupedDocs,
  collectionSlug,
  showIcon,
  showDescription,
}: {
  groupedDocs: Array<{ category: DocCategory | null; docs: DocItem[] }>;
  collectionSlug: string;
  showIcon: boolean;
  showDescription: boolean;
}) {
  return (
    <div className="space-y-8">
      {groupedDocs.map(({ category, docs }) => {
        const tree = buildDocTree(docs);

        return (
          <div key={category?._id || 'uncategorized'}>
            {category && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  {showIcon && category.icon && <span className="text-xl">{category.icon}</span>}
                  {category.title}
                </h2>
                {showDescription && category.description && (
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                )}
              </div>
            )}
            <div className="grid gap-2 md:grid-cols-2">
              {tree.map((doc) => (
                <Link
                  key={doc._id}
                  href={`/${collectionSlug}/${doc.metadata.slug.current}`}
                  className="group flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  {doc.icon ? (
                    <span>{doc.icon}</span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {doc.metadata.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Search input component
function SearchInput() {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="search"
        placeholder="Search docs..."
        className="pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>No documentation articles found in this collection.</p>
    </div>
  );
}

// Main client component
export default function DocsFrontpageClient({
  docs,
  categories,
  categoryOrder,
  layout,
  sidebarStyle,
  showCategoryDescriptions,
  showCategoryIcons,
  showUncategorized,
  uncategorizedLabel,
  uncategorizedPosition,
  collectionSlug,
  intro,
  showSearch,
}: DocsFrontpageClientProps) {
  if (!docs || docs.length === 0) {
    return (
      <>
        {(intro || showSearch) && (
          <header className="flex flex-wrap items-start justify-between gap-4 mb-8">
            {intro}
            {showSearch && <SearchInput />}
          </header>
        )}
        <EmptyState />
      </>
    );
  }

  const groupedDocs = groupDocsByCategory(
    docs,
    categories,
    categoryOrder,
    showUncategorized,
    uncategorizedLabel,
    uncategorizedPosition
  );

  return (
    <>
      {(intro || showSearch) && (
        <header className="flex flex-wrap items-start justify-between gap-4 mb-8">
          {intro}
          {showSearch && <SearchInput />}
        </header>
      )}

      {layout === 'cards' && (
        <CardsLayout
          groupedDocs={groupedDocs}
          collectionSlug={collectionSlug}
          showIcon={showCategoryIcons}
          showDescription={showCategoryDescriptions}
        />
      )}

      {layout === 'categorized' && (
        <CategorizedLayout
          groupedDocs={groupedDocs}
          collectionSlug={collectionSlug}
          showIcon={showCategoryIcons}
          showDescription={showCategoryDescriptions}
        />
      )}

      {layout === 'sidebar' && (
        <SidebarLayout
          groupedDocs={groupedDocs}
          collectionSlug={collectionSlug}
          style={sidebarStyle}
          showDescription={showCategoryDescriptions}
          showIcon={showCategoryIcons}
        />
      )}
    </>
  );
}
