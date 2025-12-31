import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { CTAListCallout } from '@/components/blocks/objects/cta';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/sanity/module-props';
import { cn } from '@/lib/utils/index';

interface BlockChildrenProps {
  children?: React.ReactNode;
}

const components = (isSidebar: boolean) => ({
  block: {
    normal: ({ children }: BlockChildrenProps) => (
      <p
        className={cn(
          'leading-relaxed mx-auto last:mb-0 text-balance',
          isSidebar
            ? 'text-base text-gray-300 max-w-2xl mb-4'
            : 'text-lg sm:text-xl text-gray-300 max-w-xl mt-4'
        )}
      >
        {children}
      </p>
    ),
    h2: ({ children }: BlockChildrenProps) => (
      <h2
        className={cn(
          'font-bold tracking-tight text-white mx-auto',
          isSidebar ? 'text-2xl max-w-2xl mb-4' : 'text-4xl sm:text-5xl lg:text-6xl'
        )}
      >
        {children}
      </h2>
    ),
    h3: ({ children }: BlockChildrenProps) => (
      <h3
        className={cn(
          'font-semibold text-white mx-auto mt-6 first:mt-0',
          isSidebar ? 'text-lg max-w-2xl mb-3' : 'text-xl sm:text-2xl max-w-2xl mb-2'
        )}
      >
        {children}
      </h3>
    ),
  },
});

export default function Callout({ content, ctas, ...props }: Sanity.Callout) {
  const isSidebar = props.spacing === 'none';

  return (
    <Section
      {...moduleProps(props)}
      width={isSidebar ? 'default' : 'full'}
      spacing="none"
      className={cn(!isSidebar && 'py-16 sm:py-20')}
    >
      {isSidebar ? (
        <div className="w-full">
          <div className="relative isolate overflow-hidden bg-gray-900 text-white text-center shadow-2xl px-6 py-10 rounded-2xl">
            <SharedPortableText value={content} components={components(isSidebar)} />
            <CTAListCallout className="!mt-6 justify-center" ctas={ctas} />
            <svg
              viewBox="0 0 1024 1024"
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 -z-10 size-[40rem] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
            >
              <circle
                r={512}
                cx={512}
                cy={512}
                fill="url(#callout-gradient-sidebar)"
                fillOpacity="0.4"
              />
              <defs>
                <radialGradient id="callout-gradient-sidebar">
                  <stop stopColor="#7775D6" />
                  <stop offset={1} stopColor="#E935C1" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      ) : (
        <div className="relative isolate overflow-hidden bg-gray-900 text-white text-center">
          {/* Full-bleed background with contained content */}
          <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
            <SharedPortableText value={content} components={components(isSidebar)} />
            <CTAListCallout className="mt-6" ctas={ctas} />
          </div>
          {/* Subtle centered gradient */}
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -z-10 size-[50rem] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
          >
            <circle
              r={512}
              cx={512}
              cy={512}
              fill="url(#callout-gradient-main)"
              fillOpacity="0.25"
            />
            <defs>
              <radialGradient id="callout-gradient-main">
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#E935C1" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      )}
    </Section>
  );
}
