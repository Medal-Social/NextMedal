import Link from 'next/link';
import { cn } from '@/lib/utils';

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
    <>
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
      </span>
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
        {status.title}
      </span>
    </>
  );

  const containerClasses = cn(
    'group flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 hover:bg-muted/50 transition-colors border border-border/40',
    className
  );

  if (status.url) {
    return (
      <Link
        href={status.url}
        target="_blank"
        rel="noopener noreferrer"
        className={containerClasses}
        aria-label={`System status: ${status.title}`}
      >
        {content}
      </Link>
    );
  }

  return <div className={containerClasses}>{content}</div>;
}
