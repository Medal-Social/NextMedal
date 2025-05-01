export default function ({
  value,
  options,
  className,
}: {
  value?: string;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}) {
  if (!value) return null;
  if (!options) options = { year: 'numeric', month: 'short', day: 'numeric' };
  if (value.includes('T')) {
    value = value.split('T')[0];
  }
  const formatted = new Date(`${value}T00:00:00`).toLocaleDateString('en-US', options);

  return (
    <time dateTime={value} className={className}>
      {formatted}
    </time>
  );
}
