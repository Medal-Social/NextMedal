import { Clock } from 'lucide-react';

export default function ReadTime({
  value,
  ...props
}: { value: number } & React.ComponentProps<'span'>) {
  const minutes = Math.ceil(value);
  return (
    <span className="flex items-center gap-x-1" {...props}>
      <Clock className="size-4" /> {minutes} {minutes === 1 ? 'minute' : 'minutes'}
    </span>
  );
}
