import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  ContextMenu,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

describe('ContextMenu', () => {
  it('renders context menu trigger', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right-click me</ContextMenuTrigger>
      </ContextMenu>
    );
    expect(screen.getByText('Right-click me')).toBeInTheDocument();
  });

  it('trigger has data-slot attribute', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Trigger</ContextMenuTrigger>
      </ContextMenu>
    );
    expect(document.querySelector('[data-slot="context-menu-trigger"]')).toBeInTheDocument();
  });

  it('trigger applies custom className', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger className="custom-trigger">Trigger</ContextMenuTrigger>
      </ContextMenu>
    );
    expect(document.querySelector('[data-slot="context-menu-trigger"]')).toHaveClass(
      'custom-trigger'
    );
  });

  it('trigger has select-none styling', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Trigger</ContextMenuTrigger>
      </ContextMenu>
    );
    expect(document.querySelector('[data-slot="context-menu-trigger"]')).toHaveClass('select-none');
  });
});

describe('ContextMenuSeparator', () => {
  it('renders separator', () => {
    render(<ContextMenuSeparator />);
    expect(document.querySelector('[data-slot="context-menu-separator"]')).toBeInTheDocument();
  });

  it('has border styling', () => {
    render(<ContextMenuSeparator />);
    expect(document.querySelector('[data-slot="context-menu-separator"]')).toHaveClass('bg-border');
  });

  it('applies custom className', () => {
    render(<ContextMenuSeparator className="custom-separator" />);
    expect(document.querySelector('[data-slot="context-menu-separator"]')).toHaveClass(
      'custom-separator'
    );
  });
});

describe('ContextMenuShortcut', () => {
  it('renders shortcut text', () => {
    render(<ContextMenuShortcut>⌘C</ContextMenuShortcut>);
    expect(screen.getByText('⌘C')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(<ContextMenuShortcut>⌘C</ContextMenuShortcut>);
    expect(document.querySelector('[data-slot="context-menu-shortcut"]')).toBeInTheDocument();
  });

  it('has muted foreground styling', () => {
    render(<ContextMenuShortcut>⌘C</ContextMenuShortcut>);
    expect(screen.getByText('⌘C')).toHaveClass('text-muted-foreground');
  });

  it('applies custom className', () => {
    render(<ContextMenuShortcut className="custom-shortcut">⌘C</ContextMenuShortcut>);
    expect(screen.getByText('⌘C')).toHaveClass('custom-shortcut');
  });
});

// Note: ContextMenuItem, ContextMenuLabel, ContextMenuGroup require
// complex context providers (ContextMenu > ContextMenuContent) that
// involve portals and positioning logic. These are better tested
// through integration tests or E2E tests where the full context
// hierarchy is established through actual user interactions.
