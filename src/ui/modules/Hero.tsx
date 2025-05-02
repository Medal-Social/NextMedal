import moduleProps from '@/lib/moduleProps';
import { cn } from '@/lib/utils';
import CTAList from '@/ui/CTAList';
import Icon from '@/ui/Icon';
import { Img } from '@/ui/Img';
import Pretitle from '@/ui/Pretitle';
import { PortableText, stegaClean } from 'next-sanity';

// Stats Row Component
export const StatsRow = ({ stats }: { stats?: Sanity.Stat[] }) => {
  if (!stats || stats.length === 0) return null;

  return (
    <div
      className="mt-10 md:mt-16 flex flex-row flex-wrap justify-start gap-6 md:grid md:grid-cols-4 md:gap-x-8"
      role="list"
    >
      {stats.map((stat) => (
        <div key={stat._key} className="flex flex-col items-center sm:items-start" role="listitem">
          <div className="flex items-center gap-3 mb-2">
            {stat.icon && (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon icon={stat.icon} className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
            )}
            <p className="text-2xl font-bold text-foreground">
              <span className="sr-only">Statistic value: </span>
              {stat.value}
            </p>
          </div>
          <p className="text-base text-muted-foreground">
            <span className="sr-only">Statistic label: </span>
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
};

// Content Components
export const HeroContent = ({
  pretitle,
  content,
  ctas,
  stats,
  image,
  alignment,
}: {
  pretitle?: string;
  content?: any;
  ctas?: Sanity.CTA[];
  stats?: Sanity.Stat[];
  image?: Sanity.Img;
  alignment: string;
}) => (
  <div
    className={cn(
      'p-8 w-full flex flex-col',
      {
        'text-left': stegaClean(alignment) === 'left',
        'text-center': stegaClean(alignment) === 'center',
        'text-right': stegaClean(alignment) === 'right',
      },
      {
        'items-start justify-start': stegaClean(alignment) === 'left',
        'items-center justify-center': stegaClean(alignment) === 'center',
        'items-end justify-end': stegaClean(alignment) === 'right',
      }
    )}
  >
    {pretitle && (
      <Pretitle
        className={cn('mb-6 inline-block', {
          'self-start': stegaClean(alignment) === 'left',
          'self-center': stegaClean(alignment) === 'center',
          'self-end': stegaClean(alignment) === 'right',
        })}
      >
        {pretitle}
      </Pretitle>
    )}

    {content && (
      <div className="hero">
        <PortableText value={content} />
      </div>
    )}

    {image && <Img image={image.image} className="w-full h-full object-cover" />}

    {ctas && ctas.length > 0 && (
      <CTAList
        ctas={ctas}
        className={cn('!mt-4 gap-4', {
          'justify-start': stegaClean(alignment) === 'left',
          'justify-center': stegaClean(alignment) === 'center',
          'justify-end': stegaClean(alignment) === 'right',
        })}
      />
    )}

    {stats && stats.length > 0 && <StatsRow stats={stats} />}
  </div>
);

const DefaultLayout = ({
  pretitle,
  content,
  ctas,
  stats,
  alignment,
  image,
}: {
  pretitle?: string;
  content?: any;
  ctas?: Sanity.CTA[];
  stats?: Sanity.Stat[];
  image?: Sanity.Img;
  alignment: string;
}) => (
  <div className="relative z-10 flex h-full min-h-[inherit] w-full items-center justify-center pt-16">
    <HeroContent
      pretitle={pretitle}
      content={content}
      ctas={ctas}
      stats={stats}
      image={image}
      alignment={alignment}
    />
  </div>
);

export default function Hero({
  pretitle,
  content,
  ctas,
  stats,
  alignment = 'center',
  image,
  ...props
}: Partial<{
  pretitle: string;
  content: any;
  ctas: Sanity.CTA[];
  stats: Sanity.Stat[];
  image?: Sanity.Img;
  alignment?: string;
  isTabbedModule?: boolean;
}> &
  Sanity.Module) {
  return (
    <section className={cn('section relative')} {...moduleProps(props)}>
      <DefaultLayout
        pretitle={pretitle}
        content={content}
        alignment={alignment}
        ctas={ctas}
        stats={stats}
        image={image}
      />
    </section>
  );
}
