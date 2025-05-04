import { PortableText } from 'next-sanity';
import CTAListCallout from '../CTAListCallout';

export default function Callout({
  content,
  ctas,
}: Partial<{
  content: any;
  ctas: Sanity.CTA[];
  isTabbedModule?: boolean;
}>) {
  return (
    <section className="w-full py-24 sm:py-32">
      <div className="w-full ">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl  sm:px-16">
          <div className="emailsignup">
            <PortableText value={content} />
          </div>
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
    </section>
  );
}
