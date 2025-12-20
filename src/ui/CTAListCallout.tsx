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
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      {ctas?.map((cta, i) => {
        const style = (cta.style || 'primary') as Sanity.CTA['style'];
        const props = { ...cta, style };

        const children =
          'link' in cta && cta.link && !('children' in cta) ? cta.link.label : undefined;

        return (
          <CTA className="max-sm:w-full" size="lg" {...props} key={cta._key || i}>
            {children}
          </CTA>
        );
      })}
    </div>
  );
}
