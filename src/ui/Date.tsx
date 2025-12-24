export default function ({
  value,
  options,
  className,
  ...props
}: {
  value?: string;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
} & React.ComponentProps<'time'>) {
  if (!value) return null;
  if (!options) options = { year: 'numeric', month: 'short', day: 'numeric' };
  if (value.includes('T')) {
    value = value.split('T')[0];
  }
  const formatted = new Date(`${value}T00:00:00`).toLocaleDateString('en-US', options);

  return (
    <time dateTime={value} className={className} {...props}>
      {formatted}
    </time>
  );
}
