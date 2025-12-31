import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

describe('Sheet', () => {
  it('renders trigger with children', () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
      </Sheet>
    );
    expect(screen.getByText('Open Sheet')).toBeInTheDocument();
  });
});

describe('SheetTrigger', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Sheet>
        <SheetTrigger>Trigger</SheetTrigger>
      </Sheet>
    );
    expect(screen.getByText('Trigger')).toHaveAttribute('data-slot', 'sheet-trigger');
  });

  it('forwards props', () => {
    render(
      <Sheet>
        <SheetTrigger data-custom="value">Trigger</SheetTrigger>
      </Sheet>
    );
    expect(screen.getByText('Trigger')).toHaveAttribute('data-custom', 'value');
  });
});

describe('SheetClose', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Sheet>
        <SheetClose>Close</SheetClose>
      </Sheet>
    );
    expect(screen.getByText('Close')).toHaveAttribute('data-slot', 'sheet-close');
  });

  it('renders children', () => {
    render(
      <Sheet>
        <SheetClose>
          <span>X</span>
        </SheetClose>
      </Sheet>
    );
    expect(screen.getByText('X')).toBeInTheDocument();
  });
});

describe('SheetHeader', () => {
  it('renders with data-slot attribute', () => {
    render(<SheetHeader>Header content</SheetHeader>);
    expect(screen.getByText('Header content')).toHaveAttribute('data-slot', 'sheet-header');
  });

  it('applies default classes', () => {
    render(<SheetHeader>Header</SheetHeader>);
    expect(screen.getByText('Header')).toHaveClass('flex', 'flex-col', 'gap-1.5', 'p-4');
  });

  it('merges custom className', () => {
    render(<SheetHeader className="custom-class">Header</SheetHeader>);
    expect(screen.getByText('Header')).toHaveClass('custom-class');
  });
});

describe('SheetFooter', () => {
  it('renders with data-slot attribute', () => {
    render(<SheetFooter>Footer content</SheetFooter>);
    expect(screen.getByText('Footer content')).toHaveAttribute('data-slot', 'sheet-footer');
  });

  it('applies default classes', () => {
    render(<SheetFooter>Footer</SheetFooter>);
    expect(screen.getByText('Footer')).toHaveClass('flex', 'flex-col', 'gap-2', 'p-4', 'mt-auto');
  });

  it('merges custom className', () => {
    render(<SheetFooter className="custom-class">Footer</SheetFooter>);
    expect(screen.getByText('Footer')).toHaveClass('custom-class');
  });
});

describe('SheetTitle', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Sheet>
        <SheetTitle>Title</SheetTitle>
      </Sheet>
    );
    expect(screen.getByText('Title')).toHaveAttribute('data-slot', 'sheet-title');
  });

  it('applies font-medium class', () => {
    render(
      <Sheet>
        <SheetTitle>Title</SheetTitle>
      </Sheet>
    );
    expect(screen.getByText('Title')).toHaveClass('font-medium');
  });

  it('merges custom className', () => {
    render(
      <Sheet>
        <SheetTitle className="text-xl">Title</SheetTitle>
      </Sheet>
    );
    expect(screen.getByText('Title')).toHaveClass('text-xl');
  });
});

describe('SheetDescription', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Sheet>
        <SheetDescription>Description</SheetDescription>
      </Sheet>
    );
    expect(screen.getByText('Description')).toHaveAttribute('data-slot', 'sheet-description');
  });

  it('applies muted text class', () => {
    render(
      <Sheet>
        <SheetDescription>Description</SheetDescription>
      </Sheet>
    );
    expect(screen.getByText('Description')).toHaveClass('text-muted-foreground', 'text-sm');
  });

  it('merges custom className', () => {
    render(
      <Sheet>
        <SheetDescription className="italic">Description</SheetDescription>
      </Sheet>
    );
    expect(screen.getByText('Description')).toHaveClass('italic');
  });
});

describe('Sheet composition', () => {
  it('works as a composed component', () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Configure your preferences</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose>Close</SheetClose>
        </SheetFooter>
      </Sheet>
    );

    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Configure your preferences')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });
});
