'use client';

import { motion } from 'framer-motion';
import { stegaClean } from 'next-sanity';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/moduleProps';
import { cn } from '@/lib/utils';
import CTAList from '@/ui/CTAList';
import { Img } from '@/ui/Img';
import SharedPortableText from '@/ui/modules/SharedPortableText';

const components = {
  block: {
    h1: ({ children }: any) => (
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl mb-6">{children}</h1>
    ),
    normal: ({ children }: any) => (
      <p className="mt-6 text-xl text-muted-foreground leading-relaxed">{children}</p>
    ),
  },
  marks: {
    gradient: ({ children }: any) => (
      <span className="inline-block bg-gradient-to-r from-brand-vibrant to-brand-purple bg-clip-text text-transparent dark:text-brand-400 font-extrabold">
        {children}
      </span>
    ),
    primary: ({ children }: any) => <span className="text-primary">{children}</span>,
  },
};

export default function Hero(props: Sanity.Hero & { className?: string }) {
  const { className, content, ctas, image, options } = props;

  // @ts-expect-error - dynamic access
  const bgFrom = stegaClean(options?.bgFrom) || 'brand-vibrant';
  // @ts-expect-error - dynamic access
  const bgTo = stegaClean(options?.bgTo) || 'brand-purple';

  return (
    <section
      className={cn('relative w-full overflow-hidden', className)}
      style={
        {
          '--hero-from': `var(--color-${bgFrom})`,
          '--hero-to': `var(--color-${bgTo})`,
        } as React.CSSProperties
      }
      {...moduleProps(props)}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[var(--hero-from)]/20 to-[var(--hero-to)]/20 blur-3xl opacity-70 dark:from-[var(--hero-from)]/10 dark:to-[var(--hero-to)]/10" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-brand-cyan/20 to-brand-rich/20 blur-3xl opacity-70 dark:from-brand-cyan/10 dark:to-brand-rich/10" />
      </div>

      <Section spacing="relaxed" className="relative z-10">
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:pt-4 lg:pr-4"
          >
            <div className="lg:max-w-lg mb-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {content && <SharedPortableText value={content} components={components} />}
              </motion.div>

              {/* Call-to-actions section */}
              {ctas && ctas.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="mt-8 flex gap-4"
                >
                  <CTAList className="max-sm:min-w-full" ctas={ctas} />
                </motion.div>
              )}
            </div>
          </motion.div>

          {image?.image && (
            <div className="flex items-center justify-center lg:justify-end lg:pt-4">
              <div className="relative w-full overflow-hidden rounded-xl shadow-2xl ring-1 ring-border">
                <Img
                  image={image.image}
                  className="w-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />

                {/* Subtle decoration on the left only */}
                <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-brand-vibrant/30 blur-xl pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </Section>
    </section>
  );
}
