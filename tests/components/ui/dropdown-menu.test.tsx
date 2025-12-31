import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

describe('DropdownMenu', () => {
  it('renders trigger with children', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      </DropdownMenu>
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
  });
});

describe('DropdownMenuTrigger', () => {
  it('renders with data-slot attribute', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
      </DropdownMenu>
    );
    expect(screen.getByText('Open Menu')).toHaveAttribute('data-slot', 'dropdown-menu-trigger');
  });

  it('renders children correctly', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Click to open</DropdownMenuTrigger>
      </DropdownMenu>
    );
    expect(screen.getByText('Click to open')).toBeInTheDocument();
  });

  it('forwards props', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-custom="test">Open</DropdownMenuTrigger>
      </DropdownMenu>
    );
    expect(screen.getByText('Open')).toHaveAttribute('data-custom', 'test');
  });
});

describe('DropdownMenuGroup', () => {
  it('renders with data-slot attribute', () => {
    render(
      <DropdownMenu>
        <DropdownMenuGroup data-testid="group">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenu>
    );
    expect(screen.getByTestId('group')).toHaveAttribute('data-slot', 'dropdown-menu-group');
  });

  it('renders children', () => {
    render(
      <DropdownMenu>
        <DropdownMenuGroup>
          <DropdownMenuItem>First</DropdownMenuItem>
          <DropdownMenuItem>Second</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenu>
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});

describe('DropdownMenuLabel', () => {
  it('renders with data-slot attribute', () => {
    render(
      <DropdownMenu>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Label</DropdownMenuLabel>
        </DropdownMenuGroup>
      </DropdownMenu>
    );
    expect(screen.getByText('Label')).toHaveAttribute('data-slot', 'dropdown-menu-label');
  });

  it('applies muted text classes', () => {
    render(
      <DropdownMenu>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
        </DropdownMenuGroup>
      </DropdownMenu>
    );
    expect(screen.getByText('Actions')).toHaveClass('text-muted-foreground');
  });

  it('applies inset styling when inset prop is true', () => {
    render(
      <DropdownMenu>
        <DropdownMenuGroup>
          <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
        </DropdownMenuGroup>
      </DropdownMenu>
    );
    expect(screen.getByText('Inset Label')).toHaveAttribute('data-inset', 'true');
  });

  it('merges custom className', () => {
    render(
      <DropdownMenu>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="custom-class">Label</DropdownMenuLabel>
        </DropdownMenuGroup>
      </DropdownMenu>
    );
    expect(screen.getByText('Label')).toHaveClass('custom-class');
  });
});

describe('DropdownMenuItem', () => {
  it('renders with data-slot attribute', () => {
    render(
      <DropdownMenu>
        <DropdownMenuItem>Item</DropdownMenuItem>
      </DropdownMenu>
    );
    expect(screen.getByText('Item')).toHaveAttribute('data-slot', 'dropdown-menu-item');
  });

  it('applies inset styling when inset prop is true', () => {
    render(
      <DropdownMenu>
        <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
      </DropdownMenu>
    );
    expect(screen.getByText('Inset Item')).toHaveAttribute('data-inset', 'true');
  });

  it('applies destructive variant', () => {
    render(
      <DropdownMenu>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenu>
    );
    expect(screen.getByText('Delete')).toHaveAttribute('data-variant', 'destructive');
  });

  it('applies default variant', () => {
    render(
      <DropdownMenu>
        <DropdownMenuItem>Default Item</DropdownMenuItem>
      </DropdownMenu>
    );
    expect(screen.getByText('Default Item')).toHaveAttribute('data-variant', 'default');
  });

  it('merges custom className', () => {
    render(
      <DropdownMenu>
        <DropdownMenuItem className="my-class">Item</DropdownMenuItem>
      </DropdownMenu>
    );
    expect(screen.getByText('Item')).toHaveClass('my-class');
  });
});

describe('DropdownMenuSeparator', () => {
  it('renders with data-slot attribute', () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuSeparator />
      </DropdownMenu>
    );
    expect(container.querySelector('[data-slot="dropdown-menu-separator"]')).toBeInTheDocument();
  });

  it('applies separator styling', () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuSeparator />
      </DropdownMenu>
    );
    const separator = container.querySelector('[data-slot="dropdown-menu-separator"]');
    expect(separator).toHaveClass('bg-border', 'h-px');
  });

  it('merges custom className', () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuSeparator className="my-separator" />
      </DropdownMenu>
    );
    const separator = container.querySelector('[data-slot="dropdown-menu-separator"]');
    expect(separator).toHaveClass('my-separator');
  });
});

describe('DropdownMenuShortcut', () => {
  it('renders with data-slot attribute', () => {
    render(<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>);
    expect(screen.getByText('⌘K')).toHaveAttribute('data-slot', 'dropdown-menu-shortcut');
  });

  it('applies muted text and tracking classes', () => {
    render(<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>);
    expect(screen.getByText('⌘S')).toHaveClass('text-muted-foreground', 'tracking-widest');
  });

  it('merges custom className', () => {
    render(<DropdownMenuShortcut className="custom">⌘C</DropdownMenuShortcut>);
    expect(screen.getByText('⌘C')).toHaveClass('custom');
  });
});

describe('DropdownMenuRadioGroup', () => {
  it('renders with data-slot attribute', () => {
    render(
      <DropdownMenu>
        <DropdownMenuRadioGroup data-testid="radio-group" />
      </DropdownMenu>
    );
    expect(screen.getByTestId('radio-group')).toHaveAttribute(
      'data-slot',
      'dropdown-menu-radio-group'
    );
  });
});

describe('Dropdown menu composition', () => {
  it('works as a composed component', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Edit</DropdownMenuLabel>
          <DropdownMenuItem>
            Copy
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenu>
    );

    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('⌘C')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
