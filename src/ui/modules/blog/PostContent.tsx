import moduleProps from '@/lib/moduleProps';
import { cn } from '@/lib/utils';
import DateDisplay from '@/ui/Date';
import Content from '@/ui/modules/RichtextModule/Content';
import TableOfContents from '@/ui/modules/RichtextModule/TableOfContents';
import { Calendar } from 'lucide-react';
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
    <article {...moduleProps(props)}>
      <header className="section space-y-6 pt-4 text-start max-w-screen-md">
        <Categories className="flex flex-wrap gap-x-2" categories={post.categories} linked badge />
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

        {post.authors?.length && (
          <div className="flex items-center gap-5 border-t pt-8 mt-10">
            <Authors
              className="flex flex-wrap items-start justify-start gap-4"
              authors={post.authors}
              bio
              socialLinks
            />
          </div>
        )}
      </header>

      <div className={cn('section grid gap-8', showTOC && 'lg:grid-cols-[1fr_auto]')}>
        {showTOC && (
          <aside className="lg:sticky-below-header mx-auto w-full max-w-lg self-start [--offset:1rem] lg:order-1 lg:w-3xs">
            <TableOfContents headings={post.headings} />
          </aside>
        )}

        <Content value={post.body} className={cn(css.body, 'grid max-w-screen-md')}>
          <hr />
        </Content>
      </div>
    </article>
  );
}
