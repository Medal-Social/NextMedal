import { cn } from '@/lib/utils';
import CTAList from '@/ui/CTAList';
import { Img } from '@/ui/Img';
import Pretitle from '@/ui/Pretitle';
import { PortableText, stegaClean } from 'next-sanity';
import Icon from '../Icon';

interface FeatureItem {
  name: string;
  description: string;
  icon: Sanity.Icon;
}

export interface FeaturedHeroProps {
  pretitle?: string;
  image?: Sanity.Img;
  direction?: 'left' | 'right';
  features?: FeatureItem[];
  textAlign?: 'left' | 'center' | 'right';
  ctas?: any[];
  className?: string;
  isTabbedModule?: boolean;
  content?: any;
}

export default function FeaturedHero({
  pretitle,
  image,
  direction = 'right',
  features = [],
  textAlign = 'left',
  ctas,
  className,
  isTabbedModule = false,
  content,
}: FeaturedHeroProps) {
  const isRightDirection = stegaClean(direction) === 'right';
  // Dynamically get Lucide icon component
  const getIconComponent = (icon: Sanity.Icon) => {
    if (!icon?.ic0n) return null;
    return (
      <div className="absolute top-1 left-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon icon={icon} className="size-5 text-primary" />
      </div>
    );
  };
  return (
    <section className={cn(!isTabbedModule && 'py-24 sm:py-32', className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div
            className={cn(
              'lg:pt-4',
              isRightDirection ? 'lg:mr-auto lg:pr-4' : 'lg:ml-auto lg:pl-4'
            )}
          >
            <div
              className={cn(
                'lg:max-w-lg mb-10',
                stegaClean(textAlign) === 'center' && 'text-center',
                stegaClean(textAlign) === 'right' && 'text-right'
              )}
            >
              {pretitle && <Pretitle className="mb-4">{stegaClean(pretitle)}</Pretitle>}

              {content && (
                <div className="hero">
                  <PortableText value={stegaClean(content)} />
                </div>
              )}

              {features.length > 0 && (
                <dl className="mt-2 max-w-xl space-y-4 text-base/7 lg:max-w-none text-muted-foreground">
                  {stegaClean(features).map((feature) => (
                    <div key={feature.name} className="relative pl-14 py-2">
                      <dt className="inline font-semibold text-foreground">
                        {getIconComponent(feature.icon)}
                        {feature.name}
                      </dt>{' '}
                      <dd className="inline">{feature.description}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {/* Call-to-actions section */}
              {ctas && ctas.length > 0 && (
                <div
                  className={cn(
                    'mt-8 flex gap-4 ',
                    stegaClean(textAlign) === 'center' && 'justify-center',
                    stegaClean(textAlign) === 'right' && 'justify-end'
                  )}
                >
                  <CTAList className="max-sm:min-w-full" ctas={stegaClean(ctas)} />
                </div>
              )}
            </div>
          </div>
          <div
            className={cn(
              'flex items-center lg:items-start justify-center lg:justify-end lg:pt-4',
              !isRightDirection ? 'lg:order-first' : '',
              features.length > 0 && 'lg:items-center'
            )}
          >
            {image && (
              <Img
                image={image.image}
                className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-border sm:w-[57rem] object-cover"
                alt={image.alt || image.image?.alt || 'Featured image'}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
