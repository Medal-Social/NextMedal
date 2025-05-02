import { cn } from '@/lib/utils';
import {
  AsymmetricImageLayout,
  HeroContent,
  ImageBackground,
  RegularImageLayout,
} from './components';
import type { HeroProps } from './types';

export const Hero = ({
  pretitle,
  content,
  ctas,
  images,
  textAlign = 'center',
  theme = 'light',
  asymmetricLayout = false,
  hasBackground = false,
}: HeroProps) => {
  // Process the alignment settings
  const alignItems = textAlign === 'left' ? 'start' : textAlign === 'right' ? 'end' : 'center';

  return (
    <section
      className={cn('relative mx-auto max-w-7xl overflow-hidden px-4 py-24 sm:px-6 sm:py-32', {
        'text-white': theme === 'dark',
        'text-black': theme !== 'dark',
      })}
    >
      {/* Background image if enabled */}
      {hasBackground && images && images.length > 0 && <ImageBackground asset={images[0]} />}

      <div className="relative mx-auto max-w-2xl lg:max-w-4xl">
        {/* Hero content section */}
        <HeroContent
          pretitle={pretitle}
          content={content}
          ctas={ctas}
          textAlign={textAlign}
          alignItems={alignItems}
          hasBackground={hasBackground}
        />

        {/* Images section - conditionally render based on asymmetric layout */}
        {images &&
          images.length > 0 &&
          (asymmetricLayout ? (
            <AsymmetricImageLayout assets={images} />
          ) : (
            <RegularImageLayout assets={images} />
          ))}
      </div>
    </section>
  );
};
