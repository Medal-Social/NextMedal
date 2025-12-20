import { groq, PortableText } from 'next-sanity';
import { Section } from '@/components/ui/section';
import { fetchSanityLive } from '@/sanity/lib/fetch';
import { Img } from '@/ui/Img';
import Link from 'next/link';

export default async function LogoCloud({
  content,
  logos,
}: Partial<{
  content: any;
  logos: Sanity.Logo[];
}> &
  Sanity.Module) {
  const allLogos =
    logos ||
    (await fetchSanityLive<Sanity.Logo[]>({
      query: groq`*[_type == 'logo']|order(name)`,
    }));

  return (
    <Section className="space-y-8 text-center">
      {content && (
        <div className="prose prose-slate dark:prose-invert mx-auto text-muted-foreground">
          <PortableText value={content} />
        </div>
      )}

      {allLogos.length > 5 ? (
        <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
          <div className="flex animate-marquee items-center gap-12 whitespace-nowrap pause-on-hover">
            {[...allLogos, ...allLogos].map((logo, i) => (
              <div key={`${logo._key || logo.name}-${i}`} className="mx-6">
                <LogoItem logo={logo} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <figure className="mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {allLogos.map((logo) => (
            <div key={logo._key || logo.name}>
              <LogoItem logo={logo} />
            </div>
          ))}
        </figure>
      )}
    </Section>
  );
}

function LogoItem({ logo }: { logo: Sanity.Logo }) {
  const defaultLogo = logo.image?.default;
  const lightLogo = logo.image?.light;
  const darkLogo = logo.image?.dark;

  const hasDualMode = lightLogo && darkLogo;

  const ImageContent = () => {
    if (hasDualMode) {
      return (
        <>
          <Img
            className="h-[2.5em] w-[200px] shrink-0 object-contain max-sm:w-[150px] dark:hidden"
            image={lightLogo}
            height={100}
            width={400}
            alt={logo.name}
          />
          <Img
            className="hidden h-[2.5em] w-[200px] shrink-0 object-contain max-sm:w-[150px] dark:block"
            image={darkLogo}
            height={100}
            width={400}
            alt={logo.name}
          />
        </>
      );
    }

    return (
      <Img
        className="h-[2.5em] w-[200px] shrink-0 object-contain max-sm:w-[150px]"
        image={defaultLogo || lightLogo || darkLogo}
        height={100}
        width={400}
        alt={logo.name}
      />
    );
  };

  if (logo.link) {
    return (
      <Link
        href={logo.link}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-opacity hover:opacity-80"
      >
        <ImageContent />
      </Link>
    );
  }

  return <ImageContent />;
}
