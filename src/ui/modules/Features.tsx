'use client';

import { motion } from 'framer-motion';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/moduleProps';
import { cn } from '@/lib/utils';
import Icon from '@/ui/Icon';
import SharedPortableText from '@/ui/modules/SharedPortableText';

export default function Features({ intro, items, ...props }: Sanity.Features) {
  // Distribute items into 3 columns for desktop layout
  const columns: Sanity.Features['items'][] = [[], [], []];
  if (items) {
    items.forEach((item, i) => {
      columns[i % 3]?.push(item);
    });
  }

  return (
    <Section {...moduleProps(props)} className="py-24 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 lg:mb-20 gap-8 border-b border-border/50 pb-10">
          <div className="max-w-3xl">
            {intro && (
              <div className="text-center text-balance">
                <SharedPortableText value={intro} variant="intro" />
              </div>
            )}
          </div>
        </div>

        {/* Desktop Staggered Grid */}
        <div className="hidden lg:grid grid-cols-3 gap-8 items-start">
          {columns.map((colItems, colIndex) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:hidden">
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
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
