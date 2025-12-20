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
        // Ensure default style if missing
        const style = (cta.style || 'primary') as Sanity.CTA['style'];
        const props = { ...cta, style };

        // For items with a link, pass the link label as children if not already specified
        if ('link' in cta && cta.link && !('children' in cta)) {
          return (
            <CTA
              className="max-sm:w-full"
              size="lg"
              {...props}
              key={cta._key || i}
            >
              {cta.link.label}
            </CTA>
          );
        }
        return (
          <CTA
            className="max-sm:w-full"
            size="lg"
            {...props}
            key={cta._key || i}
          />
        );
      })}
    </div>
  );
}
