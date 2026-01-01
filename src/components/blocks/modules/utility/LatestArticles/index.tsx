import { groq, stegaClean } from 'next-sanity';
import { Suspense } from 'react';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/sanity/module-props';
import { cn } from '@/lib/utils/index';
import { fetchSanityLive } from '@/sanity/lib/live';
import { AUTHOR_PREVIEW_QUERY, CATEGORY_PREVIEW_QUERY, IMAGE_QUERY } from '@/sanity/lib/queries';
import PostPreview from '../../frontpage/articles/PostPreview';
import SharedPortableText from '../../SharedPortableText';
import FilterList from './FilterList';
import List from './List';

export default async function LatestArticles({
  intro,
  layout,
  limit,
  showFeaturedPostsFirst,
  displayFilters,
  filteredCategory,
  posts: postsProp,
  ...props
}: Sanity.LatestArticles & { posts?: Sanity.CollectionArticlePost[] }) {
  const posts =
    postsProp ||
    (await fetchSanityLive<Sanity.CollectionArticlePost[]>({
      query: groq`
			*[
				_type == 'collection.article'
				${filteredCategory ? '&& $filteredCategory in categories[]->._id' : ''}
			]|order(
				publishDate desc
			)
			${limit ? `[0...${limit}]` : '[0...20]'}
			{
				_id,
				_type,
				publishDate,
				metadata {
					title,
					description,
					"slug": { "current": slug.current },
					image { ${IMAGE_QUERY} }
				},
				seo {
					description,
					image { ${IMAGE_QUERY} }
				},
				collection->{ metadata { slug } },
				categories[]->${CATEGORY_PREVIEW_QUERY},
				authors[]->${AUTHOR_PREVIEW_QUERY}
			}
		`,
      params: {
        filteredCategory: filteredCategory?._id || '',
        limit: limit ?? 0,
      },
    }));

  const listClassName = cn(
    'items-stretch gap-x-8 gap-y-12',
    stegaClean(layout) === 'grid'
      ? 'grid md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]'
      : 'carousel max-xl:full-bleed md:overflow-fade-r pb-4 [--size:320px] max-xl:px-4'
  );

  const sizes =
    stegaClean(layout) === 'grid'
      ? '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
      : '320px';

  return (
    <Section className="space-y-8" {...moduleProps(props)}>
      {intro && (
        <header className="richtext">
          <SharedPortableText value={intro} />
        </header>
      )}

      {displayFilters && !filteredCategory && <FilterList />}

      <Suspense
        fallback={
          <ul className={listClassName}>
            {Array.from({ length: limit ?? 6 }).map((_, i) => (
              <li key={`skeleton-${i}`}>
                <PostPreview skeleton />
              </li>
            ))}
          </ul>
        }
      >
        <List posts={posts} className={listClassName} sizes={sizes} />
      </Suspense>
    </Section>
  );
}
