import Link from 'next/link';
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from 'react-icons/fa6';
import { FaXTwitter } from 'react-icons/fa6';
import { GoPerson } from 'react-icons/go';
import { cn } from '@/lib/utils';
import { Img } from '@/ui/Img';

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
      {authors?.map((author) => (
        <Author
          author={author}
          key={author._id}
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
  const props = {
    className: cn(
      'flex items-center gap-[.5ch] ',
      linked && 'hover:underline',
      !linked || (!socialLinks && 'pointer-events-none'),
    ),
    children: (
      <div className="flex items-center gap-x-4">
        {author?.image ? (
          <Img
            className="aspect-square rounded-full object-cover"
            image={author.image}
            width={40}
            alt={author.name}
          />
        ) : (
          <GoPerson className="text-primary/20 text-xl" />
        )}
        <div>
          <div className="font-semibold">{author?.name}</div>
          {bio && author?.title && (
            <div className="text-muted-foreground">{`${author?.title}`}</div>
          )}
          {socialLinks && author?.socialLinks ? (
            <ul className="mt-1 flex items-center  gap-x-6">
              {author.socialLinks.map((link) => {
                const Icon =
                  {
                    linkedin: FaLinkedin,
                    twitter: FaXTwitter,
                    instagram: FaInstagram,
                    youtube: FaYoutube,
                    facebook: FaFacebook,
                  }[link.platform] || GoPerson;

                if (!link.url) return null;

                return (
                  <li key={link._key} className="h-fit w-fit">
                    <Link
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground h-auto w-fit"
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
    ),
  };
  return linked ? (
    <Link href={`/blog?author=${author?.slug?.current}`} {...props} />
  ) : (
    <div {...props} />
  );
}
