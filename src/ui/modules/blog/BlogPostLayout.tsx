import { Calendar } from 'lucide-react';
import { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import DateDisplay from '@/ui/Date';
import { Img } from '@/ui/Img';
import Authors from '@/ui/modules/blog/Authors';
import ReadTime from '@/ui/modules/blog/ReadTime';
import Sidebar from '@/ui/modules/blog/Sidebar';
import Content from '@/ui/modules/RichtextModule/Content';

export default function BlogPostLayout({ post }: { post: any }) {
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

  return (
    <article>
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

              {crumbs.map((crumb, _index) => (
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
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight mb-6">
                {post.metadata?.title}
              </h1>

              <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-muted-foreground text-sm">
                <Authors authors={post.authors} bio={true} className="flex items-center gap-2" />

                <div className="hidden sm:block w-px h-8 bg-border"></div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <DateDisplay value={post.publishDate} />
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
              <div className="w-full rounded-xl overflow-hidden shadow-md mb-8 bg-muted aspect-video">
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
                  alt={post.metadata.title || ''}
                  unoptimized={!post.metadata?.image}
                />
              </div>
            )}

            <Content
              value={post.body}
              className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-xl"
            />
          </div>

          {/* Sidebar Column */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24 self-start">
            <Sidebar
              headings={post.headings}
              title={post.metadata?.title || ''}
              slug={post.metadata?.slug?.current || ''}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
