'use client';

import { motion, useReducedMotion } from 'motion/react';
import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { Icon } from '@/components/blocks/objects/core';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/sanity/module-props';
import { cn } from '@/lib/utils/index';

const MAX_ANIMATION_DELAY = 0.3;

export default function Features({ intro, items, ...props }: Sanity.Features) {
  const isSidebar = props.spacing === 'none';
  // Distribute items into 3 columns for desktop layout
  const columns: Sanity.Features['items'][] = [[], [], []];
  if (items) {
    items.forEach((item, i) => {
      columns[i % 3]?.push(item);
    });
  }

  return (
    <Section {...moduleProps(props)} className={cn(!isSidebar && 'py-24', 'overflow-hidden')}>
      <div className={cn('relative z-10 mx-auto px-4', !isSidebar && 'container')}>
        <div
          className={cn(
            'flex flex-col gap-8 border-border/50 border-b pb-10',
            isSidebar ? 'mb-8' : 'mb-16 justify-between lg:mb-20 lg:flex-row lg:items-end'
          )}
        >
          <div className="max-w-3xl">
            {intro && (
              <div className={cn(!isSidebar && 'text-balance text-center')}>
                <SharedPortableText value={intro} variant="intro" />
              </div>
            )}
          </div>
        </div>

        {/* Desktop Staggered Grid */}
        <div
          className={cn(
            'hidden items-start lg:grid',
            isSidebar ? 'grid-cols-1 gap-6' : 'grid-cols-3 gap-8'
          )}
        >
          {isSidebar
            ? items?.map((item, index) => (
                <FeatureCard key={item._key || index} item={item} index={index} />
              ))
            : columns.map((colItems, colIndex) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: layout columns have stable index identity
                  key={`col-${colIndex}`}
                  className={cn('space-y-8', colIndex === 0 && 'mt-12', colIndex === 2 && 'mt-24')}
                >
                  {colItems?.map((item, index) => (
                    <FeatureCard key={item._key || index} item={item} index={index} />
                  ))}
                </div>
              ))}
        </div>

        {/* Mobile/Tablet Simple Grid */}
        <div className={cn('grid grid-cols-1 gap-6 md:grid-cols-2', !isSidebar && 'lg:hidden')}>
          {items?.map((item, index) => (
            <FeatureCard key={item._key || index} item={item} index={index} />
          ))}
        </div>
      </div>
    </Section>
  );
}

function FeatureCard({
  item,
  index,
}: {
  item: NonNullable<Sanity.Features['items']>[number];
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const animationDelay = Math.min(index * 0.1, MAX_ANIMATION_DELAY);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: animationDelay }}
      className="group relative h-full overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="mb-5 flex items-start gap-5">
        <div className="relative h-14 w-14 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
          <div className="absolute inset-0 rotate-3 rounded-tl-md rounded-tr-2xl rounded-br-md rounded-bl-2xl bg-gradient-to-br from-primary/10 to-purple-600/10 transition-transform duration-300 group-hover:rotate-6"></div>
          <div className="absolute inset-0 flex items-center justify-center text-primary">
            {item.icon && <Icon icon={item.icon} className="h-8 w-8" />}
          </div>
        </div>
        <h3 className="pt-1.5 font-bold text-foreground text-xl leading-tight">{item.summary}</h3>
      </div>
      <div className="font-medium text-[17px] text-muted-foreground leading-relaxed opacity-90">
        <SharedPortableText value={item.content} />
      </div>
    </motion.div>
  );
}
