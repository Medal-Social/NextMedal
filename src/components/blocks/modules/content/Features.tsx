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
      <div className={cn('mx-auto px-4 relative z-10', !isSidebar && 'container')}>
        <div
          className={cn(
            'flex flex-col gap-8 border-b border-border/50 pb-10',
            isSidebar ? 'mb-8' : 'lg:flex-row lg:items-end justify-between mb-16 lg:mb-20'
          )}
        >
          <div className="max-w-3xl">
            {intro && (
              <div className={cn(!isSidebar && 'text-center text-balance')}>
                <SharedPortableText value={intro} variant="intro" />
              </div>
            )}
          </div>
        </div>

        {/* Desktop Staggered Grid */}
        <div
          className={cn(
            'hidden lg:grid items-start',
            isSidebar ? 'grid-cols-1 gap-6' : 'grid-cols-3 gap-8'
          )}
        >
          {isSidebar
            ? items?.map((item, index) => (
                <FeatureCard key={item._key || index} item={item} index={index} />
              ))
            : columns.map((colItems, colIndex) => (
                <div
                  key={colIndex}
                  className={cn('space-y-8', colIndex === 0 && 'mt-12', colIndex === 2 && 'mt-24')}
                >
                  {colItems?.map((item, index) => (
                    <FeatureCard key={item._key || index} item={item} index={index} />
                  ))}
                </div>
              ))}
        </div>

        {/* Mobile/Tablet Simple Grid */}
        <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-6', !isSidebar && 'lg:hidden')}>
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
      className="group h-full bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
    >
      <div className="flex items-start gap-5 mb-5">
        <div className="relative w-14 h-14 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-tr-2xl rounded-bl-2xl rounded-tl-md rounded-br-md rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
          <div className="absolute inset-0 flex items-center justify-center text-primary">
            {item.icon && <Icon icon={item.icon} className="w-8 h-8" />}
          </div>
        </div>
        <h3 className="text-xl font-bold pt-1.5 leading-tight text-foreground">{item.summary}</h3>
      </div>
      <div className="text-[17px] text-muted-foreground leading-relaxed font-medium opacity-90">
        <SharedPortableText value={item.content} />
      </div>
    </motion.div>
  );
}
