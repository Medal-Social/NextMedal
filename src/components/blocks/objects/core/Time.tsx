/**
 * Time Display Component
 * @version 1.0.0
 * @lastUpdated 2025-12-30
 * @description Renders a formatted time from a datetime string.
 */

export default function Time({
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

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  const date = new Date(value);
  const formatted = date.toLocaleTimeString('en-US', options || defaultOptions);

  return (
    <time dateTime={value} className={className} {...props}>
      {formatted}
    </time>
  );
}
