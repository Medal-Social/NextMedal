import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import moduleProps from '@/lib/moduleProps';
import { cn } from '@/lib/utils';
import Pretitle from '@/ui/Pretitle';
import { PortableText } from 'next-sanity';

export default function AccordionList({
  pretitle,
  intro,
  items,
  layout = 'vertical',
  generateSchema,
  isFullWidth,
  ...props
}: Partial<{
  pretitle: string;
  isFullWidth: boolean;
  intro: any;
  items: {
    summary: string;
    content: any;
    _content?: any;
    open?: boolean;
    _open?: boolean;
  }[];
  layout: 'vertical' | 'horizontal';
  generateSchema: boolean;
  isTabbedModule?: boolean;
}> &
  Sanity.Module) {
  const defaultOpenItems = items
    ?.map(({ summary, content: _content, open }, index) =>
      open
        ? `accordion-item-${index}-${summary ? summary.substring(0, 20).replace(/\s+/g, '-').toLowerCase() : ''}`
        : null
    )
    .filter((item): item is string => item !== null);
  return (
    <section
      className={cn('section', layout === 'horizontal' ? 'grid gap-8 md:grid-cols-2' : 'space-y-8')}
      {...(generateSchema && {
        itemScope: true,
        itemType: 'https://schema.org/FAQPage',
      })}
      {...moduleProps(props)}
    >
      <header
        className={cn(
          '',
          layout === 'horizontal'
            ? 'md:sticky-below-header self-start [--offset:1rem]'
            : 'text-center'
        )}
      >
        <Pretitle>{pretitle}</Pretitle>
        <div className="hero">
          <PortableText value={intro} />
        </div>
      </header>

      <Accordion
        type="multiple"
        defaultValue={defaultOpenItems}
        className={cn('mx-auto w-full', !isFullWidth && 'max-w-screen-md')}
      >
        {items?.map(({ summary, content, open: _open }, index) => {
          // Create a stable key for the accordion item
          const itemKey = `accordion-item-${index}-${summary ? summary.substring(0, 20).replace(/\s+/g, '-').toLowerCase() : ''}`;
          return (
            <AccordionItem
              key={itemKey}
              value={itemKey}
              {...(generateSchema && {
                itemScope: true,
                itemProp: 'mainEntity',
                itemType: 'https://schema.org/Question',
              })}
            >
              <AccordionTrigger
                className="hover:text-primary hover:underline group"
                iconClassName="group-hover:text-primary"
              >
                <span
                  {...(generateSchema && {
                    itemProp: 'name',
                  })}
                >
                  {summary}
                </span>
              </AccordionTrigger>
              {generateSchema && (
                <div
                  key={`answer-${itemKey}`}
                  className="sr-only"
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <div className="sr-only" itemProp="text">
                    <PortableText value={content} />
                  </div>
                </div>
              )}

              <AccordionContent className="richtext" key={`answer-${itemKey}`}>
                <PortableText value={content} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}
