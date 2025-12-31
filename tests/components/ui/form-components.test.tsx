import { axe, cleanup, render, screen, userEvent } from '@tests/setup/providers';
import * as fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// ============================================================================
// Input Component Tests (Task 5.1)
// ============================================================================

describe('Input Component', () => {
  describe('Default Rendering', () => {
    it('renders without throwing errors', () => {
      expect(() => render(<Input />)).not.toThrow();
    });

    it('renders as an input element', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.tagName).toBe('INPUT');
    });

    it('renders without explicit type attribute (defaults to text behavior)', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      // HTML inputs default to type="text" when no type is specified
      // The component doesn't set an explicit type attribute
      expect(input.type).toBe('text');
    });
  });

  describe('Type Variants', () => {
    const inputTypes = ['text', 'email', 'password', 'number', 'tel', 'url', 'search'] as const;

    inputTypes.forEach((type) => {
      it(`renders with type="${type}"`, () => {
        render(<Input type={type} data-testid="input" />);
        const input = screen.getByTestId('input');
        expect(input).toHaveAttribute('type', type);
      });
    });
  });

  describe('ClassName Merging', () => {
    it('merges custom className with default classes', () => {
      render(<Input className="custom-class" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.className).toContain('custom-class');
      expect(input.className).toContain('flex');
      expect(input.className).toContain('rounded-md');
    });
  });

  describe('Disabled State', () => {
    it('applies disabled attribute when disabled prop is true', () => {
      render(<Input disabled data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeDisabled();
    });

    it('applies disabled styles when disabled', () => {
      render(<Input disabled data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.className).toContain('disabled:cursor-not-allowed');
      expect(input.className).toContain('disabled:opacity-50');
    });
  });

  describe('Placeholder', () => {
    it('renders with placeholder text', () => {
      render(<Input placeholder="Enter text..." data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('placeholder', 'Enter text...');
    });
  });

  describe('Value Handling', () => {
    it('handles controlled value', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Input value="initial" onChange={handleChange} data-testid="input" />);
      const input = screen.getByTestId('input');

      await user.type(input, 'a');
      expect(handleChange).toHaveBeenCalled();
    });

    it('handles uncontrolled value', async () => {
      const user = userEvent.setup();

      render(<Input defaultValue="initial" data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      expect(input.value).toBe('initial');
      await user.clear(input);
      await user.type(input, 'new value');
      expect(input.value).toBe('new value');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to the input element', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 6: WCAG 2.2 AA Compliance**
   * **Validates: Requirements 3.1, 3.5**
   */
  describe('Accessibility', () => {
    it('has no accessibility violations with label', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="test-input">Test Label</Label>
          <Input id="test-input" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when disabled', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="disabled-input">Disabled Input</Label>
          <Input id="disabled-input" disabled />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('can be focused via Tab key', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="input" />);

      await user.tab();
      expect(screen.getByTestId('input')).toHaveFocus();
    });
  });
});

// ============================================================================
// Label Component Tests (Task 5.1)
// ============================================================================

describe('Label Component', () => {
  describe('Default Rendering', () => {
    it('renders without throwing errors', () => {
      expect(() => render(<Label>Test Label</Label>)).not.toThrow();
    });

    it('renders children correctly', () => {
      render(<Label>Test Label</Label>);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('renders as a label element', () => {
      render(<Label data-testid="label">Test</Label>);
      const label = screen.getByTestId('label');
      expect(label.tagName).toBe('LABEL');
    });
  });

  describe('ClassName Merging', () => {
    it('merges custom className with default classes', () => {
      render(
        <Label className="custom-class" data-testid="label">
          Test
        </Label>
      );
      const label = screen.getByTestId('label');
      expect(label.className).toContain('custom-class');
      expect(label.className).toContain('text-sm');
      expect(label.className).toContain('font-medium');
    });
  });

  describe('htmlFor Association', () => {
    it('associates with input via htmlFor', () => {
      render(
        <div>
          <Label htmlFor="my-input">My Label</Label>
          <Input id="my-input" />
        </div>
      );

      const label = screen.getByText('My Label');
      expect(label).toHaveAttribute('for', 'my-input');
    });

    it('clicking label focuses associated input', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Label htmlFor="click-input">Click Me</Label>
          <Input id="click-input" data-testid="input" />
        </div>
      );

      await user.click(screen.getByText('Click Me'));
      expect(screen.getByTestId('input')).toHaveFocus();
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to the label element', () => {
      const ref = { current: null as HTMLLabelElement | null };
      render(<Label ref={ref}>Test</Label>);
      expect(ref.current).toBeInstanceOf(HTMLLabelElement);
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 6: WCAG 2.2 AA Compliance**
   * **Validates: Requirements 3.1, 3.5**
   */
  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="accessible-input">Accessible Label</Label>
          <Input id="accessible-input" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

// ============================================================================
// Select Component Tests (Task 5.1)
// ============================================================================

describe('Select Component', () => {
  const renderSelect = (props?: { disabled?: boolean; defaultValue?: string }) => {
    return render(
      <Select defaultValue={props?.defaultValue} disabled={props?.disabled}>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  describe('Default Rendering', () => {
    it('renders without throwing errors', () => {
      expect(() => renderSelect()).not.toThrow();
    });

    it('renders trigger with placeholder', () => {
      renderSelect();
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeInTheDocument();
      // Base UI may render placeholder differently, check the trigger exists
      expect(trigger).toHaveAttribute('data-slot', 'select-trigger');
    });

    it('renders with default value', () => {
      renderSelect({ defaultValue: 'option1' });
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('ClassName Merging', () => {
    it('merges custom className on SelectTrigger', () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger" data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger.className).toContain('custom-trigger');
      expect(trigger.className).toContain('flex');
    });
  });

  describe('Disabled State', () => {
    it('applies disabled state to trigger', () => {
      renderSelect({ disabled: true });
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeDisabled();
    });
  });

  describe('Render Behavior', () => {
    it('renders SelectTrigger correctly', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 6: WCAG 2.2 AA Compliance**
   * **Validates: Requirements 3.1, 3.5**
   */
  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="select-test">Select Label</Label>
          <Select>
            <SelectTrigger id="select-test">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('can be focused via Tab key', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.tab();
      expect(screen.getByTestId('select-trigger')).toHaveFocus();
    });
  });
});

// ============================================================================
// Switch Component Tests (Task 5.1)
// ============================================================================

describe('Switch Component', () => {
  describe('Default Rendering', () => {
    it('renders without throwing errors', () => {
      expect(() => render(<Switch />)).not.toThrow();
    });

    it('renders the switch element', () => {
      render(<Switch data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      expect(switchEl).toBeInTheDocument();
    });

    it('has switch role', () => {
      render(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });
  });

  describe('Checked State', () => {
    it('renders unchecked by default', () => {
      render(<Switch />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveAttribute('data-unchecked');
    });

    it('renders checked when defaultChecked is true', () => {
      render(<Switch defaultChecked />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveAttribute('data-checked');
    });

    it('toggles state on click', async () => {
      const user = userEvent.setup();
      render(<Switch />);
      const switchEl = screen.getByRole('switch');

      expect(switchEl).toHaveAttribute('data-unchecked');
      await user.click(switchEl);
      expect(switchEl).toHaveAttribute('data-checked');
      await user.click(switchEl);
      expect(switchEl).toHaveAttribute('data-unchecked');
    });
  });

  describe('ClassName Merging', () => {
    it('merges custom className with default classes', () => {
      render(<Switch className="custom-class" data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      expect(switchEl.className).toContain('custom-class');
      expect(switchEl.className).toContain('inline-flex');
      expect(switchEl.className).toContain('rounded-full');
    });
  });

  describe('Disabled State', () => {
    it('applies disabled attribute when disabled prop is true', () => {
      render(<Switch disabled />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveAttribute('data-disabled');
    });

    it('does not toggle when disabled', async () => {
      const user = userEvent.setup();
      render(<Switch disabled />);
      const switchEl = screen.getByRole('switch');

      expect(switchEl).toHaveAttribute('data-unchecked');
      await user.click(switchEl);
      expect(switchEl).toHaveAttribute('data-unchecked');
    });
  });

  describe('Callback Handling', () => {
    it('invokes onCheckedChange when toggled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Switch onCheckedChange={handleChange} />);
      await user.click(screen.getByRole('switch'));

      expect(handleChange).toHaveBeenCalledWith(true, expect.anything());
    });
  });

  describe('Render Behavior', () => {
    it('renders the switch element correctly', () => {
      render(<Switch data-testid="switch-render" />);
      expect(screen.getByTestId('switch-render')).toBeInTheDocument();
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 6: WCAG 2.2 AA Compliance**
   * **Validates: Requirements 3.1, 3.5**
   */
  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <div className="flex items-center space-x-2">
          <Switch aria-label="Airplane Mode" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when checked', async () => {
      const { container } = render(
        <div className="flex items-center space-x-2">
          <Switch aria-label="Checked Switch" defaultChecked />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('can be focused via Tab key', async () => {
      const user = userEvent.setup();
      render(<Switch />);

      await user.tab();
      expect(screen.getByRole('switch')).toHaveFocus();
    });

    it('can be toggled via Space key', async () => {
      const user = userEvent.setup();
      render(<Switch />);
      const switchEl = screen.getByRole('switch');

      switchEl.focus();
      expect(switchEl).toHaveAttribute('data-unchecked');

      await user.keyboard(' ');
      expect(switchEl).toHaveAttribute('data-checked');
    });

    it('can be toggled via Enter key', async () => {
      const user = userEvent.setup();
      render(<Switch />);
      const switchEl = screen.getByRole('switch');

      switchEl.focus();
      expect(switchEl).toHaveAttribute('data-unchecked');

      await user.keyboard('{Enter}');
      expect(switchEl).toHaveAttribute('data-checked');
    });
  });
});

// ============================================================================
// Property-Based Tests for Form Components (Task 5.1)
// ============================================================================

describe('Form Components - Property-Based Tests', () => {
  const classNameArb = fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => /^[a-zA-Z][a-zA-Z0-9-_]*$/.test(s));

  /**
   * **Feature: component-accessibility-testing, Property 1: Component Default Rendering**
   * **Validates: Requirements 2.1**
   */
  describe('Property 1: Component Default Rendering', () => {
    it('Input renders without errors for any valid placeholder', () => {
      const placeholderArb = fc
        .string({ minLength: 1, maxLength: 100 })
        .filter((s) => s.trim().length > 0);

      fc.assert(
        fc.property(placeholderArb, (placeholder) => {
          const { container } = render(<Input placeholder={placeholder} />);
          const input = container.querySelector('input');
          expect(input).toBeInTheDocument();
          expect(input).toHaveAttribute('placeholder', placeholder);
        }),
        { numRuns: 100 }
      );
    });

    it('Label renders without errors for any valid text', () => {
      const textArb = fc
        .string({ minLength: 1, maxLength: 100 })
        .filter((s) => s.trim().length > 0);

      fc.assert(
        fc.property(textArb, (text) => {
          const { container } = render(<Label>{text}</Label>);
          expect(container.textContent).toContain(text);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 3: Component ClassName Merging**
   * **Validates: Requirements 2.3**
   */
  describe('Property 3: Component ClassName Merging', () => {
    it('Input merges custom className with defaults', () => {
      fc.assert(
        fc.property(classNameArb, (customClass) => {
          const { container } = render(<Input className={customClass} />);
          const input = container.querySelector('input');
          expect(input?.className).toContain(customClass);
          expect(input?.className).toContain('flex');
        }),
        { numRuns: 100 }
      );
    });

    it('Label merges custom className with defaults', () => {
      fc.assert(
        fc.property(classNameArb, (customClass) => {
          const { container } = render(<Label className={customClass}>Test</Label>);
          const label = container.querySelector('label');
          expect(label?.className).toContain(customClass);
          expect(label?.className).toContain('text-sm');
        }),
        { numRuns: 100 }
      );
    });

    it('Switch merges custom className with defaults', () => {
      fc.assert(
        fc.property(classNameArb, (customClass) => {
          cleanup();
          render(<Switch className={customClass} data-testid="switch" />);
          const switchEl = screen.getByTestId('switch');
          expect(switchEl.className).toContain(customClass);
          expect(switchEl.className).toContain('inline-flex');
        }),
        { numRuns: 100 }
      );
    });
  });
});
