import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/lib/utils/index';

const sectionVariants = cva(
  'w-full mx-auto px-4 sm:px-6 lg:px-8', // Base: Consistent horizontal padding
  {
    variants: {
      width: {
        default: 'max-w-7xl', // Standard page width
        narrow: 'max-w-3xl', // Articles, legal pages
        wide: 'max-w-screen-2xl', // Galleries, large tables
        full: 'max-w-none p-0 sm:px-0 lg:px-0', // Full-bleed backgrounds (Hero)
      },
      spacing: {
        default: 'py-12 md:py-20', // Standard vertical rhythm
        compact: 'py-8 md:py-12', // Tighter sections
        relaxed: 'py-16 md:py-32', // Landing page airy sections
        none: 'py-0', // For when you need total control
      },
    },
    defaultVariants: {
      width: 'default',
      spacing: 'default',
    },
  }
);

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  as?: React.ElementType;
}

function Section({ className, width, spacing, as: Component = 'section', ...props }: SectionProps) {
  return <Component className={cn(sectionVariants({ width, spacing }), className)} {...props} />;
}

export { Section, sectionVariants };
