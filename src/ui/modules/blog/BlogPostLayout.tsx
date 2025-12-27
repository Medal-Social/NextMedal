import { Calendar } from 'lucide-react';
import { createDataAttribute, stegaClean } from 'next-sanity';
import { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { Placements } from '@/lib/placement';
import DateDisplay from '@/ui/Date';
import { Img } from '@/ui/Img';
import Modules from '@/ui/modules';
import Authors from '@/ui/modules/blog/Authors';
import MobileSidebar from '@/ui/modules/blog/MobileSidebar';
import ReadTime from '@/ui/modules/blog/ReadTime';
import Sidebar from '@/ui/modules/blog/Sidebar';
import SocialShare from '@/ui/modules/blog/SocialShare';
import Content from '@/ui/modules/RichtextModule/Content';

export default function BlogPostLayout({
  post,
  placements,
}: {
  post: Sanity.BlogPost & { headings?: Array<{ style: string; text: string }> };
  placements?: Placements;
}) {
  const stega = createDataAttribute({
    id: post._id,
    type: post._type,
  });

  // Automatic Breadcrumbs logic
  const crumbs = [
    {
      label: 'Blog',
      href: '/blog',
    },
  ];

  if (post.categories?.[0]) {
    crumbs.push({
      label: post.categories[0].title,
      href: `/blog?category=${post.categories[0].slug?.current}`,
    });
  }

  // Handle Injection
  let bodyContent = post.body;

  if (placements?.injection && placements.injection.length > 0 && bodyContent) {
    // Clone body to avoid mutating original
    bodyContent = [...bodyContent];

    // Sort injections by position (descending to avoid index shift issues if we were splicing,
    // but here we are counting blocks so it's safer to just iterate carefully)
    // Actually, simple approach:
    // Create a new array, iterate through body, count "blocks" (paragraphs), insert injection when count matches.

    // Simplification: Just take the first valid injection for now or handle multiple.
    // Let's handle all.

    const injections = placements.injection.sort(
      (a, b) => (a.injectionConfig?.afterParagraph || 0) - (b.injectionConfig?.afterParagraph || 0)
    );

    let paragraphCount = 0;
    const newBody = [];
    let injectionIndex = 0;

    for (const block of bodyContent) {
      newBody.push(block);

      if (block._type === 'block' && stegaClean(block.style) === 'normal') {
        paragraphCount++;
      }

      // Check if we have injections for this position
      while (
        injectionIndex < injections.length &&
        (injections[injectionIndex].injectionConfig?.afterParagraph || 0) === paragraphCount
      ) {
        const injection = injections[injectionIndex];
        if (injection.modules && injection.modules.length > 0) {
          // Insert modules as portable text blocks or handle differently?
          // Content.tsx renders Portable Text.
          // If we insert a module into Portable Text, Content.tsx needs to know how to render it.
          // We enabled 'lead-magnet' and 'cta' in blog.post schema?
          // Wait, we need to update blog.post schema to ALLOW these types in the body array!
          // The tasks.md said: "1.2 Update src/sanity/schemaTypes/documents/blog.post.ts to allow lead-magnet..."
          // I haven't done that yet!

          // For now, let's assume we insert them.
          // We need to wrap them in a block structure or just insert the raw module object
          // if the schema allows arrays of these types.

          injection.modules.forEach((module) => {
            // Use a random key to avoid React key issues
            newBody.push({ ...module, _key: `injected-${injection._id}-${Math.random()}` });
          });
        }
        injectionIndex++;
      }
    }
    bodyContent = newBody;
  }

  return (
    <article>
      {/* Top Placements */}
      {placements?.top && placements.top.length > 0 && (
        <section className="bg-background border-b border-border">
          <Modules modules={placements.top} />
        </section>
      )}

      {/* Header Section */}
      <section className="bg-background pt-24 md:pt-32 pb-8 border-b border-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Manual Breadcrumbs Implementation to avoid nested Section double-padding */}
          <Breadcrumb className="mb-6 font-medium text-muted-foreground">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />

              {crumbs.map((crumb) => (
                <Fragment key={crumb.label}>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </Fragment>
              ))}

              <BreadcrumbItem>
                <BreadcrumbPage>{post.metadata?.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-8">
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight mb-6"
                data-sanity={stega.scope('metadata.title').toString()}
              >
                {post.metadata?.title}
              </h1>

              <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-muted-foreground text-sm">
                <Authors authors={post.authors} bio={true} className="flex items-center gap-2" />

                <div className="hidden sm:block w-px h-8 bg-border"></div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <DateDisplay
                    value={post.publishDate}
                    data-sanity={stega.scope('publishDate').toString()}
                  />
                </div>

                {post.readTime && (
                  <div className="flex items-center gap-1.5">
                    <ReadTime value={post.readTime} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Content Column */}
          <div className="lg:col-span-8">
            {/* Hero Image */}
            {(post.metadata?.image || post.metadata?.title) && (
              <div
                className="w-full rounded-xl overflow-hidden shadow-md mb-8 bg-muted aspect-video"
                data-sanity={stega.scope('metadata.image').toString()}
              >
                <Img
                  image={
                    post.metadata?.image || {
                      src: `/api/og/blog-fallback?title=${encodeURIComponent(post.metadata?.title || '')}&category=${encodeURIComponent(
                        post.categories?.[0]?.title || ''
                      )}`,
                      alt: post.metadata?.title || '',
                      width: 1200,
                      height: 630,
                    }
                  }
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 100vw, 900px"
                  priority
                  fetchPriority="high"
                  alt={post.metadata.title || ''}
                  unoptimized={!post.metadata?.image}
                />
              </div>
            )}

            {/* Mobile Sidebar (Top: TOC + Share) */}
            <MobileSidebar headings={post.headings} />

            <Content
              value={bodyContent}
              className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-xl"
              data-sanity={stega.scope('body').toString()}
            />

            {/* Mobile Sidebar Modules (Bottom) */}
            <div className="lg:hidden mt-12 space-y-12">
              {/* Share Article (Mobile) */}
              <div className="bg-card rounded-2xl p-6 border shadow-sm">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                  Share Article
                </h4>
                <SocialShare
                  title={post.metadata?.title || ''}
                  slug={post.metadata?.slug?.current || ''}
                />
              </div>

              {placements?.sidebar && placements.sidebar.length > 0 && (
                <Modules modules={placements.sidebar} isSidebar={true} />
              )}
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24 self-start">
            <Sidebar
              headings={post.headings}
              title={post.metadata?.title || ''}
              slug={post.metadata?.slug?.current || ''}
            >
              {placements?.sidebar && placements.sidebar.length > 0 && (
                <Modules modules={placements.sidebar} isSidebar={true} />
              )}
            </Sidebar>
          </div>
        </div>
      </div>

      {/* Bottom Placements */}
      {placements?.bottom && placements.bottom.length > 0 && (
        <section className="bg-background border-t border-border">
          <Modules modules={placements.bottom} />
        </section>
      )}
    </article>
  );
}
