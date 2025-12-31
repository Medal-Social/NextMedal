import { useQueryState } from 'nuqs';

export const useArticleFilters = () => {
  const [category, setCategory] = useQueryState('category', {
    defaultValue: 'All',
    shallow: false,
  });

  const [author, setAuthor] = useQueryState('author', { shallow: false });

  const [search, setSearch] = useQueryState('search', {
    defaultValue: '',
    shallow: false,
  });

  const [view, setView] = useQueryState('view', {
    defaultValue: 'grid',
    shallow: false,
  });

  return {
    category,
    author,
    search,
    view,
    setCategory,
    setAuthor,
    setSearch,
    setView,
  };
};
