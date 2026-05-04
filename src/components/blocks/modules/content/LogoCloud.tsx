import Link from 'next/link';
import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { Img } from '@/components/blocks/objects/core';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/sanity/module-props';
import { fetchSanityLive } from '@/sanity/lib/live';
import { LOGOS_QUERY } from '@/sanity/lib/queries';

export default async function LogoCloud({ content, logos, ...props }: Sanity.LogoCloud) {
  const allLogos =
    logos ||
    (await fetchSanityLive<Sanity.Logo[]>({
      query: LOGOS_QUERY,
    }));

  return (
    <Section className="space-y-8 text-center" {...moduleProps(props)}>
      {content && (
        <div className="mx-auto text-left text-muted-foreground">
          <SharedPortableText
            value={content}
            components={{
              block: {
                normal: ({ children }) => (
                  <p className="text-center text-lg text-muted-foreground">{children}</p>
                ),
                h2: ({ children }) => (
                  <h2 className="mb-3 text-center font-bold text-2xl md:text-3xl">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-3 text-center font-semibold text-xl md:text-2xl">{children}</h3>
                ),
                h4: ({ children }) => (
                  <h4 className="mb-2 text-center font-semibold text-lg">{children}</h4>
                ),
              },
            }}
          />
        </div>
      )}

      {allLogos.length > 5 ? (
        <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
          <div className="pause-on-hover flex animate-marquee items-center gap-12 whitespace-nowrap">
            {[...allLogos, ...allLogos].map((logo, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: marquee duplicates logos so index disambiguates the second copy
                key={`${logo._key || logo.title}-${i}`}
                className="mx-6 shrink-0"
              >
                <LogoItem logo={logo} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <figure className="mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {allLogos.map((logo, index) => (
            <div key={logo._id || logo._key || logo.title || index}>
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
            className="aspect-square h-16 shrink-0 object-contain md:h-20 dark:hidden"
            image={lightLogo}
            width={200}
            height={200}
            alt={logo.title || logo.name}
          />
          <Img
            className="hidden aspect-square h-16 shrink-0 object-contain md:h-20 dark:block"
            image={darkLogo}
            width={200}
            height={200}
            alt={logo.title || logo.name}
          />
        </>
      );
    }

    return (
      <Img
        className="aspect-square h-16 shrink-0 object-contain md:h-20"
        image={defaultLogo || lightLogo || darkLogo}
        width={200}
        height={200}
        alt={logo.title || logo.name}
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
