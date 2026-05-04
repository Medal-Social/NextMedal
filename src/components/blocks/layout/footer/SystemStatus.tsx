import Link from 'next/link';
import { cn } from '@/lib/utils/index';

export type SystemStatusData = {
  title?: string;
  url?: string;
};

type SystemStatusProps = {
  status?: SystemStatusData;
  className?: string;
};

export default function SystemStatus({ status, className }: SystemStatusProps) {
  if (!status?.title) return null;

  const content = (
    <span
      className={cn(
        'font-semibold text-foreground text-xs uppercase tracking-wide transition-opacity hover:opacity-80',
        className
      )}
    >
      {status.title}
    </span>
  );

  if (status.url) {
    return (
      <Link
        href={status.url}
        target="_blank"
        rel="noopener noreferrer"
        className="focus:outline-none"
        aria-label={`System status: ${status.title}`}
      >
        {content}
      </Link>
    );
  }

  return content;
}
