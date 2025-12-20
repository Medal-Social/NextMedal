import * as fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/ui/button';
import { axe, render, screen, userEvent } from '@/test/setup';

// ============================================================================
// Unit Tests (Task 3.1)
// ============================================================================

describe('Button Component - Unit Tests', () => {
  describe('Default Rendering', () => {
    it('renders without throwing errors', () => {
      expect(() => render(<Button>Click me</Button>)).not.toThrow();
    });

    it('renders children correctly', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders as a button element by default', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });
  });

  describe('Variant Styling', () => {
    it('applies default variant styles', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-primary');
    });

    it('applies destructive variant styles', () => {
      render(<Button variant="destructive">Destructive</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-destructive');
    });

    it('applies outline variant styles', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('border');
      expect(button.className).toContain('bg-background');
    });

    it('applies secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-secondary');
    });

    it('applies ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('hover:bg-accent');
    });

    it('applies link variant styles', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('underline-offset-4');
    });
  });

  describe('Size Styling', () => {
    it('applies default size styles', () => {
      render(<Button>Default Size</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-9');
      expect(button.className).toContain('px-4');
    });

    it('applies small size styles', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-8');
      expect(button.className).toContain('px-3');
    });

    it('applies large size styles', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-10');
      expect(button.className).toContain('px-8');
    });

    it('applies icon size styles', () => {
      render(<Button size="icon">Icon</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-9');
      expect(button.className).toContain('w-9');
    });
  });

  describe('ClassName Merging', () => {
    it('merges custom className with default classes', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
      expect(button.className).toContain('inline-flex');
    });

    it('allows custom className to override default styles', () => {
      render(<Button className="bg-red-500">Override</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-red-500');
    });
  });

  describe('Click Handlers', () => {
    it('invokes onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not invoke onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );
      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Polymorphism (render prop)', () => {
    it('renders as a link when using render prop', () => {
      render(<Button render={<a href="/test">Link Button</a>} />);

      const link = screen.getByRole('link', { name: 'Link Button' });
      expect(link).toBeInTheDocument();
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/test');
    });

    it('applies button styles to rendered element', () => {
      render(<Button variant="destructive" render={<a href="/test">Styled Link</a>} />);

      const link = screen.getByRole('link');
      expect(link.className).toContain('bg-destructive');
    });
  });

  describe('Disabled State', () => {
    it('applies disabled attribute when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies disabled styles when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('disabled:opacity-50');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to the button element', () => {
      const ref = { current: null as HTMLButtonElement | null };
      render(<Button ref={ref}>With Ref</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });
});

// ============================================================================
// Property-Based Tests (Task 3.2)
// ============================================================================

describe('Button Component - Property-Based Tests', () => {
  // Valid variants and sizes for the Button component
  const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
  const sizes = ['default', 'sm', 'lg', 'icon'] as const;

  // Arbitraries for generating test data
  const variantArb = fc.constantFrom(...variants);
  const sizeArb = fc.constantFrom(...sizes);
  const classNameArb = fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => /^[a-zA-Z][a-zA-Z0-9-_]*$/.test(s));
  const childTextArb = fc
    .string({ minLength: 1, maxLength: 100 })
    .filter((s) => s.trim().length > 0);

  /**
   * **Feature: component-accessibility-testing, Property 1: Component Default Rendering**
   * **Validates: Requirements 2.1**
   *
   * For any UI component in src/components/ui/, rendering with default props
   * SHALL not throw errors and SHALL produce valid DOM output.
   */
  it('Property 1: Component Default Rendering - renders without errors for any valid child text', () => {
    fc.assert(
      fc.property(childTextArb, (text) => {
        const { container } = render(<Button>{text}</Button>);
        const button = container.querySelector('button');

        // Should render without throwing
        expect(button).toBeInTheDocument();
        // Should produce valid DOM output (button element exists)
        expect(button?.tagName).toBe('BUTTON');
        // Should contain the text
        expect(button?.textContent).toContain(text);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: component-accessibility-testing, Property 2: Component Variant Styling**
   * **Validates: Requirements 2.2**
   *
   * For any component with variant props and for any valid variant value,
   * the rendered component SHALL contain the CSS classes corresponding to that variant.
   */
  it('Property 2: Component Variant Styling - applies correct styles for any valid variant', () => {
    // Map of variants to their expected CSS class patterns
    const variantClassMap: Record<(typeof variants)[number], string[]> = {
      default: ['bg-primary'],
      destructive: ['bg-destructive'],
      outline: ['border', 'bg-background'],
      secondary: ['bg-secondary'],
      ghost: ['hover:bg-accent'],
      link: ['underline-offset-4'],
    };

    fc.assert(
      fc.property(variantArb, (variant) => {
        const { container } = render(<Button variant={variant}>Test</Button>);
        const button = container.querySelector('button');

        expect(button).toBeInTheDocument();

        // Check that at least one expected class is present
        const expectedClasses = variantClassMap[variant];
        const hasExpectedClass = expectedClasses.some((cls) => button?.className.includes(cls));

        expect(hasExpectedClass).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: component-accessibility-testing, Property 3: Component ClassName Merging**
   * **Validates: Requirements 2.3**
   *
   * For any component and for any custom className string, the rendered component
   * SHALL contain both the default component classes and the custom className.
   */
  it('Property 3: Component ClassName Merging - merges custom className with defaults', () => {
    fc.assert(
      fc.property(classNameArb, (customClass) => {
        const { container } = render(<Button className={customClass}>Test</Button>);
        const button = container.querySelector('button');

        expect(button).toBeInTheDocument();

        // Should contain the custom class
        expect(button?.className).toContain(customClass);

        // Should still contain default base classes
        expect(button?.className).toContain('inline-flex');
        expect(button?.className).toContain('items-center');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: component-accessibility-testing, Property 4: Component Click Handler Invocation**
   * **Validates: Requirements 2.4**
   *
   * For any interactive component with an onClick prop, clicking the component
   * SHALL invoke the provided callback exactly once.
   */
  it('Property 4: Component Click Handler Invocation - invokes handler exactly once per click', async () => {
    // Use a smaller number of runs for async tests
    const numClicks = fc.integer({ min: 1, max: 5 });

    await fc.assert(
      fc.asyncProperty(numClicks, async (clicks) => {
        const handleClick = vi.fn();
        const user = userEvent.setup();

        const { container } = render(<Button onClick={handleClick}>Click</Button>);
        const button = container.querySelector('button');

        expect(button).toBeInTheDocument();

        // Click the button the specified number of times
        for (let i = 0; i < clicks; i++) {
          await user.click(button!);
        }

        // Handler should be called exactly the number of times we clicked
        expect(handleClick).toHaveBeenCalledTimes(clicks);
      }),
      { numRuns: 20 } // Fewer runs for async tests
    );
  });

  /**
   * **Feature: component-accessibility-testing, Property 5: Component Polymorphism**
   * **Validates: Requirements 2.5**
   *
   * For any component supporting polymorphism, it SHALL render the target element
   * with the component's props merged.
   */
  it('Property 5: Component Polymorphism - renders target element with merged props', () => {
    fc.assert(
      fc.property(variantArb, sizeArb, (variant, size) => {
        const { container } = render(
          <Button variant={variant} size={size} render={<a href="/test">Link</a>} />
        );

        // Should render as anchor, not button
        const link = container.querySelector('a');
        const button = container.querySelector('button');

        expect(link).toBeInTheDocument();
        expect(button).not.toBeInTheDocument();

        // Should have href attribute preserved
        expect(link).toHaveAttribute('href', '/test');

        // Should have button styles applied
        expect(link?.className).toContain('inline-flex');
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Accessibility Tests (Task 3.3)
// ============================================================================

describe('Button Component - Accessibility Tests', () => {
  /**
   * **Feature: component-accessibility-testing, Property 6: WCAG 2.2 AA Compliance**
   * **Validates: Requirements 3.1, 3.2**
   *
   * For any UI component, running axe-core accessibility checks SHALL report
   * zero WCAG 2.2 Level AA violations.
   */
  describe('Property 6: WCAG 2.2 AA Compliance', () => {
    it('has no accessibility violations with default props', async () => {
      const { container } = render(<Button>Accessible Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations for all variants', async () => {
      const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;

      for (const variant of variants) {
        const { container } = render(<Button variant={variant}>{variant} Button</Button>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('has no accessibility violations for all sizes', async () => {
      const sizes = ['default', 'sm', 'lg', 'icon'] as const;

      for (const size of sizes) {
        const { container } = render(<Button size={size}>Size {size}</Button>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('has no accessibility violations when disabled', async () => {
      const { container } = render(<Button disabled>Disabled Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with polymorphic render', async () => {
      const { container } = render(<Button render={<a href="/test">Link Button</a>} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with icon-only button (with aria-label)', async () => {
      const { container } = render(
        <Button size="icon" aria-label="Close dialog">
          <span aria-hidden="true">×</span>
        </Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Accessibility', () => {
    it('can be focused via Tab key', async () => {
      const user = userEvent.setup();
      render(<Button>Focusable</Button>);

      await user.tab();

      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('can be activated via Enter key', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Enter Key</Button>);
      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be activated via Space key', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Space Key</Button>);
      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('cannot be focused when disabled', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Button>First</Button>
          <Button disabled>Disabled</Button>
          <Button>Third</Button>
        </>
      );

      await user.tab(); // Focus first button
      expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();

      await user.tab(); // Should skip disabled and focus third
      expect(screen.getByRole('button', { name: 'Third' })).toHaveFocus();
    });
  });
});
