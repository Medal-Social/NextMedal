import { Calendar } from 'lucide-react';
import moduleProps from '@/lib/moduleProps';
import { cn } from '@/lib/utils';
import DateDisplay from '@/ui/Date';
import Content from '@/ui/modules/RichtextModule/Content';
import TableOfContents from '@/ui/modules/RichtextModule/TableOfContents';
import Authors from './Authors';
import Categories from './Categories';
import css from './PostContent.module.css';
import ReadTime from './ReadTime';
export default function PostContent({
  post,
  ...props
}: { post?: Sanity.BlogPost } & Sanity.Module & { isTabbedModule?: boolean }) {
  if (!post || !post.metadata) return null;

  const showTOC = !post.hideTableOfContents && !!post.headings?.length;

  return (
    <div
      className={cn('section', showTOC && 'grid gap-8', showTOC && 'lg:grid-cols-[1fr_auto]')}
      {...moduleProps(props)}
    >
      <article aria-describedby={showTOC ? 'toc-aside' : undefined}>
        <header className="space-y-6 pt-4 pb-8 text-start max-w-screen-md">
          <Categories
            className="flex flex-wrap gap-x-2"
            categories={post.categories}
            linked
            badge
          />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight  mb-8 leading-tight">
            {post.metadata.title}
          </h1>
          <div className="flex flex-wrap items-start justify-start gap-x-6 gap-y-2">
            <div className="flex items-center gap-x-2">
              <Calendar className="size-4" />
              <DateDisplay value={post.publishDate} />
            </div>
            <ReadTime value={post.readTime} />
          </div>
        </header>

        {post.authors?.length && (
          <div className="flex items-center gap-5 border-t pt-6 mb-8">
            <Authors
              className="flex flex-wrap items-start justify-start gap-4"
              authors={post.authors}
              bio
              socialLinks
            />
          </div>
        )}

        <div className={cn(showTOC && 'lg:col-span-1')}>
          <Content value={post.body} className={cn(css.body, 'prose dark:prose-invert')}>
            <hr />
          </Content>
        </div>
      </article>
      {showTOC && (
        <aside
          id="toc-aside"
          className="lg:sticky-below-header mx-auto w-full max-w-lg self-start [--offset:1rem] lg:order-1 lg:w-3xs lg:col-auto"
        >
          <TableOfContents headings={post.headings} />
        </aside>
      )}
    </div>
  );
}
