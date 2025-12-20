import Link from 'next/link';
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter, FaYoutube } from 'react-icons/fa6';
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
  return (
    <div
      className={cn(
        'relative flex items-center gap-[.5ch]',
        linked && 'group',
        !linked && !socialLinks && 'pointer-events-none'
      )}
    >
      {linked && author?.slug?.current && (
        <Link href={`/blog?author=${author.slug.current}`} className="absolute inset-0 z-0">
          <span className="sr-only">View author {author.name}</span>
        </Link>
      )}

      <div className="flex items-center gap-x-3">
        {author?.image ? (
          <Img
            className="aspect-square rounded-full object-cover relative z-0 w-10 h-10"
            image={author.image}
            width={80}
            alt={author.name}
          />
        ) : (
          <GoPerson className="text-primary/20 text-xl relative z-0" />
        )}
        <div className="relative z-0">
          <div className={cn('font-semibold', linked && 'group-hover:underline')}>
            {author?.name}
          </div>
          {bio && author?.title && (
            <div className="text-muted-foreground">{`${author?.title}`}</div>
          )}
          {socialLinks && Array.isArray(author?.socialLinks) ? (
            <ul className="mt-1 flex items-center gap-x-6 relative z-10">
              {author.socialLinks.map((link, index) => {
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
