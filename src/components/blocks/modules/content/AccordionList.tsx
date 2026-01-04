import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/sanity/module-props';
import { cn } from '@/lib/utils/index';

export default function AccordionList({ content, items, ...props }: Sanity.AccordionList) {
  const defaultOpenItems = items
    ?.map(({ summary, open }, index) =>
      open
        ? `accordion-item-${index}-${summary ? summary.substring(0, 20).replace(/\s+/g, '-').toLowerCase() : ''}`
        : null
    )
    .filter((item): item is string => item !== null);

  return (
    <Section
      className="space-y-4 text-center"
      itemScope
      itemType="https://schema.org/FAQPage"
      {...moduleProps(props)}
    >
      {content && (
        <div className="mx-auto text-muted-foreground text-left">
          <SharedPortableText
            value={content}
            components={{
              block: {
                normal: ({ children }) => (
                  <p className="text-muted-foreground text-lg text-center">{children}</p>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold md:text-3xl mb-3 text-center">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold md:text-2xl mb-3 text-center">{children}</h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-lg font-semibold mb-2 text-center">{children}</h4>
                ),
              },
            }}
          />
        </div>
      )}

      <Accordion defaultValue={defaultOpenItems} className={cn('mx-auto w-full text-left')}>
        {items?.map(({ summary, content }, index) => {
          // Create a stable key for the accordion item
          const itemKey = `accordion-item-${index}-${summary ? summary.substring(0, 20).replace(/\s+/g, '-').toLowerCase() : ''}`;
          return (
            <AccordionItem
              key={itemKey}
              value={itemKey}
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <AccordionTrigger itemProp="name">{summary}</AccordionTrigger>
              <div
                className="sr-only"
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <div itemProp="text">
                  <SharedPortableText value={content} />
                </div>
              </div>

              <AccordionContent>
                <SharedPortableText value={content} variant="prose" />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Section>
  );
}
