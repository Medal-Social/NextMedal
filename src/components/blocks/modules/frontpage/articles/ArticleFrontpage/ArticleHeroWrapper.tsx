'use client';

import { useArticleFilters } from '../store';
import ArticleHero from './ArticleHero';

interface ArticleHeroWrapperProps {
  heroPost: Sanity.CollectionArticlePost;
  recentPost?: Sanity.CollectionArticlePost;
  popularPost?: Sanity.CollectionArticlePost;
}

export default function ArticleHeroWrapper({
  heroPost,
  recentPost,
  popularPost,
}: ArticleHeroWrapperProps) {
  const { category, search } = useArticleFilters();

  // Hide hero when any filter is active
  const isFiltering = (category && category !== 'All') || search;

  if (isFiltering) {
    return null;
  }

  return <ArticleHero featuredPost={heroPost} recentPost={recentPost} popularPost={popularPost} />;
}
