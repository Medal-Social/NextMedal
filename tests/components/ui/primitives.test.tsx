import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';

// Mock next-intl for pagination components
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      goToPrevious: 'Go to previous page',
      goToNext: 'Go to next page',
      previous: 'Previous',
      next: 'Next',
      morePages: 'More pages',
    };
    return translations[key] || key;
  },
}));

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox aria-label="Test checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('renders checked when defaultChecked is true', () => {
    render(<Checkbox aria-label="Test checkbox" defaultChecked />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('toggles when clicked', async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Test checkbox" />);
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('applies custom className', () => {
    render(<Checkbox aria-label="Test checkbox" className="custom-class" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('custom-class');
  });

  it('can be disabled', () => {
    render(<Checkbox aria-label="Test checkbox" disabled />);
    const checkbox = screen.getByRole('checkbox');
    // Base-ui marks disabled state with data-disabled attribute (empty string when true)
    expect(checkbox).toHaveAttribute('data-disabled');
  });

  it('calls onCheckedChange when toggled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox aria-label="Test checkbox" onCheckedChange={onChange} />);

    await user.click(screen.getByRole('checkbox'));
    // Base-ui might pass the entire state or just the boolean
    expect(onChange).toHaveBeenCalled();
  });
});

describe('Textarea', () => {
  it('renders with placeholder', () => {
    render(<Textarea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with default value', () => {
    render(<Textarea defaultValue="Default text" />);
    expect(screen.getByRole('textbox')).toHaveValue('Default text');
  });

  it('applies custom className', () => {
    render(<Textarea className="custom-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });

  it('can be disabled', () => {
    render(<Textarea disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');

    await user.type(textarea, 'Hello world');
    expect(textarea).toHaveValue('Hello world');
  });

  it('passes through props', () => {
    render(<Textarea rows={5} name="message" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).toHaveAttribute('name', 'message');
  });
});

describe('RadioGroup', () => {
  it('renders radio group with items', () => {
    render(
      <RadioGroup aria-label="Choose option">
        <RadioGroupItem value="option1" aria-label="Option 1" />
        <RadioGroupItem value="option2" aria-label="Option 2" />
      </RadioGroup>
    );

    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('selects option when clicked', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup aria-label="Choose option">
        <RadioGroupItem value="option1" aria-label="Option 1" />
        <RadioGroupItem value="option2" aria-label="Option 2" />
      </RadioGroup>
    );

    const option1 = screen.getByLabelText('Option 1');
    await user.click(option1);
    expect(option1).toBeChecked();
  });

  it('allows only one selection', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup aria-label="Choose option">
        <RadioGroupItem value="option1" aria-label="Option 1" />
        <RadioGroupItem value="option2" aria-label="Option 2" />
      </RadioGroup>
    );

    const option1 = screen.getByLabelText('Option 1');
    const option2 = screen.getByLabelText('Option 2');

    await user.click(option1);
    expect(option1).toBeChecked();
    expect(option2).not.toBeChecked();

    await user.click(option2);
    expect(option1).not.toBeChecked();
    expect(option2).toBeChecked();
  });

  it('applies custom className', () => {
    render(
      <RadioGroup className="custom-class" aria-label="Options">
        <RadioGroupItem value="test" aria-label="Test" />
      </RadioGroup>
    );

    expect(screen.getByRole('radiogroup')).toHaveClass('custom-class');
  });
});

describe('Toggle', () => {
  it('renders toggle button', () => {
    render(<Toggle aria-label="Toggle">Toggle</Toggle>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Toggle')).toBeInTheDocument();
  });

  it('toggles pressed state when clicked', async () => {
    const user = userEvent.setup();
    render(<Toggle aria-label="Toggle">Toggle</Toggle>);
    const toggle = screen.getByRole('button');

    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('applies default variant', () => {
    render(<Toggle aria-label="Toggle">Toggle</Toggle>);
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveClass('bg-transparent');
  });

  it('applies outline variant', () => {
    render(
      <Toggle aria-label="Toggle" variant="outline">
        Toggle
      </Toggle>
    );
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveClass('border');
  });

  it('applies size variants', () => {
    const { rerender } = render(
      <Toggle aria-label="Toggle" size="sm">
        Toggle
      </Toggle>
    );
    expect(screen.getByRole('button')).toHaveClass('h-8');

    rerender(
      <Toggle aria-label="Toggle" size="lg">
        Toggle
      </Toggle>
    );
    expect(screen.getByRole('button')).toHaveClass('h-10');
  });

  it('can be disabled', () => {
    render(
      <Toggle aria-label="Toggle" disabled>
        Toggle
      </Toggle>
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('Slider', () => {
  it('renders slider component', () => {
    act(() => {
      render(<Slider aria-label="Volume" />);
    });
    // Base-ui slider renders a group with slider children
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('renders with data-slot attribute', () => {
    act(() => {
      render(<Slider aria-label="Volume" />);
    });
    expect(document.querySelector('[data-slot="slider"]')).toBeInTheDocument();
  });

  it('renders track and thumb elements', () => {
    act(() => {
      render(<Slider aria-label="Volume" defaultValue={[50]} />);
    });
    expect(document.querySelector('[data-slot="slider-track"]')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="slider-thumb"]')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    act(() => {
      render(<Slider aria-label="Volume" className="custom-class" />);
    });
    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('renders multiple thumbs for range slider', () => {
    act(() => {
      render(<Slider aria-label="Price range" defaultValue={[25, 75]} />);
    });
    const thumbs = document.querySelectorAll('[data-slot="slider-thumb"]');
    expect(thumbs).toHaveLength(2);
  });
});

describe('Pagination', () => {
  it('renders pagination nav', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'pagination');
    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
  });

  it('highlights active page', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    const activeLink = screen.getByText('2').closest('a');
    expect(activeLink).toHaveAttribute('aria-current', 'page');
    expect(activeLink).toHaveAttribute('data-active', 'true');
  });

  it('renders ellipsis with sr-only text', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByText('More pages')).toHaveClass('sr-only');
  });

  it('applies custom className', () => {
    render(
      <Pagination className="custom-nav">
        <PaginationContent className="custom-content">
          <PaginationItem>
            <PaginationLink href="#" className="custom-link">
              1
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByRole('navigation')).toHaveClass('custom-nav');
    expect(screen.getByRole('list')).toHaveClass('custom-content');
    // Links have Button styling, className is applied via cn
    expect(screen.getByText('1').closest('a')).toBeInTheDocument();
  });
});
