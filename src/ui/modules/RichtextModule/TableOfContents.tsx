'use client';

import { cn, slug } from '@/lib/utils';
import { stegaClean } from 'next-sanity';
import { useEffect } from 'react';
import css from './TableOfContents.module.css';

export default function TableOfContents({
  headings,
}: {
  headings?: {
    text: string;
    style: string;
  }[];
}) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const headerHeight = document.querySelector('body > header')?.clientHeight || 0;

    const observers: IntersectionObserver[] = [];
    if (headings) {
      for (const { text } of headings) {
        const target = document.getElementById(slug(text));
        if (!target) continue;
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              const tocItem = document.querySelector(`[data-toc-item="${slug(text)}"]`);
              if (entry.isIntersecting) {
                tocItem?.classList.add(css.inView);
              } else {
                tocItem?.classList.remove(css.inView);
              }
            }
          },
          {
            rootMargin: `-${headerHeight}px 0px 0px 0px`,
          }
        );
        observer.observe(target);
        observers.push(observer);
      }
    }
    return () => {
      for (const observer of observers) {
        observer.disconnect();
      }
    };
  }, [headings]);

  return (
    <details className={cn(css.root, 'group accordion max-lg:bg-foreground/3 max-lg:p-3')} open>
      <summary className="font-bold lg:group-open:after:invisible">Table of Contents</summary>
      <nav aria-label="Table of contents">
        <ol className="anim-fade-to-b mt-2 leading-tight">
          {headings?.map(({ text, style }) => (
            <li
              className="border-foreground/10 border-l transition-all"
              data-toc-item={slug(text)}
              key={text}
            >
              <a
                className={cn(
                  'block py-1 hover:underline',
                  stegaClean(style) === 'h2' && 'pl-4',
                  stegaClean(style) === 'h3' && 'pl-6',
                  stegaClean(style) === 'h4' && 'pl-8',
                  stegaClean(style) === 'h5' && 'pl-10',
                  stegaClean(style) === 'h6' && 'pl-12'
                )}
                href={`#${slug(text)}`}
              >
                {text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
