import Link from 'next/link';
import { Date as ArticleDate, Img } from '@/components/blocks/objects/core';
import { resolveUrlSync } from '@/lib/sanity/resolve-url';
import { getArticleFallbackImage } from '@/lib/utils/article-helpers';
import { createStegaAttribute } from '@/sanity/lib/client';
import Authors from './Authors';
import Categories from './Categories';

const IMAGE_CLASS =
  'aspect-video w-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105 group-hover:brightness-110';

function PostImage({
  skeleton,
  metadata,
  seo,
  fallbackImage,
  sizes,
  href,
  dataAttribute,
}: {
  skeleton?: boolean;
  metadata?: Sanity.CollectionArticlePost['metadata'];
  seo?: Sanity.CollectionArticlePost['seo'];
  fallbackImage?: { src: string; alt: string; width: number; height: number };
  sizes?: string;
  href: string;
  dataAttribute?: ReturnType<typeof createStegaAttribute>;
}) {
  // Only use Sanity image if it has a valid asset with URL, otherwise use fallback
  const hasValidImage = seo?.image?.asset?.url;
  // biome-ignore lint/suspicious/noExplicitAny: Fallback image object structure differs from Sanity.Image
  const image = hasValidImage ? seo?.image : (fallbackImage as any);

  const imageElement = (
    <Img
      className={IMAGE_CLASS}
      image={image}
      width={700}
      sizes={sizes}
      alt={metadata?.title || ''}
      data-sanity={skeleton ? undefined : dataAttribute?.scope('seo.image').toString()}
    />
  );

  if (skeleton) {
    return imageElement;
  }

  return <Link href={href}>{imageElement}</Link>;
}

export default function PostPreview({
  post,
  skeleton,
  sizes,
  href: hrefOverride,
}: {
  post?: Sanity.CollectionArticlePost;
  skeleton?: boolean;
  sizes?: string;
  href?: string;
}) {
  // Early return for non-skeleton mode without valid post data
  if (!skeleton && (!post || !post.metadata)) return null;

  const metadata = skeleton ? undefined : post?.metadata;
  const seo = skeleton ? undefined : post?.seo;
  const href =
    hrefOverride || (skeleton || !post?.metadata ? '' : resolveUrlSync(post, { base: false }));

  // Generate fallback image if no valid Sanity image exists
  const fallbackImage =
    skeleton || seo?.image?.asset?.url
      ? undefined
      : getArticleFallbackImage(metadata?.title, post?.language);

  const dataAttribute = post?._id
    ? createStegaAttribute({
        id: post._id,
        type: post._type,
      })
    : undefined;

  return (
    <article
      key={skeleton ? 'skeleton' : post?._id}
      className="flex group flex-col items-start justify-between"
    >
      <div className="relative w-full">
        <PostImage
          skeleton={skeleton}
          metadata={metadata}
          seo={seo}
          fallbackImage={fallbackImage}
          sizes={sizes}
          href={href}
          dataAttribute={dataAttribute}
        />
      </div>
      <div className="max-w-xl">
        <div className="mt-8 flex items-center gap-x-4 text-xs">
          <ArticleDate
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
            <Link href={href}>{metadata?.title}</Link>
          </h3>
          <p
            className="mt-5 line-clamp-3 text-sm/6 text-muted-foreground"
            data-sanity={dataAttribute?.scope('seo.description').toString()}
          >
            {seo?.description}
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
