import { cn } from '@/lib/utils';
import { Img } from '@/ui/Img';
import Link from 'next/link';
import { FaInstagram, FaLinkedin, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import { GoPerson } from 'react-icons/go';

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
      !linked || (!socialLinks && 'pointer-events-none')
    ),
    children: (
      <div className="flex items-center gap-x-4">
        {author?.image ? (
          <Img
            className="aspect-square rounded-full"
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
              {author.socialLinks.twitter && (
                <li className=" w-fit h-fit">
                  <Link
                    href={author.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground w-fit h-auto "
                    aria-label={`X/Twitter profile for ${author.name}`}
                  >
                    <span className="sr-only">X</span>
                    <FaXTwitter className="size-4" aria-hidden="true" />
                  </Link>
                </li>
              )}
              {author.socialLinks.linkedIn && (
                <li>
                  <Link
                    href={author.socialLinks.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground w-fit h-auto "
                    aria-label={`LinkedIn profile for ${author.name}`}
                  >
                    <span className="sr-only">LinkedIn</span>
                    <FaLinkedin className="size-4" aria-hidden="true" />
                  </Link>
                </li>
              )}
              {author.socialLinks.instagram && (
                <li>
                  <Link
                    href={author.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground w-fit h-auto"
                    aria-label={`Instagram profile for ${author.name}`}
                  >
                    <span className="sr-only">Instagram</span>
                    <FaInstagram className="size-4" aria-hidden="true" />
                  </Link>
                </li>
              )}
              {author.socialLinks.youtube && (
                <li>
                  <Link
                    href={author.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground w-fit h-auto"
                    aria-label={`YouTube channel for ${author.name}`}
                  >
                    <span className="sr-only">YouTube</span>
                    <FaYoutube className="size-4" aria-hidden="true" />
                  </Link>
                </li>
              )}
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
