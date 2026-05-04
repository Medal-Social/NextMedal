import { List } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils/index';
import TableOfContents from './TableOfContents';

interface HeadingItem {
  style: string;
  text: string;
}

export default function MobileSidebar({
  headings,
  onThisPageLabel,
  className,
}: {
  headings?: HeadingItem[];
  onThisPageLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-12 space-y-8 lg:hidden', className)}>
      {/* Table of Contents Accordion */}
      {headings && headings.length > 0 && (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <Accordion className="w-full">
            <AccordionItem value="toc" className="border-b-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <span className="flex items-center gap-2 font-bold text-muted-foreground text-xs uppercase tracking-widest">
                  <List className="h-4 w-4" />
                  {onThisPageLabel || 'On This Page'}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 [&_a]:no-underline [&_a]:hover:text-primary">
                <div className="pt-2">
                  <TableOfContents
                    headings={headings}
                    className="static h-auto max-h-none [&>h4]:hidden"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}
