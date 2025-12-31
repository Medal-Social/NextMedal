import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';

/**
 * Command component tests
 *
 * Focus on BEHAVIOR, not CSS implementation:
 * - Rendering children correctly
 * - Data-slot attributes (stable API contract)
 * - User interactions (typing, selecting)
 * - Prop forwarding (className)
 * - Accessibility
 */

describe('Command', () => {
  it('renders command container with children', () => {
    render(<Command aria-label="Test command">Content</Command>);
    expect(document.querySelector('[data-slot="command"]')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Command className="custom-class" aria-label="Test">
        Content
      </Command>
    );
    expect(document.querySelector('[data-slot="command"]')).toHaveClass('custom-class');
  });
});

describe('CommandInput', () => {
  it('renders input with placeholder', () => {
    render(
      <Command aria-label="Test">
        <CommandInput placeholder="Search..." />
      </Command>
    );
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('has data-slot attributes', () => {
    render(
      <Command aria-label="Test">
        <CommandInput />
      </Command>
    );
    expect(document.querySelector('[data-slot="command-input"]')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="command-input-wrapper"]')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Command aria-label="Test">
        <CommandInput className="custom-input" />
      </Command>
    );
    expect(document.querySelector('[data-slot="command-input"]')).toHaveClass('custom-input');
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    render(
      <Command aria-label="Test">
        <CommandInput placeholder="Type here" />
      </Command>
    );

    const input = screen.getByPlaceholderText('Type here');
    await user.type(input, 'test query');
    expect(input).toHaveValue('test query');
  });
});

describe('CommandList', () => {
  it('renders list container with children', () => {
    render(
      <Command aria-label="Test">
        <CommandList>
          <div>Item 1</div>
        </CommandList>
      </Command>
    );
    expect(document.querySelector('[data-slot="command-list"]')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Command aria-label="Test">
        <CommandList className="custom-list">Items</CommandList>
      </Command>
    );
    expect(document.querySelector('[data-slot="command-list"]')).toHaveClass('custom-list');
  });
});

describe('CommandEmpty', () => {
  it('renders empty message', () => {
    render(
      <Command aria-label="Test">
        <CommandEmpty>No results found</CommandEmpty>
      </Command>
    );
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(
      <Command aria-label="Test">
        <CommandEmpty>Empty</CommandEmpty>
      </Command>
    );
    expect(document.querySelector('[data-slot="command-empty"]')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Command aria-label="Test">
        <CommandEmpty className="custom-empty">Empty</CommandEmpty>
      </Command>
    );
    expect(document.querySelector('[data-slot="command-empty"]')).toHaveClass('custom-empty');
  });
});

describe('CommandGroup', () => {
  it('renders group with children', () => {
    render(
      <Command aria-label="Test">
        <CommandGroup heading="Actions">
          <CommandItem>Action 1</CommandItem>
        </CommandGroup>
      </Command>
    );
    expect(document.querySelector('[data-slot="command-group"]')).toBeInTheDocument();
    expect(screen.getByText('Action 1')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Command aria-label="Test">
        <CommandGroup className="custom-group">
          <CommandItem>Content</CommandItem>
        </CommandGroup>
      </Command>
    );
    expect(document.querySelector('[data-slot="command-group"]')).toHaveClass('custom-group');
  });
});

describe('CommandItem', () => {
  it('renders item content', () => {
    render(
      <Command aria-label="Test">
        <CommandItem>Settings</CommandItem>
      </Command>
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(
      <Command aria-label="Test">
        <CommandItem>Item</CommandItem>
      </Command>
    );
    expect(document.querySelector('[data-slot="command-item"]')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Command aria-label="Test">
        <CommandItem className="custom-item">Item</CommandItem>
      </Command>
    );
    expect(document.querySelector('[data-slot="command-item"]')).toHaveClass('custom-item');
  });

  it('handles selection callback on click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Command aria-label="Test">
        <CommandItem onSelect={onSelect}>Click me</CommandItem>
      </Command>
    );

    await user.click(screen.getByText('Click me'));
    expect(onSelect).toHaveBeenCalled();
  });
});

describe('CommandSeparator', () => {
  it('renders separator', () => {
    render(
      <Command aria-label="Test">
        <CommandSeparator />
      </Command>
    );
    expect(document.querySelector('[data-slot="command-separator"]')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Command aria-label="Test">
        <CommandSeparator className="custom-separator" />
      </Command>
    );
    expect(document.querySelector('[data-slot="command-separator"]')).toHaveClass(
      'custom-separator'
    );
  });
});

describe('CommandShortcut', () => {
  it('renders shortcut text', () => {
    render(<CommandShortcut>Ctrl+K</CommandShortcut>);
    expect(screen.getByText('Ctrl+K')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(<CommandShortcut>Ctrl+K</CommandShortcut>);
    expect(document.querySelector('[data-slot="command-shortcut"]')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CommandShortcut className="custom-shortcut">Ctrl+K</CommandShortcut>);
    expect(screen.getByText('Ctrl+K')).toHaveClass('custom-shortcut');
  });
});

describe('Command composition', () => {
  it('renders complete command palette', () => {
    render(
      <Command aria-label="Command palette">
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              Calendar
              <CommandShortcut>Ctrl+C</CommandShortcut>
            </CommandItem>
            <CommandItem>Search</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>Profile</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+C')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});
