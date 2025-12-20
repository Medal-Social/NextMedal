import { stegaClean } from 'next-sanity';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils';

import CTAList from '@/ui/CTAList';
import { Img } from '@/ui/Img';
import Pretitle from '@/ui/Pretitle';

export default function Hero(props: Sanity.Hero & { className?: string }) {
  const { className } = props;

  return (
    <Section spacing="relaxed" className={cn('relative overflow-hidden', className)}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-rose-500/20 to-purple-500/20 blur-3xl opacity-70 dark:from-rose-500/10 dark:to-purple-500/10" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 blur-3xl opacity-70 dark:from-blue-500/10 dark:to-cyan-500/10" />
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:grid-cols-2">
        <div className="lg:pt-4 lg:pr-4">
          <div className="lg:max-w-lg mb-10">
            {props.pretitle && <Pretitle className="mb-6">{props.pretitle}</Pretitle>}
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              {props.highlightedTitle ? (
                <>
                  <span className="inline-block mb-2 bg-gradient-to-r from-rose-500 to-rose-700 bg-clip-text text-transparent dark:text-rose-400 font-extrabold">
                    {props.highlightedTitle}
                  </span>{' '}
                  <br />
                </>
              ) : null}
              <span>{props.title}</span>
            </h1>

            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
              {props.description}
            </p>

            {/* Call-to-actions section */}
            {props.ctas && props.ctas.length > 0 && (
              <div className="mt-8 flex gap-4">
                <CTAList className="max-sm:min-w-full" ctas={stegaClean(props.ctas)} />
              </div>
            )}
          </div>
        </div>

        {props.image && (
          <div className="flex items-center justify-center lg:justify-end lg:pt-4">
            <div className="relative w-full overflow-hidden rounded-xl shadow-xl ring-1 ring-border">
              <Img
                image={props.image.image}
                className="w-full object-cover"
                alt={props.image.alt || props.image.image?.alt || 'Hero image'}
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />

              {/* Subtle decoration on the left only */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-rose-600/30 blur-xl pointer-events-none" />
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
