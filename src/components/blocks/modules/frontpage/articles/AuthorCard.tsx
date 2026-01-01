'use client';

import { useEffect, useRef, useState } from 'react';
import { Img } from '@/components/blocks/objects/core';
import {
  IconFacebookF,
  IconInstagram,
  IconLinkedinIn,
  IconTwitterX,
  IconYoutube,
} from '@/components/icons/social-icons';

// Social platform configuration with icons and labels
const SOCIAL_PLATFORMS: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  linkedin: { icon: IconLinkedinIn, label: 'LinkedIn' },
  twitter: { icon: IconTwitterX, label: 'X' },
  instagram: { icon: IconInstagram, label: 'Instagram' },
  youtube: { icon: IconYoutube, label: 'YouTube' },
  facebook: { icon: IconFacebookF, label: 'Facebook' },
};

interface AuthorCardProps {
  author: Sanity.Person;
  variant?: 'light' | 'dark';
}

export default function AuthorCard({ author, variant = 'light' }: AuthorCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Extract plain text from bio (which is portable text)
  const bioText = Array.isArray(author.bio)
    ? author.bio
        .filter((block): block is Sanity.PortableTextBlock => block._type === 'block')
        .map((block: Sanity.PortableTextBlock) =>
          block.children?.map((child) => child.text).join('')
        )
        .join(' ')
    : null;

  const hasSocialLinks = Array.isArray(author.socialLinks) && author.socialLinks.length > 0;
  const hasExtraContent = bioText || hasSocialLinks || author.title || author.image;
  const hasBanner = author.banner?.asset;

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!author.name) return null;

  const isDark = variant === 'dark';

  return (
    <div ref={cardRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`relative z-10 text-sm font-medium transition-colors ${
          isDark
            ? 'text-white hover:text-purple-300'
            : 'text-slate-700 hover:text-purple-500 dark:text-slate-300 dark:hover:text-purple-300'
        }`}
      >
        {author.name}
      </button>

      {/* Card popup - z-[9999] to appear above Sanity's visual editing overlays */}
      {isOpen && hasExtraContent && (
        <div className="absolute bottom-full left-0 z-[9999] mb-2 w-80 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
            {/* Banner area - custom image or gradient */}
            <div className="relative h-24 overflow-hidden">
              {hasBanner ? (
                <Img
                  image={author.banner}
                  className="h-full w-full object-cover"
                  sizes="320px"
                  alt=""
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500" />
              )}
            </div>

            {/* Content area */}
            <div className="relative px-5 pb-5 pt-14">
              {/* Floating avatar */}
              {author.image && (
                <div className="absolute -top-10 left-5">
                  <div className="rounded-full bg-white p-1 shadow-lg ring-2 ring-white dark:bg-slate-900 dark:ring-slate-900">
                    <Img
                      image={author.image}
                      className="h-16 w-16 rounded-full object-cover"
                      sizes="64px"
                      alt={author.name}
                    />
                  </div>
                </div>
              )}

              {/* Name, title and social links */}
              <div className="mb-3">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{author.name}</h4>
                <div className="flex items-center gap-3">
                  {author.title && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {author.title}
                    </span>
                  )}
                  {/* Social links - inline with title */}
                  {hasSocialLinks && (
                    <div className="flex items-center gap-1.5">
                      {author.socialLinks?.map(
                        (link: { platform: string; url: string; _key?: string }, idx: number) => {
                          const platform = SOCIAL_PLATFORMS[link.platform];
                          if (!platform) return null;
                          const Icon = platform.icon;
                          return (
                            <a
                              key={link._key || idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                              aria-label={platform.label}
                            >
                              <Icon className="h-4 w-4" />
                            </a>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio - show full text */}
              {bioText && (
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {bioText}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
