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
          'mx-auto text-balance leading-relaxed last:mb-0',
          isSidebar
            ? 'mb-4 max-w-2xl text-base text-gray-300'
            : 'mt-4 max-w-xl text-gray-300 text-lg sm:text-xl'
        )}
      >
        {children}
      </p>
    ),
    h2: ({ children }: BlockChildrenProps) => (
      <h2
        className={cn(
          'mx-auto font-bold text-white tracking-tight',
          isSidebar ? 'mb-4 max-w-2xl text-2xl' : 'text-4xl sm:text-5xl lg:text-6xl'
        )}
      >
        {children}
      </h2>
    ),
    h3: ({ children }: BlockChildrenProps) => (
      <h3
        className={cn(
          'mx-auto mt-6 font-semibold text-white first:mt-0',
          isSidebar ? 'mb-3 max-w-2xl text-lg' : 'mb-2 max-w-2xl text-xl sm:text-2xl'
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
          <div className="relative isolate overflow-hidden rounded-2xl bg-gray-900 px-6 py-10 text-center text-white shadow-2xl">
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
        <div className="relative isolate overflow-hidden bg-gray-900 text-center text-white">
          {/* Full-bleed background with contained content */}
          <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 sm:px-8 sm:py-20">
            <SharedPortableText value={content} components={components(isSidebar)} />
            <CTAListCallout className="mt-6" ctas={ctas} />
          </div>
          {/* Subtle centered gradient */}
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -z-10 size-[50rem] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
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
