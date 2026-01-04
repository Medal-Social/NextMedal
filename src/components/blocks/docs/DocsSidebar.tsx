'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCollectionPath } from '@/lib/collections/context';
import { cn } from '@/lib/utils/index';

type DocsSidebarProps = {
  className?: string;
  mobile?: boolean;
};

// Hook to get docs categories with dynamic base path
export function useDocsCategories() {
  const docsBasePath = useCollectionPath('collection.documentation');

  return [
    {
      title: 'Getting Started',
      items: [
        { title: 'Introduction', href: docsBasePath },
        { title: 'Installation', href: `${docsBasePath}/installation` },
        { title: 'Project Structure', href: `${docsBasePath}/project-structure` },
      ],
    },
    {
      title: 'Components',
      items: [
        { title: 'Button', href: `${docsBasePath}/components/button` },
        { title: 'Input', href: `${docsBasePath}/components/input` },
        { title: 'Card', href: `${docsBasePath}/components/card` },
        { title: 'Dialog', href: `${docsBasePath}/components/dialog` },
        { title: 'Navigation', href: `${docsBasePath}/components/navigation` },
      ],
    },
    {
      title: 'Guides',
      items: [
        { title: 'Theming', href: `${docsBasePath}/guides/theming` },
        { title: 'Authentication', href: `${docsBasePath}/guides/authentication` },
        { title: 'Deploying', href: `${docsBasePath}/guides/deployment` },
        { title: 'SEO', href: `${docsBasePath}/guides/seo` },
      ],
    },
  ];
}

export function DocsSidebarContent({
  mobile,
  onClick,
}: {
  mobile?: boolean;
  onClick?: () => void;
}) {
  const categories = useDocsCategories();

  return (
    <div className={cn('pb-8', mobile ? 'pt-4' : '')}>
      {categories.map((category, index) => (
        <div key={index} className="pb-6">
          <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            {category.title}
          </h4>
          {category.items?.length && (
            <DocsSidebarNavItems items={category.items} onClick={onClick} />
          )}
        </div>
      ))}
    </div>
  );
}

export function DocsSidebar({ className }: DocsSidebarProps) {
  return (
    <aside className={cn('hidden md:block w-full h-full overflow-y-auto no-scrollbar', className)}>
      <DocsSidebarContent />
    </aside>
  );
}

interface DocsSidebarNavItemsProps {
  items: { title: string; href: string }[];
  onClick?: () => void;
}

function DocsSidebarNavItems({ items, onClick }: DocsSidebarNavItemsProps) {
  return (
    <div className="grid grid-flow-row auto-rows-max text-sm gap-0.5">
      {items.map((item, index) => (
        <DocsSidebarNavItem key={index} item={item} onClick={onClick} />
      ))}
    </div>
  );
}

function DocsSidebarNavItem({
  item,
  onClick,
}: {
  item: { title: string; href: string };
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || (item.href !== '/docs' && pathname?.startsWith(item.href));

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'relative flex w-full items-center rounded-md px-3 py-2.5 transition-all duration-200',
        'hover:bg-accent/50 hover:text-accent-foreground',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
        isActive ? 'font-medium text-foreground bg-accent/10' : 'text-muted-foreground'
      )}
    >
      {isActive && (
        <motion.div
          layoutId="active-nav-item"
          className="absolute inset-0 rounded-md bg-accent/40 border border-accent/60"
          initial={false}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10">{item.title}</span>
    </Link>
  );
}
