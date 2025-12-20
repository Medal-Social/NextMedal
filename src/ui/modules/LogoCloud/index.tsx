import { groq, PortableText } from 'next-sanity';
import { Section } from '@/components/ui/section';
import { fetchSanityLive } from '@/sanity/lib/fetch';
import { Img } from '@/ui/Img';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import css from './LogoCloud.module.css';

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

  const logoContent = (
    <>
      {allLogos.map((logo) => {
        const defaultLogo = logo.image?.default;
        const lightLogo = logo.image?.light || defaultLogo;
        const darkLogo = logo.image?.dark;

        const hasDualMode = lightLogo && darkLogo;

        const ImageContent = () => {
          if (hasDualMode) {
            return (
              <>
                <Img
                  className="h-full w-full object-contain dark:hidden"
                  image={lightLogo}
                  height={100}
                  width={400}
                  alt={logo.name}
                />
                <Img
                  className="hidden h-full w-full object-contain dark:block"
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
              className="h-full w-full object-contain"
              image={defaultLogo || lightLogo || darkLogo}
              height={100}
              width={400}
              alt={logo.name}
            />
          );
        };

        const wrapperClass =
          'flex items-center justify-center shrink-0 w-[150px] sm:w-[200px] h-12';

        if (logo.link) {
          return (
            <Link
              key={logo._key || logo.name}
              href={logo.link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(css['logo-link'], wrapperClass)}
            >
              <ImageContent />
            </Link>
          );
        }

        return (
          <div key={logo._key || logo.name} className={wrapperClass}>
            <ImageContent />
          </div>
        );
      })}
    </>
  );

  const shouldAnimate = allLogos.length >= 6;

  return (
    <Section className="overflow-hidden space-y-4 text-center">
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
                h4: ({ children }) => (
                  <h4 className="text-lg font-semibold mb-2">{children}</h4>
                ),
              },
            }}
          />
        </div>
      )}

      {shouldAnimate ? (
        <div
          className="relative mx-auto flex max-w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
          style={
            {
              '--dur': '40s',
            } as React.CSSProperties
          }
        >
          <div className={cn('flex items-center gap-12', css.track)}>
            {logoContent}
            {logoContent}
            {logoContent}
            {logoContent}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {logoContent}
        </div>
      )}
    </Section>
  );
}
