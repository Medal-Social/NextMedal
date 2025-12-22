'use client';

import { ChevronDown, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';
import { stegaClean } from 'next-sanity';
import { type ReactNode, useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import resolveUrl from '@/lib/resolveUrl';
import CTAList from '@/ui/CTAList';
import LocaleSwitcher from '@/ui/language-switcher';
import ThemeToggleWrapper from './ThemeToggleWrapper';

interface MobileNavigationProps {
  menu: {
    items?: (Sanity.MenuItem | Sanity.DropdownMenu)[];
  };
  ctas: any;
  headerLogo?: ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const NavLink = ({
  link,
  onClick,
}: {
  link: Sanity.MenuItem | Sanity.Link;
  onClick?: () => void;
}) => (
  <Link
    href={
      link.internal && (link.internal as any)._type !== 'reference'
        ? resolveUrl(link.internal as any, {
            base: false,
            params: link.params,
          })
        : link.external
          ? stegaClean(link.external)
          : '/'
    }
    className="flex items-center gap-4 rounded-lg p-4 text-lg font-medium hover:bg-accent hover:text-primary text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
    target={link.external ? '_blank' : undefined}
    aria-label={link.external ? `${link.label} (opens in new tab)` : undefined}
    onClick={onClick}
  >
    <div className="flex-1">
      <div className="flex items-center gap-2">
        {link.label}
        {link.external && <ExternalLink className="h-4 w-4" aria-hidden="true" />}
      </div>
    </div>
  </Link>
);

export default function MobileNavigation({
  menu,
  ctas,
  headerLogo,
  isOpen,
  setIsOpen,
}: MobileNavigationProps) {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Render content conditionally inside the persistent container handled by HeaderClient
  // or keep render but use CSS to hide interaction
  
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Mobile Header Bar */}
      <div className="flex items-center justify-between p-4 border-b border-border/10 min-h-[var(--header-height)]">
        <div className="flex items-center">{headerLogo}</div>
        <button
          type="button"
          className="p-2 -mr-2 cursor-pointer rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto pb-safe" aria-label="Mobile navigation">
        <div className="mx-auto max-w-screen-xl px-4 py-6 space-y-8">
          <ul className="space-y-2">
            {menu?.items?.map((item, index: number) => {
              if (item._type === 'menuItem') {
                return (
                  <li key={`mobile-${item.label}-${index}`}>
                    <NavLink link={item} onClick={() => setIsOpen(false)} />
                  </li>
                );
              }

              if (item._type === 'dropdownMenu') {
                return (
                  <li key={`mobile-${item.title}-${index}`}>
                    <Collapsible>
                      <CollapsibleTrigger
                        className="flex w-full items-center justify-between rounded-lg p-4 text-lg font-medium hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                        aria-label={`${item.title} submenu`}
                      >
                        <span className="font-medium">{item.title}</span>
                        <ChevronDown
                          className="h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180"
                          aria-hidden="true"
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <ul className="ml-4 mt-2 space-y-2 border-l-2 border-border pl-4">
                          {item.links?.map((link, linkIndex: number) => (
                            <li key={`mobile-${link.label}-${index}-${linkIndex}`}>
                              <NavLink link={link} onClick={() => setIsOpen(false)} />
                            </li>
                          ))}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                );
              }
              return null;
            })}
          </ul>

          <div className="space-y-6 pt-6 border-t border-border">
            <CTAList ctas={ctas} className="grid gap-4 *:w-full *:text-lg *:py-6" />

            <div className="flex flex-col gap-4 px-4 pb-6">
              <LocaleSwitcher
                dropdownAlign="start"
                className="w-full justify-start h-14 px-4 text-lg [&>span]:inline-block [&>span]:text-lg"
              />
              <ThemeToggleWrapper
                dropdownAlign="start"
                className="w-full justify-start h-14 px-4 text-lg [&>span]:inline-block [&>span]:text-lg"
              />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
