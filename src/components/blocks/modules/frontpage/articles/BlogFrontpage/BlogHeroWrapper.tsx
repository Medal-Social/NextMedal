'use client';

import { useBlogFilters } from '../store';
import BlogHero from './BlogHero';

interface BlogHeroWrapperProps {
  heroPost: Sanity.CollectionBlogPost;
  recentPost?: Sanity.CollectionBlogPost;
  popularPost?: Sanity.CollectionBlogPost;
}

export default function BlogHeroWrapper({
  heroPost,
  recentPost,
  popularPost,
}: BlogHeroWrapperProps) {
  const { category, search } = useBlogFilters();

  // Hide hero when any filter is active
  const isFiltering = (category && category !== 'All') || search;

  if (isFiltering) {
    return null;
  }

  return <BlogHero featuredPost={heroPost} recentPost={recentPost} popularPost={popularPost} />;
}
