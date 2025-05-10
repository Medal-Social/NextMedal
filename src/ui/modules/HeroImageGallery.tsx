import { PortableText } from 'next-sanity';
import CTAList from '../CTAList';
import { Img } from '../Img';
import Pretitle from '../Pretitle';

export function HeroImageGallery({
  pretitle,
  content,
  ctas,
  assets,
}: {
  pretitle?: string;
  content?: any;
  ctas?: Sanity.CTA[];
  assets?: Sanity.Img[];
}) {
  return (
    <div className="overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 pt-36 pb-32 sm:pt-60 lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
          <div className="relative w-full lg:max-w-xl lg:shrink-0 xl:max-w-2xl">
            {pretitle && <Pretitle className="mb-6 inline-block self-start">{pretitle}</Pretitle>}
            {content && (
              <div className="hero">
                <PortableText value={content} />
              </div>
            )}
            {ctas && ctas.length > 0 && (
              <CTAList ctas={ctas} className="!mt-8 gap-4 justify-start" />
            )}
          </div>
          <div className="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
            <div className="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-none xl:pt-80">
              <div className="relative">
                <Img
                  image={assets?.[0]?.image}
                  className="aspect-2/3 w-full rounded-xl  bg-transparent object-cover shadow-lg"
                />
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset" />
              </div>
            </div>
            <div className="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
              <div className="relative">
                <Img
                  image={assets?.[1]?.image}
                  className="aspect-2/3 w-full rounded-xl  object-cover shadow-lg"
                />
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset" />
              </div>
              <div className="relative">
                <Img
                  image={assets?.[2]?.image}
                  className="aspect-2/3 w-full rounded-xl  object-cover shadow-lg"
                />
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset" />
              </div>
            </div>
            <div className="w-44 flex-none space-y-8 pt-32 sm:pt-0">
              <div className="relative">
                <Img
                  image={assets?.[3]?.image}
                  className="aspect-2/3 w-full rounded-xl  object-cover shadow-lg"
                />
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset" />
              </div>
              <div className="relative">
                <Img
                  image={assets?.[4]?.image}
                  className="aspect-2/3 w-full rounded-xl object-cover shadow-lg"
                />
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
