import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { Img } from '@/components/blocks/objects/core';
import {
  IconFacebook,
  IconInstagram,
  IconLinkedin,
  IconTwitterX,
  IconUser,
  IconYoutube,
} from '@/components/icons/social-icons';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/sanity/module-props';
import { cn } from '@/lib/utils/index';

export default function Team({ intro, people, layout = 'grid', ...props }: Sanity.Team) {
  return (
    <Section className="bg-card" {...moduleProps(props)}>
      {layout === 'grid' && (
        <>
          {intro && (
            <div className="section-intro mb-12 flex flex-col items-center gap-4 text-center">
              {intro && (
                <div className="text-center font-bold">
                  <SharedPortableText value={intro} />
                </div>
              )}
            </div>
          )}

          <ul className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {people?.map((person) => (
              <TeamMember person={person} key={person._key || person.name} />
            ))}
          </ul>
        </>
      )}

      {layout === 'split' && (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-20 xl:grid-cols-5 items-start">
          <div className="max-w-2xl xl:col-span-2 xl:sticky xl:top-24">
            {intro && (
              <div className="prose dark:prose-invert [&>:first-child]:mt-0">
                <SharedPortableText value={intro} />
              </div>
            )}
          </div>

          <div className="xl:col-span-3">
            <ul className="divide-y divide-border">
              {people?.map((person) => (
                <TeamMember person={person} key={person._key || person.name} layout="list" />
              ))}
            </ul>
          </div>
        </div>
      )}
    </Section>
  );
}

function TeamMember({
  person,
  layout = 'card',
}: {
  person: Sanity.Person;
  layout?: 'card' | 'list';
}) {
  if (layout === 'list') {
    return (
      <li className="flex gap-4 sm:gap-10 py-6 sm:py-12 first:pt-0 last:pb-0">
        {person.image ? (
          <Img
            className="aspect-[4/5] w-24 sm:w-52 flex-none rounded-2xl object-cover"
            image={person.image}
            width={208}
            height={260}
          />
        ) : (
          <div className="flex aspect-[4/5] w-24 sm:w-52 flex-none items-center justify-center rounded-2xl bg-muted">
            <IconUser className="h-8 w-8 sm:h-16 sm:w-16 text-muted-foreground" />
          </div>
        )}

        <div className="max-w-xl flex-auto">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{person.name}</h3>
          {person.title && (
            <p className="text-sm sm:text-base/7 text-muted-foreground">{person.title}</p>
          )}

          {person.bio && (
            <div className="mt-2 sm:mt-6 text-sm sm:text-base/7 text-muted-foreground">
              <SharedPortableText value={person.bio} />
            </div>
          )}

          <SocialLinks person={person} className="mt-4 sm:mt-6" />
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-6">
      {person.image ? (
        <Img
          className="aspect-[4/5] w-full rounded-2xl object-cover"
          image={person.image}
          width={400}
          height={500}
        />
      ) : (
        <div className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl bg-muted">
          <IconUser className="h-20 w-20 text-muted-foreground" />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{person.name}</h3>
        {person.title && <p className="text-base text-muted-foreground">{person.title}</p>}

        {person.bio && (
          <div className="text-base text-muted-foreground line-clamp-4">
            <SharedPortableText value={person.bio} />
          </div>
        )}

        <SocialLinks person={person} className="mt-4" />
      </div>
    </li>
  );
}

function SocialLinks({ person, className }: { person: Sanity.Person; className?: string }) {
  if (!person.socialLinks || !Array.isArray(person.socialLinks)) return null;

  return (
    <ul className={cn('flex gap-x-4', className)}>
      {person.socialLinks.map((link) => {
        const Icon =
          {
            linkedin: IconLinkedin,
            twitter: IconTwitterX,
            instagram: IconInstagram,
            youtube: IconYoutube,
            facebook: IconFacebook,
          }[link.platform] || IconUser;

        if (!link.url) return null;

        return (
          <li key={link._key}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
              aria-label={`${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)} profile for ${person.name}`}
            >
              <span className="sr-only">{link.platform}</span>
              <Icon className="size-5" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
