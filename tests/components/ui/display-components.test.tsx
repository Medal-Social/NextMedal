import { axe, cleanup, render, screen, userEvent } from '@tests/setup/providers';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ============================================================================
// Card Component Tests (Task 5.4)
// ============================================================================

describe('Card Component', () => {
  const renderCard = () => {
    return render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description text</CardDescription>
        </CardHeader>
        <CardContent>Card content goes here</CardContent>
        <CardFooter>Card footer</CardFooter>
      </Card>
    );
  };

  describe('Default Rendering', () => {
    it('renders without throwing errors', () => {
      expect(() => renderCard()).not.toThrow();
    });

    it('renders all card sections', () => {
      renderCard();
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card description text')).toBeInTheDocument();
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
      expect(screen.getByText('Card footer')).toBeInTheDocument();
    });
  });

  describe('ClassName Merging', () => {
    it('merges custom className on Card', () => {
      render(
        <Card className="custom-card" data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card.className).toContain('custom-card');
      expect(card.className).toContain('rounded-xl');
      expect(card.className).toContain('border');
    });

    it('merges custom className on CardHeader', () => {
      render(
        <Card>
          <CardHeader className="custom-header" data-testid="header">
            Header
          </CardHeader>
        </Card>
      );
      const header = screen.getByTestId('header');
      expect(header.className).toContain('custom-header');
      expect(header.className).toContain('flex');
    });

    it('merges custom className on CardContent', () => {
      render(
        <Card>
          <CardContent className="custom-content" data-testid="content">
            Content
          </CardContent>
        </Card>
      );
      const content = screen.getByTestId('content');
      expect(content.className).toContain('custom-content');
      expect(content.className).toContain('p-6');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to Card element', () => {
      const ref = { current: null as HTMLDivElement | null };
      render(<Card ref={ref}>Content</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 6: WCAG 2.2 AA Compliance**
   * **Validates: Requirements 3.1**
   */
  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = renderCard();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

// ============================================================================
// Badge Component Tests (Task 5.4)
// ============================================================================

describe('Badge Component', () => {
  describe('Default Rendering', () => {
    it('renders without throwing errors', () => {
      expect(() => render(<Badge>Badge</Badge>)).not.toThrow();
    });

    it('renders children correctly', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });
  });

  describe('Variant Styling', () => {
    it('applies default variant styles', () => {
      render(<Badge data-testid="badge">Default</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('bg-primary');
    });

    it('applies secondary variant styles', () => {
      render(
        <Badge variant="secondary" data-testid="badge">
          Secondary
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('bg-secondary');
    });

    it('applies destructive variant styles', () => {
      render(
        <Badge variant="destructive" data-testid="badge">
          Destructive
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('bg-destructive');
    });

    it('applies outline variant styles', () => {
      render(
        <Badge variant="outline" data-testid="badge">
          Outline
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('text-foreground');
    });
  });

  describe('ClassName Merging', () => {
    it('merges custom className with default classes', () => {
      render(
        <Badge className="custom-badge" data-testid="badge">
          Custom
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('custom-badge');
      expect(badge.className).toContain('inline-flex');
      expect(badge.className).toContain('rounded-4xl');
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 6: WCAG 2.2 AA Compliance**
   * **Validates: Requirements 3.1**
   */
  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Badge>Accessible Badge</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations for all variants', async () => {
      const variants = ['default', 'secondary', 'destructive', 'outline'] as const;

      for (const variant of variants) {
        const { container } = render(<Badge variant={variant}>{variant} Badge</Badge>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });
});

// ============================================================================
// Skeleton Component Tests (Task 5.4)
// ============================================================================

describe('Skeleton Component', () => {
  describe('Default Rendering', () => {
    it('renders without throwing errors', () => {
      expect(() => render(<Skeleton />)).not.toThrow();
    });

    it('renders as a div element', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton.tagName).toBe('DIV');
    });

    it('has animation class', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton.className).toContain('animate-pulse');
    });
  });

  describe('ClassName Merging', () => {
    it('merges custom className with default classes', () => {
      render(<Skeleton className="h-4 w-full" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton.className).toContain('h-4');
      expect(skeleton.className).toContain('w-full');
      expect(skeleton.className).toContain('animate-pulse');
      expect(skeleton.className).toContain('rounded-md');
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 6: WCAG 2.2 AA Compliance**
   * **Validates: Requirements 3.1**
   */
  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Skeleton />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

// ============================================================================
// Separator Component Tests (Task 5.4)
// ============================================================================

describe('Separator Component', () => {
  describe('Default Rendering', () => {
    it('renders without throwing errors', () => {
      expect(() => render(<Separator />)).not.toThrow();
    });

    it('renders horizontal by default', () => {
      render(<Separator data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator.className).toContain('data-[orientation=horizontal]:h-px');
      expect(separator.className).toContain('data-[orientation=horizontal]:w-full');
    });
  });

  describe('Orientation', () => {
    it('renders vertical when orientation is vertical', () => {
      render(<Separator orientation="vertical" data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator.className).toContain('data-[orientation=vertical]:self-stretch');
      expect(separator.className).toContain('data-[orientation=vertical]:w-px');
    });
  });

  describe('ClassName Merging', () => {
    it('merges custom className with default classes', () => {
      render(<Separator className="my-4" data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator.className).toContain('my-4');
      expect(separator.className).toContain('bg-border');
    });
  });

  describe('Decorative', () => {
    it('is decorative by default', () => {
      render(<Separator data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 6: WCAG 2.2 AA Compliance**
   * **Validates: Requirements 3.1**
   */
  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Separator />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has separator role', async () => {
      const { container } = render(<Separator />);
      expect(screen.getByRole('separator')).toBeInTheDocument();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

// ============================================================================
// AspectRatio Component Tests (Task 5.4)
// ============================================================================

describe('AspectRatio Component', () => {
  describe('Default Rendering', () => {
    it('renders without throwing errors', () => {
      expect(() =>
        render(
          <AspectRatio ratio={16 / 9}>
            <div>Content</div>
          </AspectRatio>
        )
      ).not.toThrow();
    });

    it('renders children', () => {
      render(
        <AspectRatio ratio={16 / 9}>
          <div>Aspect Content</div>
        </AspectRatio>
      );
      expect(screen.getByText('Aspect Content')).toBeInTheDocument();
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 6: WCAG 2.2 AA Compliance**
   * **Validates: Requirements 3.1**
   */
  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <AspectRatio ratio={16 / 9}>
          {/* Using div instead of img to avoid lint warnings in tests */}
          <div role="img" aria-label="Sample content" />
        </AspectRatio>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

// ============================================================================
// Table Component Tests (Task 5.4)
// ============================================================================

describe('Table Component', () => {
  const renderTable = () => {
    return render(
      <Table>
        <TableCaption>A list of items</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Item 1</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Item 2</TableCell>
            <TableCell>Inactive</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  };

  describe('Default Rendering', () => {
    it('renders without throwing errors', () => {
      expect(() => renderTable()).not.toThrow();
    });

    it('renders table structure', () => {
      renderTable();
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('A list of items')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('renders correct number of rows', () => {
      renderTable();
      const rows = screen.getAllByRole('row');
      // 1 header row + 2 body rows = 3 total
      expect(rows.length).toBe(3);
    });
  });

  describe('ClassName Merging', () => {
    it('merges custom className on Table', () => {
      render(
        <Table className="custom-table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByRole('table');
      expect(table.className).toContain('custom-table');
      expect(table.className).toContain('w-full');
    });

    it('merges custom className on TableRow', () => {
      render(
        <Table>
          <TableBody>
            <TableRow className="custom-row" data-testid="row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const row = screen.getByTestId('row');
      expect(row.className).toContain('custom-row');
      expect(row.className).toContain('border-b');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to Table element', () => {
      const ref = { current: null as HTMLTableElement | null };
      render(
        <Table ref={ref}>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(ref.current).toBeInstanceOf(HTMLTableElement);
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 6: WCAG 2.2 AA Compliance**
   * **Validates: Requirements 3.1**
   */
  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = renderTable();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper table semantics', () => {
      renderTable();
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader').length).toBe(2);
      expect(screen.getAllByRole('cell').length).toBe(4);
    });
  });
});

// ============================================================================
// Collapsible Component Tests (Task 5.4)
// ============================================================================

describe('Collapsible Component', () => {
  const renderCollapsible = (props?: { defaultOpen?: boolean }) => {
    return render(
      <Collapsible defaultOpen={props?.defaultOpen}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Collapsible content</CollapsibleContent>
      </Collapsible>
    );
  };

  describe('Default Rendering', () => {
    it('renders without throwing errors', () => {
      expect(() => renderCollapsible()).not.toThrow();
    });

    it('renders trigger', () => {
      renderCollapsible();
      expect(screen.getByText('Toggle')).toBeInTheDocument();
    });

    it('content is hidden by default', () => {
      renderCollapsible();
      expect(screen.queryByText('Collapsible content')).not.toBeInTheDocument();
    });

    it('content is visible when defaultOpen is true', () => {
      renderCollapsible({ defaultOpen: true });
      expect(screen.getByText('Collapsible content')).toBeInTheDocument();
    });
  });

  describe('Open/Close States', () => {
    it('opens when trigger is clicked', async () => {
      const user = userEvent.setup();
      renderCollapsible();

      await user.click(screen.getByText('Toggle'));
      expect(screen.getByText('Collapsible content')).toBeInTheDocument();
    });

    it('closes when trigger is clicked again', async () => {
      const user = userEvent.setup();
      renderCollapsible({ defaultOpen: true });

      expect(screen.getByText('Collapsible content')).toBeInTheDocument();
      await user.click(screen.getByText('Toggle'));
      expect(screen.queryByText('Collapsible content')).not.toBeInTheDocument();
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 6: WCAG 2.2 AA Compliance**
   * **Validates: Requirements 3.1**
   */
  describe('Accessibility', () => {
    it('has no accessibility violations when closed', async () => {
      const { container } = renderCollapsible();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when open', async () => {
      const { container } = renderCollapsible({ defaultOpen: true });
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

// ============================================================================
// Property-Based Tests for Display Components (Task 5.4)
// ============================================================================

describe('Display Components - Property-Based Tests', () => {
  const classNameArb = fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => /^[a-zA-Z][a-zA-Z0-9-_]*$/.test(s));

  const badgeVariants = ['default', 'secondary', 'destructive', 'outline'] as const;
  const variantArb = fc.constantFrom(...badgeVariants);

  /**
   * **Feature: component-accessibility-testing, Property 2: Component Variant Styling**
   * **Validates: Requirements 2.2**
   */
  describe('Property 2: Component Variant Styling', () => {
    it('Badge applies correct styles for any valid variant', () => {
      const variantClassMap: Record<(typeof badgeVariants)[number], string[]> = {
        default: ['bg-primary'],
        secondary: ['bg-secondary'],
        destructive: ['bg-destructive'],
        outline: ['text-foreground'],
      };

      fc.assert(
        fc.property(variantArb, (variant) => {
          cleanup();
          render(
            <Badge variant={variant} data-testid="badge">
              Test
            </Badge>
          );
          const badge = screen.getByTestId('badge');
          const expectedClasses = variantClassMap[variant];
          const hasExpectedClass = expectedClasses.some((cls) => badge.className.includes(cls));
          expect(hasExpectedClass).toBe(true);
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 3: Component ClassName Merging**
   * **Validates: Requirements 2.3**
   */
  describe('Property 3: Component ClassName Merging', () => {
    it('Card merges custom className with defaults', () => {
      fc.assert(
        fc.property(classNameArb, (customClass) => {
          cleanup();
          render(
            <Card className={customClass} data-testid="card">
              Content
            </Card>
          );
          const card = screen.getByTestId('card');
          expect(card.className).toContain(customClass);
          expect(card.className).toContain('border');
        }),
        { numRuns: 50 }
      );
    });

    it('Badge merges custom className with defaults', () => {
      fc.assert(
        fc.property(classNameArb, (customClass) => {
          cleanup();
          render(
            <Badge className={customClass} data-testid="badge">
              Badge
            </Badge>
          );
          const badge = screen.getByTestId('badge');
          expect(badge.className).toContain(customClass);
          expect(badge.className).toContain('items-center');
        }),
        { numRuns: 50 }
      );
    });

    it('Skeleton merges custom className with defaults', () => {
      fc.assert(
        fc.property(classNameArb, (customClass) => {
          cleanup();
          render(<Skeleton className={customClass} data-testid="skeleton" />);
          const skeleton = screen.getByTestId('skeleton');
          expect(skeleton.className).toContain(customClass);
          expect(skeleton.className).toContain('animate-pulse');
        }),
        { numRuns: 50 }
      );
    });

    it('Separator merges custom className with defaults', () => {
      fc.assert(
        fc.property(classNameArb, (customClass) => {
          cleanup();
          render(<Separator className={customClass} data-testid="separator" />);
          const separator = screen.getByTestId('separator');
          expect(separator.className).toContain(customClass);
          expect(separator.className).toContain('bg-border');
        }),
        { numRuns: 50 }
      );
    });
  });
});
