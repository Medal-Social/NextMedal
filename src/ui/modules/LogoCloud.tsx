import Link from 'next/link';
import { groq, PortableText } from 'next-sanity';
import { Section } from '@/components/ui/section';
import { fetchSanityLive } from '@/sanity/lib/fetch';
import { Img } from '@/ui/Img';

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
          <PortableText
            value={content}
            components={{
              block: {
                normal: ({ children }) => (
                  <p className="text-muted-foreground text-lg">{children}</p>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold md:text-3xl mb-3">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold md:text-2xl mb-3">{children}</h3>
                ),
                h4: ({ children }) => <h4 className="text-lg font-semibold mb-2">{children}</h4>,
              },
            }}
          />
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
  const lightLogo = logo.image?.light || defaultLogo;
  const darkLogo = logo.image?.dark;

  const hasDualMode = lightLogo && darkLogo;

  const ImageContent = () => {
    if (hasDualMode) {
      return (
        <>
          <Img
            className="h-12 w-auto md:h-16 shrink-0 object-contain dark:hidden"
            image={lightLogo}
            height={100}
            width={400}
            alt={logo.name}
          />
          <Img
            className="hidden h-12 w-auto md:h-16 shrink-0 object-contain dark:block"
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
        className="h-12 w-auto md:h-16 shrink-0 object-contain"
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
