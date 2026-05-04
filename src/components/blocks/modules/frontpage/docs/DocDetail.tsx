/**
 * Documentation Detail Component
 * @version 1.0.0
 * @lastUpdated 2025-12-30
 * @description Detail page component for individual documentation articles.
 * Includes table of contents, breadcrumbs, and related articles.
 */

import { Book, ChevronRight, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';
import Code from '@/components/blocks/modules/content/RichtextModule/Code';
import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { Section } from '@/components/ui/section';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils/index';

interface DocDetailProps {
  doc: Sanity.CollectionDocumentation;
  showTableOfContents?: boolean;
  showRelatedDocs?: boolean;
}

// Table of contents component
function TableOfContents({ headings }: { headings: { style: string; text: string }[] }) {
  if (!headings || headings.length === 0) return null;

  return (
    <nav className="sticky top-24 hidden w-64 shrink-0 xl:block">
      <div className="border-l pl-4">
        <h4 className="mb-3 font-semibold text-foreground text-sm">On this page</h4>
        <ul className="space-y-2">
          {headings.map((heading) => {
            const id = heading.text.toLowerCase().replace(/\s+/g, '-');
            return (
              <li key={heading.text}>
                <a
                  href={`#${id}`}
                  className={cn(
                    'block text-muted-foreground text-sm transition-colors hover:text-foreground',
                    heading.style === 'h3' && 'pl-3'
                  )}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

// Related docs component
function RelatedDocs({
  docs,
  collectionSlug,
}: {
  docs: Sanity.CollectionDocumentation[];
  collectionSlug: string;
}) {
  if (!docs || docs.length === 0) return null;

  return (
    <div className="mt-12 border-t pt-8">
      <h3 className="mb-4 font-semibold text-foreground text-lg">Related Articles</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {docs.map((doc) => (
          <Link
            key={doc._id}
            href={`/${collectionSlug}/${doc.metadata?.slug?.current}`}
            className="group flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <Book className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <h4 className="font-medium text-foreground transition-colors group-hover:text-primary">
                {doc.metadata?.title}
              </h4>
              {doc.excerpt && (
                <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">{doc.excerpt}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function DocDetail({
  doc,
  showTableOfContents = true,
  showRelatedDocs = true,
}: DocDetailProps) {
  if (!doc) {
    notFound();
  }

  const collectionSlug = doc.collection?.metadata?.slug?.current;
  const collectionTitle = doc.collection?.metadata?.title;

  return (
    <Section className="py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center gap-2 text-muted-foreground text-sm">
        {collectionSlug && (
          <>
            <Link href={`/${collectionSlug}`} className="transition-colors hover:text-foreground">
              {collectionTitle || 'Documentation'}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        {doc.parent && (
          <>
            <Link
              href={`/${collectionSlug}/${doc.parent.metadata?.slug?.current}`}
              className="transition-colors hover:text-foreground"
            >
              {doc.parent.metadata?.title}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="truncate font-medium text-foreground">{doc.metadata?.title}</span>
      </nav>

      <div className="flex gap-12">
        {/* Main content */}
        <article className="min-w-0 flex-1">
          {/* Header */}
          <header className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              {doc.icon && <span className="text-3xl">{doc.icon}</span>}
              <h1 className="font-bold text-3xl text-foreground md:text-4xl">
                {doc.metadata?.title}
              </h1>
            </div>
            {doc.excerpt && <p className="text-lg text-muted-foreground">{doc.excerpt}</p>}
            {doc.readTime && (
              <div className="mt-4 flex items-center gap-1.5 text-muted-foreground text-sm">
                <Clock className="h-4 w-4" />
                <span>{doc.readTime} min read</span>
              </div>
            )}
          </header>

          {/* Body content */}
          {doc.body && (
            <div className="prose prose-lg max-w-none">
              <SharedPortableText
                value={doc.body}
                variant="prose"
                components={{
                  types: {
                    code: Code,
                  },
                }}
              />
            </div>
          )}

          {/* Related docs */}
          {showRelatedDocs && doc.relatedDocs && collectionSlug && (
            <RelatedDocs docs={doc.relatedDocs} collectionSlug={collectionSlug} />
          )}
        </article>

        {/* Table of contents sidebar */}
        {showTableOfContents && doc.headings && doc.headings.length > 0 && (
          <TableOfContents headings={doc.headings} />
        )}
      </div>
    </Section>
  );
}
