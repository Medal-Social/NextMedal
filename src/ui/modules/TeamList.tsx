import { PortableText } from 'next-sanity';
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaUser,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/moduleProps';
import { Img } from '@/ui/Img';

export default function TeamList({
  intro,
  people,
  layout,
  ...props
}: Partial<{
  intro: any;
  people: Sanity.Person[];
  layout: 'grid' | 'carousel';
  isTabbedModule?: boolean;
}> &
  Sanity.Module) {
  return (
    <Section className="bg-card" {...moduleProps(props)}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-20 xl:grid-cols-5">
        <div className="max-w-2xl xl:col-span-2">
          <div className="prose dark:prose-invert">
            <PortableText value={intro} />
          </div>
        </div>

        <ul className="divide-y divide-border xl:col-span-3">
          {people?.map((person) => (
            <li
              key={person._key || person.name}
              className="flex flex-col gap-10 py-12 first:pt-0 last:pb-0 sm:flex-row"
            >
              {person.image ? (
                <Img
                  className="aspect-[4/5] w-52 flex-none rounded-2xl object-cover"
                  image={person.image}
                  width={208}
                  height={260}
                />
              ) : (
                <div className="aspect-[4/5] w-52 flex-none rounded-2xl bg-muted flex items-center justify-center">
                  <FaUser className="w-16 h-16 text-muted-foreground" />
                </div>
              )}

              <div className="max-w-xl flex-auto">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {person.name}
                </h3>
                {person.title && (
                  <p className="text-base/7 text-muted-foreground">{person.title}</p>
                )}

                {person.bio && (
                  <p className="mt-6 text-base/7 text-muted-foreground">{person.bio}</p>
                )}

                {person.socialLinks && Array.isArray(person.socialLinks) && (
                  <ul className="mt-6 flex gap-x-6">
                    {person.socialLinks.map((link) => {
                      const Icon =
                        {
                          linkedin: FaLinkedin,
                          twitter: FaXTwitter,
                          instagram: FaInstagram,
                          youtube: FaYoutube,
                          facebook: FaFacebook,
                        }[link.platform] || FaUser;

                      if (!link.url) return null;

                      return (
                        <li key={link._key}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            aria-label={`${link.platform} profile for ${person.name}`}
                          >
                            <span className="sr-only">{link.platform}</span>
                            <Icon className="size-5" />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
