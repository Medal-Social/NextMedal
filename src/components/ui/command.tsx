'use client';

import { Combobox } from '@base-ui/react';
import { CheckIcon, SearchIcon } from 'lucide-react';
import type * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

function Command({
  className,
  children,
  ...props
}: Combobox.Root.Props<unknown> & { className?: string }) {
  return (
    <Combobox.Root {...props}>
      <div
        data-slot="command"
        className={cn(
          'bg-popover text-popover-foreground rounded-xl! p-1 flex size-full flex-col overflow-hidden',
          className
        )}
      >
        {children}
      </div>
    </Combobox.Root>
  );
}

function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  className,
  showCloseButton = false,
  open,
  onOpenChange,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, 'children'> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn('rounded-xl! overflow-hidden p-0', className)}
        showCloseButton={showCloseButton}
      >
        <Command className="[&_[data-slot=command-input-wrapper]]:h-12">{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({ className, ...props }: Combobox.Input.Props) {
  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <InputGroup className="bg-input/30 border-input/30 h-8! rounded-lg! shadow-none! *:data-[slot=input-group-addon]:pl-2!">
        <Combobox.Input
          data-slot="command-input"
          render={<InputGroupInput />}
          className={cn(
            'w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />
        <InputGroupAddon>
          <SearchIcon className="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

function CommandList({ className, ...props }: Combobox.List.Props) {
  return (
    <Combobox.List
      data-slot="command-list"
      className={cn(
        'no-scrollbar max-h-72 scroll-py-1 outline-none overflow-x-hidden overflow-y-auto',
        className
      )}
      {...props}
    />
  );
}

function CommandEmpty({ className, ...props }: Combobox.Empty.Props) {
  return (
    <Combobox.Empty
      data-slot="command-empty"
      className={cn('py-6 text-center text-sm', className)}
      {...props}
    />
  );
}

function CommandGroup({
  className,
  heading,
  ...props
}: Combobox.Group.Props & { heading?: React.ReactNode }) {
  return (
    <Combobox.Group
      data-slot="command-group"
      className={cn(
        'text-foreground [&_[data-slot=command-group-label]]:text-muted-foreground overflow-hidden p-1 [&_[data-slot=command-group-label]]:px-2 [&_[data-slot=command-group-label]]:py-1.5 [&_[data-slot=command-group-label]]:text-xs [&_[data-slot=command-group-label]]:font-medium',
        className
      )}
      {...props}
    >
      {heading && (
        <Combobox.GroupLabel data-slot="command-group-label">{heading}</Combobox.GroupLabel>
      )}
      {props.children}
    </Combobox.Group>
  );
}

function CommandSeparator({ className, ...props }: Combobox.Separator.Props) {
  return (
    <Combobox.Separator
      data-slot="command-separator"
      className={cn('bg-border -mx-1 h-px w-auto', className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  children,
  keywords,
  onSelect,
  ...props
}: Combobox.Item.Props & { keywords?: string[]; onSelect?: (value: string) => void }) {
  return (
    <Combobox.Item
      data-slot="command-item"
      className={cn(
        "data-highlighted:bg-muted data-highlighted:text-foreground data-highlighted:**:[svg]:text-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none [&_svg:not([class*='size-'])]:size-4 [[data-slot=dialog-content]_&]:rounded-lg! group/command-item data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
      onSelect={onSelect as any}
    >
      {children}
      <CheckIcon className="ml-auto opacity-0 group-has-[[data-slot=command-shortcut]]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
    </Combobox.Item>
  );
}

function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        'text-muted-foreground group-data-highlighted/command-item:text-foreground ml-auto text-xs tracking-widest',
        className
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
