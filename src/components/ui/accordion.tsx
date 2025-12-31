'use client';

import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils/index';

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('flex w-full flex-col gap-3', className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card',
        'transition-all duration-300',
        'hover:border-primary/50',
        'data-[open]:border-primary/30 data-[open]:shadow-md data-[open]:shadow-primary/5',
        className
      )}
      {...props}
    />
  );
}

function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger w-full flex items-center justify-between gap-4 p-5 text-left outline-none',
          'transition-colors duration-200',
          'hover:bg-muted/30',
          'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...props}
      >
        <span className="text-base font-semibold text-foreground">{children}</span>
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className={cn(
            'size-5 shrink-0 text-muted-foreground',
            'transition-transform duration-300 ease-out',
            'group-hover/accordion-trigger:text-primary',
            'group-aria-expanded/accordion-trigger:rotate-180 group-aria-expanded/accordion-trigger:text-primary'
          )}
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden data-[open]:animate-accordion-expand data-[closed]:animate-accordion-collapse"
      {...props}
    >
      <div
        className={cn(
          'border-t border-border/30 px-5 pb-5 pt-4',
          'text-muted-foreground leading-relaxed',
          '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-primary/80',
          '[&_p:not(:last-child)]:mb-4',
          '[&_ul]:space-y-2 [&_li]:flex [&_li]:items-start [&_li]:gap-2',
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
