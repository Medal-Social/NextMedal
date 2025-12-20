import DateDisplay from '@/ui/Date';
import { Img } from '@/ui/Img';
import Authors from '@/ui/modules/blog/Authors';
import Categories from '@/ui/modules/blog/Categories';
import ReadTime from '@/ui/modules/blog/ReadTime';
import SocialShare from '@/ui/modules/blog/SocialShare';
import Content from '@/ui/modules/RichtextModule/Content';
import TableOfContents from './TableOfContents';

export default function BlogPostLayout({ post }: { post: any }) {
  return (
    <article className="section space-y-8 md:space-y-12 py-12 md:py-24">
      <div className="container max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <Categories categories={post.categories} linked badge />

          <h1 className="text-4xl md:text-6xl font-bold">{post.metadata?.title}</h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <DateDisplay value={post.publishDate} />
            {post.readTime && <ReadTime value={post.readTime} />}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t pt-6 border-border/40">
            <Authors authors={post.authors} bio socialLinks className="flex-1" />
            <SocialShare
              title={post.metadata?.title || ''}
              slug={post.metadata?.slug?.current || ''}
            />
          </div>
        </div>

        {/* Hero Image */}
        {post.metadata?.image && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
            <Img
              image={post.metadata.image}
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, 900px"
              priority
              alt={post.metadata.title || ''}
            />
          </div>
        )}

        {/* Content & TOC */}
        <div className="grid gap-12 lg:grid-cols-[1fr,250px]">
          <Content value={post.body} />

          {/* Sidebar / Table of Contents */}
          <div className="hidden lg:block space-y-8">
            <TableOfContents headings={post.headings} />
          </div>
        </div>
      </div>
    </article>
  );
}
