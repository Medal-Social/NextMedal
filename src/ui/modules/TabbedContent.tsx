import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import Pretitle from '@/ui/Pretitle';
import { PortableText } from 'next-sanity';
import Icon from '../Icon';

interface Tab {
  title: string;
  icon: Sanity.Icon;
  content: React.ReactNode;
}

interface TabbedContentProps {
  content?: any;
  pretitle?: string;
  tabs: Tab[];
  className?: string;
}

export default function TabbedContent({ content, pretitle, tabs, className }: TabbedContentProps) {
  // Get icon component from Lucide

  if (!tabs || tabs.length === 0) return null;

  return (
    <section className={cn('section', className)}>
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-6">
          {pretitle && <Pretitle className="mb-2">{pretitle}</Pretitle>}

          {content && (
            <div className="hero">
              <PortableText value={content} />
            </div>
          )}
        </div>

        <Tabs defaultValue={tabs[0]?.title || ''} className="w-full">
          <div className="flex justify-center">
            <TabsList
              className={cn(
                'grid w-full max-w-4xl h-auto p-1',
                tabs.length === 2
                  ? 'grid-cols-2'
                  : tabs.length === 3
                    ? 'grid-cols-3'
                    : tabs.length === 4
                      ? 'grid-cols-2 md:grid-cols-4'
                      : tabs.length > 4
                        ? 'grid-cols-3 md:grid-cols-5'
                        : 'grid-cols-1'
              )}
            >
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.title}
                  value={tab.title}
                  className="flex bg-secondary text-secondary-foreground flex-col items-center py-2 px-3 h-auto"
                >
                  <Icon icon={tab.icon} className="size-5" />
                  <span className="text-xs mt-1">{tab.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.title} value={tab.title} className="space-y-8">
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
