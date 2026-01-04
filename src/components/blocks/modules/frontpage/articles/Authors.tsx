import Link from 'next/link';
import { Img } from '@/components/blocks/objects/core';
import {
  IconFacebook,
  IconInstagram,
  IconLinkedin,
  IconTwitterX,
  IconUser,
  IconYoutube,
} from '@/components/icons/social-icons';
import { cn } from '@/lib/utils/index';
import { createStegaAttribute } from '@/sanity/lib/client';

export default function Authors({
  authors,
  skeleton,
  linked,
  socialLinks,
  bio = false,
  ...props
}: {
  authors?: Sanity.Person[];
  skeleton?: boolean;
  linked?: boolean;
  socialLinks?: boolean;
  bio?: boolean;
} & React.ComponentProps<'div'>) {
  if (!authors?.length && !skeleton) return null;

  return (
    <div {...props}>
      {authors?.map((author, index) => (
        <Author
          author={author}
          key={author._id ? `${author._id}-${index}` : index}
          linked={linked}
          socialLinks={socialLinks}
          bio={bio}
        />
      ))}

      {skeleton && <Author />}
    </div>
  );
}

function Author({
  author,
  linked,
  socialLinks,
  bio,
}: {
  author?: Sanity.Person;
  linked?: boolean;
  socialLinks?: boolean;
  bio?: boolean;
}) {
  const stega =
    author?._id && author?._type
      ? createStegaAttribute({
          id: author._id,
          type: author._type,
        })
      : undefined;

  return (
    <div
      className={cn(
        'relative flex items-center gap-[.5ch]',
        !socialLinks && !stega && 'pointer-events-none'
      )}
      data-sanity={stega?.scope('name').toString()}
    >
      <div className="flex items-center gap-x-3">
        {author?.image ? (
          <Img
            className="aspect-square rounded-full object-cover relative z-0 w-10 h-10"
            image={author.image}
            width={80}
            alt={author.name}
            data-sanity={stega?.scope('image').toString()}
          />
        ) : (
          <IconUser className="text-primary/20 text-xl relative z-0" />
        )}
        <div className="relative z-0">
          <div className={cn('font-semibold', linked && 'group-hover:underline')}>
            {author?.name}
          </div>
          {bio && author?.title && (
            <div
              className="text-muted-foreground"
              data-sanity={stega?.scope('title').toString()}
            >{`${author?.title}`}</div>
          )}
          {socialLinks && Array.isArray(author?.socialLinks) ? (
            <ul className="mt-1 flex items-center gap-x-6 relative z-10">
              {author.socialLinks.map((link, index) => {
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
                  <li key={link._key || index} className="h-fit w-fit">
                    <Link
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground h-auto w-fit block"
                      aria-label={`${link.platform} profile for ${author.name}`}
                    >
                      <span className="sr-only">{link.platform}</span>
                      <Icon className="size-4" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
