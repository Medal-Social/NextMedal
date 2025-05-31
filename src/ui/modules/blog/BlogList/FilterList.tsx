import { fetchSanityLive } from '@/sanity/lib/fetch';
import { groq } from 'next-sanity';
import { Suspense } from 'react';
import Filter from './Filter';

export default async function FilterList() {
  const categories = await fetchSanityLive<Sanity.BlogCategory[]>({
    query: groq`*[
			_type == 'blog.category' &&
			count(*[_type == 'blog.post' && references(^._id)]) > 0
		]|order(title)`,
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
