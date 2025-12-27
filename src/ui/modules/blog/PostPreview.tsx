import Link from 'next/link';
import { createDataAttribute } from 'next-sanity';
import resolveUrl from '@/lib/resolveUrl';
import BlogDate from '@/ui/Date';
import { Img } from '@/ui/Img';
import Authors from './Authors';
import Categories from './Categories';

export default function PostPreview({
  post,
  skeleton,
  sizes,
}: {
  post?: Sanity.BlogPost;
  skeleton?: boolean;
  sizes?: string;
}) {
  if (!skeleton && (!post || !post.metadata)) return null;

  const _Root = skeleton ? 'div' : Link;
  const metadata = skeleton ? null : post!.metadata;
  const href = skeleton ? '' : resolveUrl({ ...post!, metadata: post!.metadata! }, { base: false });

  const dataAttribute = post?._id
    ? createDataAttribute({
        id: post._id,
        type: post._type,
      })
    : undefined;

  const fallbackImage =
    !skeleton && !metadata?.image
      ? {
          src: `/api/og/blog-fallback?title=${encodeURIComponent(
            (metadata?.title || '').slice(0, 100)
          )}&category=${encodeURIComponent(post?.categories?.[0]?.title || '')}`,
          alt: metadata?.title || '',
          width: 1200,
          height: 630,
        }
      : undefined;

  return (
    <article
      key={skeleton ? 'skeleton' : post?._id}
      className="flex group flex-col items-start justify-between"
    >
      <div className="relative w-full">
        {skeleton ? (
          <Img
            className="aspect-video w-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105 group-hover:brightness-110"
            image={metadata?.image}
            width={700}
            sizes={sizes}
            alt={metadata?.title || ''}
          />
        ) : (
          <Link href={href}>
            <Img
              className="aspect-video w-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105 group-hover:brightness-110"
              image={metadata?.image || fallbackImage}
              width={700}
              sizes={sizes}
              alt={metadata?.title || ''}
              data-sanity={dataAttribute?.scope('metadata.image').toString()}
            />
          </Link>
        )}
      </div>
      <div className="max-w-xl">
        <div className="mt-8 flex items-center gap-x-4 text-xs">
          <BlogDate
            value={skeleton ? undefined : post?.publishDate}
            data-sanity={dataAttribute?.scope('publishDate').toString()}
          />
          <Categories
            className="flex flex-wrap gap-x-2"
            categories={skeleton ? undefined : post?.categories}
            badge
          />
        </div>
        <div className="relative">
          <h3
            className="mt-3 text-lg/6 font-semibold group-hover:text-primary"
            data-sanity={dataAttribute?.scope('metadata.title').toString()}
          >
            <Link href={href}>{skeleton ? metadata?.title : post?.metadata?.title}</Link>
          </h3>
          <p
            className="mt-5 line-clamp-3 text-sm/6 text-muted-foreground"
            data-sanity={dataAttribute?.scope('metadata.description').toString()}
          >
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
