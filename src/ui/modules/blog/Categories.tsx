import Category from './Category';

export default function Categories({
  categories,
  linked,
  badge,
  ...props
}: {
  categories?: Sanity.BlogCategory[];
  linked?: boolean;
  badge?: boolean;
} & React.ComponentProps<'ul'>) {
  if (!categories?.length) return null;

  return (
    <ul {...props}>
      {categories.map((category) => (
        <li key={category._id || category.title}>
          <Category value={category} linked={linked} badge={badge} />
        </li>
      ))}
    </ul>
  );
}
