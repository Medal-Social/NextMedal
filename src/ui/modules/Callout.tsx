import { stegaClean } from 'next-sanity';
import moduleProps from '@/lib/moduleProps';
import SharedPortableText from '@/ui/modules/SharedPortableText';
import CTAListCallout from '../CTAListCallout';

const components = {
  block: {
    normal: ({ children }: any) => (
      <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto mb-6 last:mb-0">
        {children}
      </p>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white max-w-3xl mx-auto mb-6">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl sm:text-2xl font-semibold text-white max-w-3xl mx-auto mb-4 mt-8 first:mt-0">
        {children}
      </h3>
    ),
  },
};

export default function Callout({ content, ctas, ...props }: Sanity.Callout) {
  return (
    <section className="w-full py-24 sm:py-32" {...moduleProps(props)}>
      <div className="w-full ">
        <div className="relative isolate overflow-hidden bg-gray-900 text-white px-6 py-24 text-center shadow-2xl  sm:px-16">
          <SharedPortableText value={content} components={components} />

          <CTAListCallout className="!mt-8 justify-center" ctas={stegaClean(ctas)} />
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
    </section>
  );
}
