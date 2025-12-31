'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatFullDate, formatRelativeDate } from '@/lib/utils/index';

export default function DateDisplay({
  value,
  relative = true,
  className,
  ...props
}: {
  value?: string;
  relative?: boolean;
  className?: string;
} & React.ComponentProps<'time'>) {
  if (!value) return null;

  const dateStr = value.includes('T') ? value.split('T')[0] : value;
  const fullDate = formatFullDate(value);
  const display = relative ? formatRelativeDate(value) : fullDate;

  // If showing relative date, wrap in tooltip to show full date on hover
  if (relative) {
    return (
      <Tooltip>
        <TooltipTrigger render={<time dateTime={dateStr} className={className} {...props} />}>
          {display}
        </TooltipTrigger>
        <TooltipContent>{fullDate}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <time dateTime={dateStr} className={className} {...props}>
      {display}
    </time>
  );
}
