import { cn } from '@/lib/utils/index';
import SocialShare from './SocialShare';
import TableOfContents from './TableOfContents';

interface HeadingItem {
  style: string;
  text: string;
}

export default function Sidebar({
  headings,
  title,
  slug,
  shareLabel,
  onThisPageLabel,
  children,
  className,
}: {
  headings?: HeadingItem[];
  title: string;
  slug: string;
  shareLabel: string;
  onThisPageLabel?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <aside className={cn('hidden lg:block', className)}>
      <div className="space-y-8">
        {/* Table of Contents */}
        {headings && headings.length > 0 && (
          <div className="bg-card rounded-2xl p-6 border shadow-sm">
            <TableOfContents headings={headings} onThisPageLabel={onThisPageLabel} />
          </div>
        )}

        {/* Share Article */}
        <div className="bg-card rounded-2xl p-6 border shadow-sm">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
            {shareLabel}
          </h4>
          <SocialShare title={title} slug={slug} />
        </div>

        {/* Future Global Modules or Children */}
        {children}
      </div>
    </aside>
  );
}
