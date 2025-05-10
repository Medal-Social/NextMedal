import resolveUrl from '@/lib/resolveUrl';
import { Img } from '@/ui/Img';
import Link from 'next/link';
import Authors from './Authors';
import Categories from './Categories';
import DateDisplay from '@/ui/Date';

export default function PostPreviewLarge({ post }: { post: Sanity.BlogPost }) {
  if (!post || !post.metadata) return null;

  const href = resolveUrl({ ...post, metadata: post.metadata });

  return (
    <Link href={href}>
      <article className="group relative isolate flex flex-col gap-8 lg:flex-row">
        <div className="relative aspect-square w-full lg:aspect-[16/9] lg:w-64 lg:shrink-0">
          <Img
            className="absolute inset-0 h-full w-full rounded-2xl bg-gray-50 object-cover transition-all group-hover:scale-105 group-hover:brightness-110"
            image={post.metadata.image}
            sizes="(min-width: 1024px) 16rem, 100vw"
            priority
            alt={post.metadata.title}
          />
        </div>
        <div>
          <Categories
            className="flex flex-wrap gap-x-2"
            categories={post.categories}
            linked
            badge
          />
          <div className="group relative max-w-xl">
            <h3 className="mt-3 text-2xl font-semibold leading-6 group-hover:text-primary sm:text-3xl">
              <span className="absolute inset-0" />
              {post.metadata.title}
            </h3>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              {post.metadata.description}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm leading-6">
            <div className="flex items-center gap-x-2">
              <DateDisplay value={post.publishDate} />
            </div>
            <Authors className="flex flex-wrap items-center gap-4" authors={post.authors} bio />
          </div>
        </div>
      </article>
    </Link>
  );
}
