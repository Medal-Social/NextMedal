'use client';

import { motion, type Variants } from 'framer-motion';
import { ChevronDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { stegaClean } from 'next-sanity';
import type { ReactNode } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import resolveUrl from '@/lib/resolveUrl';
import CTAList from '@/ui/CTAList';
import LocaleSwitcher from '@/ui/language-switcher';
import ThemeToggleWrapper from './ThemeToggleWrapper';

// Toggle import removed as it's no longer used

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
}: Omit<MobileNavigationProps, 'headerLogo' | 'isOpen' | 'setIsOpen'>) {
  const containerVariants: Variants = {
    closed: {
      opacity: 0,
      y: '-100%',
      transition: {
        type: 'tween',
        ease: [0.32, 0.72, 0, 1],
        duration: 0.5,
      },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'tween',
        ease: [0.32, 0.72, 0, 1],
        duration: 0.5,
        delay: 0.1, // Wait for icon animation
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, y: -10 },
    open: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      initial="closed"
      animate="open"
      exit="closed"
      variants={containerVariants}
      className="fixed inset-0 z-[40] flex h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground lg:hidden pt-[var(--header-height)]"
    >
      <nav className="flex-1 overflow-y-auto pb-safe" aria-label="Mobile navigation">
        <div className="mx-auto max-w-screen-xl px-4 py-6 space-y-8">
          <ul className="space-y-2">
            {menu?.items?.map((item, index: number) => {
              if (item._type === 'menuItem') {
                return (
                  <motion.li key={`mobile-${item.label}-${index}`} variants={itemVariants}>
                    <NavLink link={item} />
                  </motion.li>
                );
              }

              if (item._type === 'dropdownMenu') {
                return (
                  <motion.li key={`mobile-${item.title}-${index}`} variants={itemVariants}>
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
                              <NavLink link={link} />
                            </li>
                          ))}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  </motion.li>
                );
              }
              return null;
            })}
          </ul>

          <motion.div variants={itemVariants} className="space-y-6 pt-6 border-t border-border">
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
          </motion.div>
        </div>
      </nav>
    </motion.div>
  );
}
