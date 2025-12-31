import { cn } from '@/lib/utils/index';
import CTA from './CTA';

type CTAItem = Sanity.CTA | { _key?: string; link?: Sanity.MenuItem; style?: Sanity.CTA['style'] };

export default function CTAList({
  ctas,
  className,
  size,
}: {
  ctas?: CTAItem[];
  size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';
} & React.ComponentProps<'div'>) {
  if (!ctas?.length) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-[.5em]', className)}>
      {ctas?.map((cta, index) => {
        // For items with a link, pass the link label as children if not already specified
        if ('link' in cta && cta.link && !('children' in cta)) {
          return (
            <CTA {...cta} size={size} key={cta._key || index}>
              {cta.link.label}
            </CTA>
          );
        }
        return <CTA {...cta} key={cta._key || index} />;
      })}
    </div>
  );
}
