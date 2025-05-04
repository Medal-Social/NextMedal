import { cn } from '@/lib/utils';
import CTAList from '@/ui/CTAList';
import Pretitle from '@/ui/Pretitle';
import { PortableText, stegaClean } from 'next-sanity';

/**
 * Reusable component for rendering the content section of the Hero
 */
export const HeroContent = ({
  pretitle,
  content,
  ctas,
  textAlign,
  alignItems,
  hasBackground,
}: {
  pretitle?: string;
  content?: any;
  ctas?: Sanity.CTA[];
  textAlign?: React.CSSProperties['textAlign'];
  alignItems?: React.CSSProperties['alignItems'];
  hasBackground?: boolean;
}) => (
  <div
    className={cn(
      'p-8 w-full flex flex-col',
      {
        'text-left': stegaClean(textAlign) === 'left',
        'text-center': stegaClean(textAlign) === 'center',
        'text-right': stegaClean(textAlign) === 'right',
      },
      {
        'items-start justify-start': stegaClean(alignItems) === 'start',
        'items-center justify-center': stegaClean(alignItems) === 'center',
        'items-end justify-end': stegaClean(alignItems) === 'end',
      }
    )}
  >
    {pretitle && (
      <Pretitle
        className={cn('mb-6 inline-block', {
          'self-start': stegaClean(textAlign) === 'left',
          'self-center': stegaClean(textAlign) === 'center',
          'self-end': stegaClean(textAlign) === 'right',
        })}
      >
        {pretitle}
      </Pretitle>
    )}

    {content && (
      <div
        className={cn('hero ', hasBackground && 'text-shadow-sm', {
          '': stegaClean(textAlign) === 'center',
        })}
      >
        <PortableText value={content} />
      </div>
    )}

    {ctas && ctas.length > 0 && (
      <CTAList
        ctas={ctas}
        className={cn('!mt-8 gap-4', {
          'justify-start': stegaClean(textAlign) === 'left',
          'justify-center': stegaClean(textAlign) === 'center',
          'justify-end': stegaClean(textAlign) === 'right',
        })}
      />
    )}
  </div>
);
