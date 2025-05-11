import moduleProps from '@/lib/moduleProps';
import { cn } from '@/lib/utils';
import Icon from '@/ui/Icon';
import Pretitle from '@/ui/Pretitle';
import { PortableText } from 'next-sanity';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';

export default function FeatureGrid({
  pretitle,
  intro,
  items,
  ...props
}: Partial<{
  pretitle: string;
  intro: any;
  items: {
    summary: string;
    content: any;
    icon?: Sanity.Icon;
    _key: string;
  }[];
}> &
  Sanity.Module) {
  return (
    <section className="section " {...moduleProps(props)}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(pretitle || intro) && (
          <div className="section-intro text-center items-center flex flex-col mb-12 ">
            {pretitle && <Pretitle className="mb-4">{pretitle}</Pretitle>}
            {intro && (
              <>
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-center ">
                  <PortableText value={[intro[0]]} />
                </div>
                <div className="mb-4" />
                {intro[1] && (
                  <div className="text-lg md:text-xl text-center font-normal mx-auto max-w-2xl">
                    <PortableText value={[intro[1]]} />
                  </div>
                )}
                <PortableText value={intro.slice(2)} />
              </>
            )}
          </div>
        )}
        <div className={cn('grid gap-8 lg:gap-12 md:grid-cols-3')}>
          {items?.map((item) => (
            <Card
              key={item._key}
              className={cn(
                'h-full relative overflow-hidden shadow-none !border-none',
                'dark:bg-card/80 dark:backdrop-blur-sm'
              )}
            >
              {/* Accent line at the top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-muted-foreground" />
              <div className="p-6">
                <div className="flex flex-col h-full">
                  {/* Header with icon and title */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center bg-muted text-foreground">
                      {item.icon && <Icon icon={item.icon} className="w-6 h-6" />}
                    </div>
                    <CardTitle>
                      {item.summary}
                    </CardTitle>
                  </div>
                  {/* Description */}
                  <CardDescription>
                    <PortableText value={item.content} />
                  </CardDescription>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
