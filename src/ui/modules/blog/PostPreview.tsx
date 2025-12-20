import Link from 'next/link';
import resolveUrl from '@/lib/resolveUrl';
import BlogDate from '@/ui/Date';
import { Img } from '@/ui/Img';
import Authors from './Authors';
import Categories from './Categories';
export default function PostPreview({
  post,
  skeleton,
}: {
  post?: Sanity.BlogPost;
  skeleton?: boolean;
}) {
  if (!skeleton && (!post || !post.metadata)) return null;

  const _Root = skeleton ? 'div' : Link;
  const metadata = skeleton ? null : post!.metadata;
  const href = skeleton ? '' : resolveUrl({ ...post!, metadata: post!.metadata! });

  return (
    <article
      key={skeleton ? 'skeleton' : post?._id}
      className="flex group flex-col items-start justify-between"
    >
      <div className="relative w-full rounded-full">
        {skeleton ? (
          <Img
            className="aspect-video w-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105 group-hover:brightness-110"
            image={metadata?.image}
            width={700}
            alt={metadata?.title || ''}
          />
        ) : (
          <Link href={href}>
            <Img
              className="aspect-video w-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105 group-hover:brightness-110"
              image={metadata?.image}
              width={700}
              alt={metadata?.title || ''}
            />
          </Link>
        )}
      </div>
      <div className="max-w-xl">
        <div className="mt-8 flex items-center gap-x-4 text-xs">
          <BlogDate value={skeleton ? undefined : post?.publishDate} />
          <Categories
            className="flex flex-wrap gap-x-2"
            categories={skeleton ? undefined : post?.categories}
            badge
          />
        </div>
        <div className="relative">
          <h3 className="mt-3 text-lg/6 font-semibold group-hover:text-primary">
            {skeleton ? (
              <>
                <span className="absolute inset-0" />
                {metadata?.title}
              </>
            ) : (
              <Link href={href}>
                <span className="absolute inset-0" />
                {metadata?.title}
              </Link>
            )}
          </h3>
          <p className="mt-5 line-clamp-3 text-sm/6 text-muted-foreground">
            {metadata?.description}
          </p>
        </div>
        <div className="relative mt-8 flex items-center gap-x-4">
          <Authors
            className="flex flex-wrap items-center gap-4 text-sm"
            authors={skeleton ? undefined : post?.authors}
            skeleton={skeleton}
            bio
          />
        </div>
      </div>
    </article>
  );
}
