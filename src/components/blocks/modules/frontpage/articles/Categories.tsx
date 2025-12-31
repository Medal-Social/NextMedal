import Category from './Category';

export default function Categories({
  categories,
  linked,
  badge,
  ...props
}: {
  categories?: Sanity.ArticleCategory[];
  linked?: boolean;
  badge?: boolean;
} & React.ComponentProps<'ul'>) {
  if (!categories?.length) return null;

  return (
    <ul {...props}>
      {categories.map((category, index) => (
        <li key={category._id || index}>
          <Category value={category} linked={linked} badge={badge} />
        </li>
      ))}
    </ul>
  );
}
