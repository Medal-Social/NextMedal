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
import { Date as DateDisplay, Img } from '@/ui/base';
import Authors from '@/ui/modules/blog/Authors';
import MobileSidebar from '@/ui/modules/blog/MobileSidebar';
import ReadTime from '@/ui/modules/blog/ReadTime';
import Sidebar from '@/ui/modules/blog/Sidebar';
import SocialShare from '@/ui/modules/blog/SocialShare';
import Content from '@/ui/modules/RichtextModule/Content';
import Modules from '../Modules';

type BlogPost = Sanity.BlogPost & { headings?: Array<{ style: string; text: string }> };

// Build breadcrumbs from post data
function buildBreadcrumbs(post: BlogPost) {
  const crumbs = [{ label: 'Blog', href: '/blog' }];

  if (post.categories?.[0]) {
    crumbs.push({
      label: post.categories[0].title,
      href: `/blog?category=${post.categories[0].slug?.current}`,
    });
  }

  return crumbs;
}

// Check if a block is a normal paragraph
function isNormalParagraph(block: { _type?: string; style?: string }): boolean {
  return block._type === 'block' && stegaClean(block.style) === 'normal';
}

// Get modules from an injection, with generated keys
function getInjectionModules(injection: NonNullable<Placements['injection']>[number]) {
  if (!injection.modules || injection.modules.length === 0) return [];
  return injection.modules.map((module) => ({
    ...module,
    _key: `injected-${injection._id}-${Math.random()}`,
  }));
}

// Process body content with injections
function processBodyWithInjections(
  body: Sanity.BlockContent | undefined,
  injections: Placements['injection']
): Sanity.BlockContent | undefined {
  if (!injections || injections.length === 0 || !body) {
    return body;
  }

  const sortedInjections = [...injections].sort(
    (a, b) => (a.injectionConfig?.afterParagraph || 0) - (b.injectionConfig?.afterParagraph || 0)
  );

  let paragraphCount = 0;
  let injectionIndex = 0;
  const newBody: Sanity.BlockContent = [];

  for (const block of body) {
    newBody.push(block);

    if (isNormalParagraph(block)) {
      paragraphCount++;
    }

    // Insert all injections that should appear after this paragraph
    while (
      injectionIndex < sortedInjections.length &&
      (sortedInjections[injectionIndex].injectionConfig?.afterParagraph || 0) === paragraphCount
    ) {
      newBody.push(...getInjectionModules(sortedInjections[injectionIndex]));
      injectionIndex++;
    }
  }

  return newBody;
}

// Breadcrumbs component
function PostBreadcrumbs({
  crumbs,
  currentTitle,
}: {
  crumbs: Array<{ label: string; href: string }>;
  currentTitle?: string;
}) {
  return (
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
          <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Post header section
function PostHeader({
  post,
  stega,
}: {
  post: BlogPost;
  stega: ReturnType<typeof createDataAttribute>;
}) {
  const crumbs = buildBreadcrumbs(post);

  return (
    <section className="bg-background pt-24 md:pt-32 pb-8 border-b border-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <PostBreadcrumbs crumbs={crumbs} currentTitle={post.metadata?.title} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-8">
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight mb-6"
              data-sanity={stega.scope('metadata.title').toString()}
            >
              {post.metadata?.title}
            </h1>

            <PostMeta post={post} stega={stega} />
          </div>
        </div>
      </div>
    </section>
  );
}

// Post metadata (author, date, read time)
function PostMeta({
  post,
  stega,
}: {
  post: BlogPost;
  stega: ReturnType<typeof createDataAttribute>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-muted-foreground text-sm">
      <Authors authors={post.authors} bio={true} className="flex items-center gap-2" />

      <div className="hidden sm:block w-px h-8 bg-border" />

      <div className="flex items-center gap-1.5">
        <Calendar className="w-4 h-4" />
        <DateDisplay value={post.publishDate} data-sanity={stega.scope('publishDate').toString()} />
      </div>

      {post.readTime && (
        <div className="flex items-center gap-1.5">
          <ReadTime value={post.readTime} />
        </div>
      )}
    </div>
  );
}

// Hero image component
function HeroImage({
  post,
  stega,
}: {
  post: BlogPost;
  stega: ReturnType<typeof createDataAttribute>;
}) {
  if (!post.seo?.image && !post.metadata?.title) return null;

  const fallbackImage = {
    src: `/api/og/blog-fallback?title=${encodeURIComponent(post.metadata?.title || '')}&category=${encodeURIComponent(
      post.categories?.[0]?.title || ''
    )}`,
    alt: post.metadata?.title || '',
    width: 1200,
    height: 630,
  };

  return (
    <div
      className="w-full rounded-xl overflow-hidden shadow-md mb-8 bg-muted aspect-video"
      data-sanity={stega.scope('seo.image').toString()}
    >
      <Img
        image={post.seo?.image || fallbackImage}
        className="w-full h-full object-cover"
        sizes="(max-width: 768px) 100vw, 900px"
        priority
        fetchPriority="high"
        alt={post.metadata?.title || ''}
        unoptimized={!post.seo?.image}
      />
    </div>
  );
}

// Mobile share and sidebar modules
function MobileBottomContent({ post, placements }: { post: BlogPost; placements?: Placements }) {
  return (
    <div className="lg:hidden mt-12 space-y-12">
      <div className="bg-card rounded-2xl p-6 border shadow-sm">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
          Share Article
        </h4>
        <SocialShare title={post.metadata?.title || ''} slug={post.metadata?.slug?.current || ''} />
      </div>

      {placements?.sidebar && placements.sidebar.length > 0 && (
        <Modules modules={placements.sidebar} isSidebar={true} />
      )}
    </div>
  );
}

export default function BlogPostLayout({
  post,
  placements,
}: {
  post: BlogPost;
  placements?: Placements;
}) {
  const stega = createDataAttribute({
    id: post._id,
    type: post._type,
  });

  const bodyContent = processBodyWithInjections(post.body, placements?.injection ?? []);

  return (
    <article>
      {/* Top Placements */}
      {placements?.top && placements.top.length > 0 && (
        <section className="bg-background border-b border-border">
          <Modules modules={placements.top} />
        </section>
      )}

      <PostHeader post={post} stega={stega} />

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Content Column */}
          <div className="lg:col-span-8">
            <HeroImage post={post} stega={stega} />
            <MobileSidebar headings={post.headings} />

            {bodyContent && (
              <Content
                value={bodyContent}
                className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-xl"
                data-sanity={stega.scope('body').toString()}
              />
            )}

            <MobileBottomContent post={post} placements={placements} />
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
