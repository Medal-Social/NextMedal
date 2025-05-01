import { cn } from '@/lib/utils';
import CTA from './CTA';

type CTAItem = Sanity.CTA | { _key?: string; link?: Sanity.Link; style?: string };

export default function CTAListCallout({
  ctas,
  className,
}: {
  ctas?: CTAItem[];
} & React.ComponentProps<'div'>) {
  if (!ctas?.length) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-[.5em]', className)}>
      {ctas?.map((cta) => {
        // For items with a link, pass the link label as children if not already specified
        if ('link' in cta && cta.link && !('children' in cta)) {
          return (
            <CTA
              className={cn(
                'max-sm:w-full',
                cta.style === 'default' &&
                  'rounded-md bg-[#7c3aed] px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-[#7c3aed]/90  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed]'
              )}
              size={'lg'}
              {...cta}
              key={cta._key || cta.link.label}
            >
              {cta.link.label}
            </CTA>
          );
        }
        return (
          <CTA
            className={cn(
              cta.style === 'default'
                ? 'rounded-md bg-[#7c3aed] px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-[#7c3aed]/90  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed]'
                : 'text-sm/6 font-semibold hover:text-white text-white bg-transparent hover:bg-transparent border-none'
            )}
            size={'lg'}
            {...cta}
            key={cta._key || Math.random()}
          />
        );
      })}
    </div>
  );
}
