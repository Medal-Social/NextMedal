import { Suspense } from 'react';
import { fetchSanityLive } from '@/sanity/lib/live';
import { ARTICLE_CATEGORIES_WITH_POSTS_QUERY } from '@/sanity/lib/queries';
import Filter from './Filter';

export default async function FilterList() {
  const categories = await fetchSanityLive<Sanity.ArticleCategory[]>({
    query: ARTICLE_CATEGORIES_WITH_POSTS_QUERY,
  });

  if (!categories) return null;

  return (
    <fieldset>
      <legend className="sr-only">Filter by category</legend>

      <div className="flex flex-wrap justify-start gap-1 max-sm:justify-center">
        <Suspense>
          <Filter label="All" />

          {categories?.map((category) => (
            <Filter
              label={category.title}
              value={category.slug?.current}
              key={category.slug?.current || category.title}
            />
          ))}
        </Suspense>
      </div>
    </fieldset>
  );
}
