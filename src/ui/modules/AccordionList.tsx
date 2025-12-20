import { PortableText } from 'next-sanity';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/moduleProps';
import { cn } from '@/lib/utils';

export default function AccordionList({
  content,
  items,
  generateSchema,
  ...props
}: Partial<{
  content: any;
  items: {
    summary: string;
    content: any;
    _content?: any;
    open?: boolean;
    _open?: boolean;
  }[];
  generateSchema: boolean;
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
    <Section
      className="space-y-4 text-center"
      {...(generateSchema && {
        itemScope: true,
        itemType: 'https://schema.org/FAQPage',
      })}
      {...moduleProps(props)}
    >
      {content && (
        <div className="prose prose-slate dark:prose-invert mx-auto text-muted-foreground">
          <PortableText
            value={content}
            components={{
              block: {
                normal: ({ children }) => (
                  <p className="text-muted-foreground text-lg">{children}</p>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold md:text-3xl mb-3">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold md:text-2xl mb-3">{children}</h3>
                ),
                h4: ({ children }) => <h4 className="text-lg font-semibold mb-2">{children}</h4>,
              },
            }}
          />
        </div>
      )}

      <Accordion
        type="multiple"
        defaultValue={defaultOpenItems}
        className={cn('mx-auto w-full text-left')}
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
              <AccordionTrigger className="hover:text-primary hover:underline group [&>svg]:group-hover:text-primary">
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

              <AccordionContent className="prose prose-slate dark:prose-invert max-w-none">
                <PortableText value={content} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Section>
  );
}
