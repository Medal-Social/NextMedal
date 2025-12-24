import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/moduleProps';
import { cn } from '@/lib/utils';
import SharedPortableText from '@/ui/modules/SharedPortableText';
import CTAListCallout from '../CTAListCallout';

const components = (isSidebar: boolean) => ({
  block: {
    normal: ({ children }: any) => (
      <p
        className={cn(
          'text-lg leading-relaxed max-w-2xl mx-auto mb-6 last:mb-0',
          isSidebar ? 'text-base text-gray-300' : 'text-gray-300'
        )}
      >
        {children}
      </p>
    ),
    h2: ({ children }: any) => (
      <h2
        className={cn(
          'font-bold tracking-tight text-white max-w-3xl mx-auto mb-6',
          isSidebar ? 'text-2xl' : 'text-3xl sm:text-4xl'
        )}
      >
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3
        className={cn(
          'font-semibold text-white max-w-3xl mx-auto mb-4 mt-8 first:mt-0',
          isSidebar ? 'text-lg' : 'text-xl sm:text-2xl'
        )}
      >
        {children}
      </h3>
    ),
  },
});

export default function Callout({ content, ctas, ...props }: Sanity.Callout) {
  const isSidebar = (props as any).spacing === 'none';

  return (
    <Section {...moduleProps(props)} className={cn(!isSidebar && 'py-24 sm:py-32')}>
      <div className="w-full">
        <div
          className={cn(
            'relative isolate overflow-hidden bg-gray-900 text-white text-center shadow-2xl',
            isSidebar ? 'px-6 py-12 rounded-2xl' : 'px-6 py-24 sm:px-16'
          )}
        >
          <SharedPortableText value={content} components={components(isSidebar)} />

          <CTAListCallout className="!mt-8 justify-center" ctas={ctas} />
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -z-10 size-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
          >
            <circle
              r={512}
              cx={512}
              cy={512}
              fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)"
              fillOpacity="0.7"
            />
            <defs>
              <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#E935C1" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </Section>
  );
}
