/**
 * Documentation Detail Component
 * @version 1.0.0
 * @lastUpdated 2025-12-30
 * @description Detail page component for individual documentation articles.
 * Includes table of contents, breadcrumbs, and related articles.
 */

import { Book, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Code from '@/components/blocks/modules/content/RichtextModule/Code';
import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { Section } from '@/components/ui/section';
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
    <nav className="hidden xl:block sticky top-24 w-64 shrink-0">
      <div className="border-l pl-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">On this page</h4>
        <ul className="space-y-2">
          {headings.map((heading, index) => {
            const id = heading.text.toLowerCase().replace(/\s+/g, '-');
            return (
              <li key={`toc-${index}`}>
                <a
                  href={`#${id}`}
                  className={cn(
                    'text-sm text-muted-foreground hover:text-foreground transition-colors block',
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
    <div className="border-t pt-8 mt-12">
      <h3 className="text-lg font-semibold text-foreground mb-4">Related Articles</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {docs.map((doc) => (
          <Link
            key={doc._id}
            href={`/${collectionSlug}/${doc.metadata?.slug?.current}`}
            className="group flex items-start gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
          >
            <Book className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {doc.metadata?.title}
              </h4>
              {doc.excerpt && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{doc.excerpt}</p>
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
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        {collectionSlug && (
          <>
            <Link href={`/${collectionSlug}`} className="hover:text-foreground transition-colors">
              {collectionTitle || 'Documentation'}
            </Link>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
        {doc.parent && (
          <>
            <Link
              href={`/${collectionSlug}/${doc.parent.metadata?.slug?.current}`}
              className="hover:text-foreground transition-colors"
            >
              {doc.parent.metadata?.title}
            </Link>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
        <span className="text-foreground font-medium truncate">{doc.metadata?.title}</span>
      </nav>

      <div className="flex gap-12">
        {/* Main content */}
        <article className="flex-1 min-w-0">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              {doc.icon && <span className="text-3xl">{doc.icon}</span>}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {doc.metadata?.title}
              </h1>
            </div>
            {doc.excerpt && <p className="text-lg text-muted-foreground">{doc.excerpt}</p>}
            {doc.readTime && (
              <div className="flex items-center gap-1.5 mt-4 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
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
