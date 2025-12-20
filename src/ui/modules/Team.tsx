import { PortableText } from 'next-sanity';
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaUser,
  FaYoutube,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils';
import moduleProps from '@/lib/moduleProps';
import { Img } from '@/ui/Img';
import Pretitle from '@/ui/Pretitle';

export default function Team({
  pretitle,
  intro,
  people,
  layout = 'grid',
  ...props
}: Partial<{
  pretitle: string;
  intro: any;
  people: Sanity.Person[];
  layout: 'grid' | 'split';
}> &
  Sanity.Module) {
  return (
    <Section className="bg-white dark:bg-slate-950" {...moduleProps(props)}>
      {layout === 'grid' && (
        <>
          {(pretitle || intro) && (
            <div className="section-intro mb-12 flex flex-col items-center gap-4 text-center">
              {pretitle && <Pretitle>{pretitle}</Pretitle>}
              {intro && (
                <div className="text-center font-bold">
                  <PortableText value={intro} />
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
            {pretitle && <Pretitle className="mb-4 ml-1">{pretitle}</Pretitle>}
            {intro && (
              <div className="prose prose-slate dark:prose-invert [&>:first-child]:mt-0">
                <PortableText value={intro} />
              </div>
            )}
          </div>

          <div className="xl:col-span-3">
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {people?.map((person) => (
                <TeamMember
                  person={person}
                  key={person._key || person.name}
                  layout="list"
                />
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
          <div className="flex aspect-[4/5] w-24 sm:w-52 flex-none items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-700">
            <FaUser className="h-8 w-8 sm:h-16 sm:w-16 text-slate-400 dark:text-slate-500" />
          </div>
        )}

        <div className="max-w-xl flex-auto">
          <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
            {person.name}
          </h3>
          {person.title && (
            <p className="text-sm sm:text-base/7 text-gray-600 dark:text-gray-400">
              {person.title}
            </p>
          )}

          {person.bio && (
            <div className="mt-2 sm:mt-6 text-sm sm:text-base/7 text-gray-600 dark:text-gray-400">
              <PortableText value={person.bio} />
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
        <div className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-700">
          <FaUser className="h-20 w-20 text-slate-400 dark:text-slate-500" />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
          {person.name}
        </h3>
        {person.title && (
          <p className="text-base text-gray-600 dark:text-gray-400">
            {person.title}
          </p>
        )}

        {person.bio && (
          <div className="text-base text-gray-600 dark:text-gray-400 line-clamp-4">
            <PortableText value={person.bio} />
          </div>
        )}

        <SocialLinks person={person} className="mt-4" />
      </div>
    </li>
  );
}

function SocialLinks({
  person,
  className,
}: {
  person: Sanity.Person;
  className?: string;
}) {
  if (!person.socialLinks) return null;

  return (
    <ul className={cn('flex gap-x-4', className)}>
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
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label={`${link.platform} profile for ${person.name}`}
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
