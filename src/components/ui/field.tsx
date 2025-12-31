'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '@/lib/utils/index';
import { Label } from './label';
import { Separator } from './separator';

const fieldVariants = cva('grid gap-2 group/field', {
  variants: {
    orientation: {
      vertical: '',
      horizontal: 'grid-cols-[auto_1fr] items-center @2xl:grid-cols-[theme(spacing.52)_1fr]',
      responsive: 'grid-cols-1 @2xl:grid-cols-[theme(spacing.52)_1fr] @2xl:items-center',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

function Field({
  className,
  orientation,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  return (
    <div data-slot="field" className={cn(fieldVariants({ orientation }), className)} {...props} />
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="field-content" className={cn('flex flex-col gap-2', className)} {...props} />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

interface FieldErrorProps extends React.ComponentProps<'p'> {
  errors?: string[];
}

function FieldError({ className, children, errors, ...props }: FieldErrorProps) {
  if (errors?.length) {
    return (
      <div className="flex flex-col gap-1">
        {errors.map((error) => (
          <p
            key={error}
            data-slot="field-error"
            className={cn('text-destructive text-sm', className)}
            {...props}
          >
            {error}
          </p>
        ))}
      </div>
    );
  }

  return (
    <p data-slot="field-error" className={cn('text-destructive text-sm', className)} {...props}>
      {children}
    </p>
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="field-group" className={cn('grid gap-6', className)} {...props} />;
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label data-slot="field-label" className={className} {...props} />;
}

const fieldLegendVariants = cva('text-foreground font-medium leading-none', {
  variants: {
    variant: {
      default: 'text-base',
      description: 'text-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

function FieldLegend({
  variant,
  className,
  ...props
}: React.ComponentProps<'legend'> & VariantProps<typeof fieldLegendVariants>) {
  return (
    <legend
      data-slot="field-legend"
      className={cn(fieldLegendVariants({ variant }), className)}
      {...props}
    />
  );
}

function FieldSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="field-separator" className={cn('-mx-6', className)} {...props} />;
}

function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return <fieldset data-slot="field-set" className={cn('grid gap-6', className)} {...props} />;
}

function FieldTitle({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-title"
      className={cn('text-foreground text-sm font-medium', className)}
      {...props}
    />
  );
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
};
