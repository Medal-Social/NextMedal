import { cn } from '@/lib/utils/index';
import CTA from './CTA';

type CTAItem = Sanity.CTA | { _key?: string; link?: Sanity.Link; style?: string };

// Map styles to callout-specific classes (works on dark bg-gray-900)
const calloutButtonStyles: Record<string, string> = {
  primary: 'bg-white text-gray-900 hover:bg-gray-100 border-transparent shadow-sm font-semibold',
  ghost:
    'bg-transparent text-white border border-white/40 hover:bg-white hover:text-gray-900 hover:border-white transition-colors',
  outline:
    'bg-transparent text-white border border-white/40 hover:bg-white hover:text-gray-900 hover:border-white transition-colors',
  secondary: 'bg-white/10 text-white hover:bg-white/20 border-transparent',
};

export default function CTAListCallout({
  ctas,
  className,
}: {
  ctas?: CTAItem[];
} & React.ComponentProps<'div'>) {
  if (!ctas?.length) return null;

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-3', className)}>
      {ctas?.map((cta, i) => {
        const style = (cta.style || 'primary') as NonNullable<Sanity.CTA['style']>;
        const props = { ...cta, style };
        const calloutStyle =
          calloutButtonStyles[style as keyof typeof calloutButtonStyles] ||
          calloutButtonStyles.primary;

        const children =
          'link' in cta && cta.link && !('children' in cta) ? cta.link.label : undefined;

        return (
          <CTA
            className={cn('max-sm:w-full px-6', calloutStyle)}
            size="lg"
            {...props}
            key={cta._key || i}
          >
            {children}
          </CTA>
        );
      })}
    </div>
  );
}
