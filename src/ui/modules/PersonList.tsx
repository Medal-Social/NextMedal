import moduleProps from '@/lib/moduleProps';
import { Img } from '@/ui/Img';
import Pretitle from '@/ui/Pretitle';
import { PortableText } from 'next-sanity';
import { FaInstagram, FaLinkedin, FaUser, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export default function PersonList({
  pretitle,
  intro,
  people,
  layout,
  ...props
}: Partial<{
  pretitle: string;
  intro: any;
  people: Sanity.Person[];
  layout: 'grid' | 'carousel';
  isTabbedModule?: boolean;
}> &
  Sanity.Module) {
  return (
    <section className="section bg-white dark:bg-slate-950 py-12 md:py-24" {...moduleProps(props)}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-20 px-6 lg:px-8 xl:grid-cols-5">
        <div className="max-w-2xl xl:col-span-2">
          {pretitle && <Pretitle>{pretitle}</Pretitle>}
          <div className="richtext">
            <PortableText value={intro} />
          </div>
        </div>

        <ul className="divide-y divide-gray-200 dark:divide-gray-800 xl:col-span-3">
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
                <div className="aspect-[4/5] w-52 flex-none rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <FaUser className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                </div>
              )}

              <div className="max-w-xl flex-auto">
                <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                  {person.name}
                </h3>
                {person.title && (
                  <p className="text-base/7 text-gray-600 dark:text-gray-400">{person.title}</p>
                )}

                {person.bio && (
                  <p className="mt-6 text-base/7 text-gray-600 dark:text-gray-400">{person.bio}</p>
                )}

                {person.socialLinks && (
                  <ul className="mt-6 flex gap-x-6">
                    {person.socialLinks.twitter && (
                      <li>
                        <a
                          href={person.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          aria-label={`X/Twitter profile for ${person.name}`}
                        >
                          <span className="sr-only">X</span>
                          <FaXTwitter className="size-5" />
                        </a>
                      </li>
                    )}
                    {person.socialLinks.linkedIn && (
                      <li>
                        <a
                          href={person.socialLinks.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          aria-label={`LinkedIn profile for ${person.name}`}
                        >
                          <span className="sr-only">LinkedIn</span>
                          <FaLinkedin className="size-5" />
                        </a>
                      </li>
                    )}
                    {person.socialLinks.instagram && (
                      <li>
                        <a
                          href={person.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          aria-label={`Instagram profile for ${person.name}`}
                        >
                          <span className="sr-only">Instagram</span>
                          <FaInstagram className="size-5" />
                        </a>
                      </li>
                    )}
                    {person.socialLinks.youtube && (
                      <li>
                        <a
                          href={person.socialLinks.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          aria-label={`YouTube channel for ${person.name}`}
                        >
                          <span className="sr-only">YouTube</span>
                          <FaYoutube className="size-6" />
                        </a>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
