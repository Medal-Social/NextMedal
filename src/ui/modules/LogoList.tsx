import { groq, PortableText } from 'next-sanity';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils';
import { fetchSanityLive } from '@/sanity/lib/fetch';
import { Img } from '@/ui/Img';
import Pretitle from '@/ui/Pretitle';

export default async function LogoList({
  pretitle,
  intro,
  logos,
  logoType = 'default',
}: Partial<{
  pretitle: string;
  intro: any;
  logos: Sanity.Logo[];
  logoType: 'default' | 'light' | 'dark';
}>) {
  const allLogos =
    logos ||
    (await fetchSanityLive<Sanity.Logo[]>({
      query: groq`*[_type == 'logo']|order(name)`,
    }));

  return (
    <Section className="space-y-8">
      {(pretitle || intro) && (
        <header className="mx-auto max-w-screen-sm text-center text-balance prose prose-slate dark:prose-invert">
          <Pretitle>{pretitle}</Pretitle>
          <PortableText value={intro} />
        </header>
      )}

      <figure className="mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
        {allLogos.map((logo) => (
          <Img
            className="h-[2.5em] w-[200px] shrink-0 object-contain max-sm:w-[150px]"
            image={logo.image?.[logoType] || logo.image?.default}
            height={100}
            width={400}
            alt={logo.name}
            key={logo._key || logo.name}
          />
        ))}
      </figure>
    </Section>
  );
}
