import { cn } from '@/lib/utils';
import SocialShare from './SocialShare';
import TableOfContents from './TableOfContents';

export default function Sidebar({
  headings,
  title,
  slug,
  children,
  className,
}: {
  headings?: any[];
  title: string;
  slug: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <aside className={cn('hidden lg:block', className)}>
      <div className="space-y-8">
        {/* Table of Contents */}
        {headings && headings.length > 0 && (
          <div className="bg-card rounded-2xl p-6 border shadow-sm">
            <TableOfContents headings={headings} />
          </div>
        )}

        {/* Share Article */}
        <div className="bg-card rounded-2xl p-6 border shadow-sm">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Share Article
          </h4>
          <SocialShare title={title} slug={slug} />
        </div>

        {/* Future Global Modules or Children */}
        {children}
      </div>
    </aside>
  );
}
