import { groq } from 'next-sanity';
import { fetchSanityLive } from '@/sanity/lib/live';
import BlogFilterBarClient from './BlogFilterBarClient';

export default async function BlogFilterBar() {
  const categories = await fetchSanityLive<Sanity.BlogCategory[]>({
    query: groq`*[
			_type == 'blog.category' &&
			count(*[_type == 'blog.post' && references(^._id)]) > 0
		]|order(title)`,
  });

  return (
    <section className="sticky top-[var(--header-height)] z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm transition-all dark:border-slate-800 dark:bg-[#0f172a]/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <BlogFilterBarClient categories={categories} />
      </div>
    </section>
  );
}
