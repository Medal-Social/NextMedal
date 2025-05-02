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
      {categories.map((category, key) => (
        <li key={key}>
          <Category value={category} linked={linked} badge={badge} />
        </li>
      ))}
    </ul>
  );
}
