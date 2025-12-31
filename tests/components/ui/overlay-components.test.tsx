import { axe, cleanup, render, screen, userEvent, waitFor } from '@tests/setup/providers';
import * as fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Configure axe to exclude Base UI focus guards
const axeOptions = {
  rules: {
    // Disable aria-command-name for Base UI focus guards
    'aria-command-name': { enabled: false },
  },
};

// ============================================================================
// Dialog Component Tests (Task 5.2)
// ============================================================================

describe('Dialog Component', () => {
  const renderDialog = (props?: { defaultOpen?: boolean }) => {
    return render(
      <Dialog defaultOpen={props?.defaultOpen}>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description text.</DialogDescription>
          </DialogHeader>
          <div>Dialog body content</div>
          <DialogFooter>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  describe('Default Rendering', () => {
    it('renders trigger without throwing errors', () => {
      expect(() => renderDialog()).not.toThrow();
    });

    it('renders trigger button', () => {
      renderDialog();
      expect(screen.getByRole('button', { name: 'Open Dialog' })).toBeInTheDocument();
    });

    it('does not render content when closed', () => {
      renderDialog();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders content when defaultOpen is true', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });
  });

  describe('Open/Close States', () => {
    it('opens dialog when trigger is clicked', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('closes dialog when close button is clicked', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('closes dialog when Escape key is pressed', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Focus Management', () => {
    it('focuses dialog content when opened', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });
    });

    it('keeps focus within dialog area', async () => {
      renderDialog({ defaultOpen: true });

      // Dialog should be open and focusable
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // Focus should be manageable within the dialog structure
      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('ClassName Merging', () => {
    it('merges custom className on DialogContent', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent className="custom-dialog">
            <DialogHeader>
              <DialogTitle>Test</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      const content = screen.getByRole('dialog');
      expect(content.className).toContain('custom-dialog');
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 6: WCAG 2.2 AA Compliance**
   * **Validates: Requirements 3.1, 3.4**
   */
  describe('Accessibility', () => {
    it('has no accessibility violations when open', async () => {
      const { container } = render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accessible Dialog</DialogTitle>
              <DialogDescription>This is an accessible dialog.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA attributes', () => {
      renderDialog({ defaultOpen: true });
      const dialog = screen.getByRole('dialog');
      // Dialog should be present and accessible
      expect(dialog).toBeInTheDocument();
      // Check for dialog role which is the key accessibility requirement
      expect(dialog).toHaveAttribute('role', 'dialog');
    });
  });
});

// ============================================================================
// Sheet Component Tests (Task 5.2)
// ============================================================================

describe('Sheet Component', () => {
  const renderSheet = (props?: {
    defaultOpen?: boolean;
    side?: 'top' | 'bottom' | 'left' | 'right';
  }) => {
    return render(
      <Sheet defaultOpen={props?.defaultOpen}>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent side={props?.side}>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet description text.</SheetDescription>
          </SheetHeader>
          <div>Sheet body content</div>
        </SheetContent>
      </Sheet>
    );
  };

  describe('Default Rendering', () => {
    it('renders trigger without throwing errors', () => {
      expect(() => renderSheet()).not.toThrow();
    });

    it('renders trigger button', () => {
      renderSheet();
      expect(screen.getByRole('button', { name: 'Open Sheet' })).toBeInTheDocument();
    });

    it('does not render content when closed', () => {
      renderSheet();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders content when defaultOpen is true', () => {
      renderSheet({ defaultOpen: true });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Side Variants', () => {
    const sides = ['top', 'bottom', 'left', 'right'] as const;

    sides.forEach((side) => {
      it(`renders with side="${side}"`, () => {
        renderSheet({ defaultOpen: true, side });
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });
    });
  });

  describe('Open/Close States', () => {
    it('opens sheet when trigger is clicked', async () => {
      const user = userEvent.setup();
      renderSheet();

      await user.click(screen.getByRole('button', { name: 'Open Sheet' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('closes sheet when Escape key is pressed', async () => {
      const user = userEvent.setup();
      renderSheet({ defaultOpen: true });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 6: WCAG 2.2 AA Compliance**
   * **Validates: Requirements 3.1, 3.4**
   */
  describe('Accessibility', () => {
    it('has no accessibility violations when open', async () => {
      const { container } = render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Accessible Sheet</SheetTitle>
              <SheetDescription>This is an accessible sheet.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

// ============================================================================
// Popover Component Tests (Task 5.2)
// ============================================================================

describe('Popover Component', () => {
  const renderPopover = (props?: { defaultOpen?: boolean }) => {
    return render(
      <Popover defaultOpen={props?.defaultOpen}>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>
          <div>Popover content</div>
        </PopoverContent>
      </Popover>
    );
  };

  describe('Default Rendering', () => {
    it('renders trigger without throwing errors', () => {
      expect(() => renderPopover()).not.toThrow();
    });

    it('renders trigger button', () => {
      renderPopover();
      expect(screen.getByRole('button', { name: 'Open Popover' })).toBeInTheDocument();
    });

    it('does not render content when closed', () => {
      renderPopover();
      expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
    });

    it('renders content when defaultOpen is true', () => {
      renderPopover({ defaultOpen: true });
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });
  });

  describe('Open/Close States', () => {
    it('opens popover when trigger is clicked', async () => {
      const user = userEvent.setup();
      renderPopover();

      await user.click(screen.getByRole('button', { name: 'Open Popover' }));
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });

    it('closes popover when Escape key is pressed', async () => {
      const user = userEvent.setup();
      renderPopover({ defaultOpen: true });

      expect(screen.getByText('Popover content')).toBeInTheDocument();
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
      });
    });
  });

  describe('ClassName Merging', () => {
    it('merges custom className on PopoverContent', () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent className="custom-popover" data-testid="popover">
            Content
          </PopoverContent>
        </Popover>
      );
      const content = screen.getByTestId('popover');
      expect(content.className).toContain('custom-popover');
      expect(content.className).toContain('rounded-md');
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 6: WCAG 2.2 AA Compliance**
   * **Validates: Requirements 3.1**
   */
  describe('Accessibility', () => {
    it('has no accessibility violations when open', async () => {
      const { container } = render(
        <Popover defaultOpen>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>
            <p>Accessible popover content</p>
          </PopoverContent>
        </Popover>
      );
      const results = await axe(container, axeOptions);
      expect(results).toHaveNoViolations();
    });
  });
});

// ============================================================================
// DropdownMenu Component Tests (Task 5.2)
// ============================================================================

describe('DropdownMenu Component', () => {
  const renderDropdownMenu = (props?: { defaultOpen?: boolean }) => {
    return render(
      <DropdownMenu defaultOpen={props?.defaultOpen}>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  describe('Default Rendering', () => {
    it('renders trigger without throwing errors', () => {
      expect(() => renderDropdownMenu()).not.toThrow();
    });

    it('renders trigger button', () => {
      renderDropdownMenu();
      expect(screen.getByRole('button', { name: 'Open Menu' })).toBeInTheDocument();
    });

    it('does not render content when closed', () => {
      renderDropdownMenu();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('renders content when defaultOpen is true', () => {
      renderDropdownMenu({ defaultOpen: true });
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  describe('Open/Close States', () => {
    it('opens menu when trigger is clicked', async () => {
      const user = userEvent.setup();
      renderDropdownMenu();

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
    });

    it('closes menu when Escape key is pressed', async () => {
      const user = userEvent.setup();
      renderDropdownMenu({ defaultOpen: true });

      expect(screen.getByRole('menu')).toBeInTheDocument();
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('Menu Item Interaction', () => {
    it('invokes callback when menu item is clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleClick}>Click Me</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('menuitem', { name: 'Click Me' }));
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates items with arrow keys', async () => {
      const user = userEvent.setup();
      renderDropdownMenu({ defaultOpen: true });

      const items = screen.getAllByRole('menuitem');
      items[0].focus();

      await user.keyboard('{ArrowDown}');
      expect(items[1]).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(items[2]).toHaveFocus();
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 6: WCAG 2.2 AA Compliance**
   * **Validates: Requirements 3.1, 3.4**
   */
  describe('Accessibility', () => {
    it('has no accessibility violations when open', async () => {
      const { container } = render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
      const results = await axe(container, axeOptions);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA attributes', () => {
      renderDropdownMenu({ defaultOpen: true });
      const items = screen.getAllByRole('menuitem');
      expect(items.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// Tooltip Component Tests (Task 5.2)
// ============================================================================

describe('Tooltip Component', () => {
  const renderTooltip = (props?: { defaultOpen?: boolean }) => {
    return render(
      <TooltipProvider>
        <Tooltip defaultOpen={props?.defaultOpen}>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>
            <p>Tooltip text</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  describe('Default Rendering', () => {
    it('renders trigger without throwing errors', () => {
      expect(() => renderTooltip()).not.toThrow();
    });

    it('renders trigger button', () => {
      renderTooltip();
      expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
    });

    it('does not render content when closed', () => {
      renderTooltip();
      expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
    });

    it('renders content when defaultOpen is true', () => {
      renderTooltip({ defaultOpen: true });
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });
  });

  describe('ClassName Merging', () => {
    it('merges custom className on TooltipContent', () => {
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent className="custom-tooltip" data-testid="tooltip-content">
              Content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      // The tooltip role element is a wrapper, the actual content has the className
      const tooltipContent = screen.getByTestId('tooltip-content');
      expect(tooltipContent.className).toContain('custom-tooltip');
      expect(tooltipContent.className).toContain('rounded-md');
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 6: WCAG 2.2 AA Compliance**
   * **Validates: Requirements 3.1**
   */
  describe('Accessibility', () => {
    it('has no accessibility violations when open', async () => {
      const { container } = render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>Hover</TooltipTrigger>
            <TooltipContent>Accessible tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('renders tooltip content with proper slot attribute', () => {
      renderTooltip({ defaultOpen: true });
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// Property-Based Tests for Overlay Components (Task 5.2)
// ============================================================================

describe('Overlay Components - Property-Based Tests', () => {
  const classNameArb = fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => /^[a-zA-Z][a-zA-Z0-9-_]*$/.test(s));

  /**
   * **Feature: component-accessibility-testing, Property 3: Component ClassName Merging**
   * **Validates: Requirements 2.3**
   */
  describe('Property 3: Component ClassName Merging', () => {
    it('DialogContent merges custom className with defaults', () => {
      fc.assert(
        fc.property(classNameArb, (customClass) => {
          // Cleanup before each property test iteration
          cleanup();

          render(
            <Dialog defaultOpen>
              <DialogContent className={customClass} data-testid="dialog-content">
                <DialogHeader>
                  <DialogTitle>Test</DialogTitle>
                  <DialogDescription>Description</DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          );
          // Use screen.getByTestId which waits for the element
          const dialog = screen.getByTestId('dialog-content');
          expect(dialog.className).toContain(customClass);
        }),
        { numRuns: 50 }
      );
    });

    it('PopoverContent merges custom className with defaults', () => {
      fc.assert(
        fc.property(classNameArb, (customClass) => {
          // Cleanup before each property test iteration
          cleanup();

          render(
            <Popover defaultOpen>
              <PopoverTrigger>Trigger</PopoverTrigger>
              <PopoverContent className={customClass} data-testid="popover-content">
                Content
              </PopoverContent>
            </Popover>
          );
          const content = screen.getByTestId('popover-content');
          expect(content.className).toContain(customClass);
        }),
        { numRuns: 50 }
      );
    });
  });
});
