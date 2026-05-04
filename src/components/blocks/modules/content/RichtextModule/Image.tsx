import { Img } from '@/components/blocks/objects/core';

export default function Image({ value }: { value: Sanity.Image }) {
  return (
    <figure className="max-lg:full-bleed space-y-2 text-center md:[grid-column:bleed]!">
      <Img
        className="mx-auto max-h-svh w-auto bg-primary/3 text-[0px]"
        image={value}
        width={1200}
        sizes="(max-width: 1024px) 100vw, 850px"
      />
    </figure>
  );
}
