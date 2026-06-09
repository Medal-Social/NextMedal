'use client';

import { stegaClean } from 'next-sanity';
import { useEffect, useState } from 'react';
import { cn, slug } from '@/lib/utils/index';

type TableOfContentsProps = {
  headings: {
    style: string;
    text: string;
  }[];
  onThisPageLabel?: string;
  className?: string;
};

export default function TableOfContents({
  headings,
  onThisPageLabel,
  className,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66%' }
    );

    const headingElements = document.querySelectorAll('h2, h3');
    headingElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      headingElements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []);

  if (!headings?.length) return null;

  return (
    <nav className={cn('sticky top-24 max-h-[calc(100vh-6rem)] overflow-auto', className)}>
      <h4 className="mb-4 flex items-center gap-2 font-bold text-muted-foreground text-xs uppercase tracking-widest">
        <span className="text-lg">≡</span> {onThisPageLabel || 'On this page'}
      </h4>
      <ul className="space-y-0 text-sm">
        {headings.map((heading) => {
          // Use the shared slug() helper so these ids match exactly the ones
          // SharedPortableText renders on the <h2>/<h3> headings.
          const id = slug(stegaClean(heading.text));

          return (
            <li
              key={heading.text}
              className={cn(
                'relative border-l-2 transition-colors',
                stegaClean(heading.style) === 'h3' ? 'pl-6' : 'pl-4',
                activeId === id
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-primary'
              )}
            >
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  // getElementById (not querySelector) so numeric-leading ids
                  // like "2024-plans" don't throw an invalid-selector error.
                  document.getElementById(id)?.scrollIntoView({
                    behavior: 'smooth',
                  });
                }}
                className="block py-1"
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
