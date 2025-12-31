import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/components/ui/button-group';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';

/**
 * Group component tests
 *
 * Focus on BEHAVIOR, not CSS implementation:
 * - Rendering children correctly
 * - Data-slot and data-* attributes (stable API contract)
 * - User interactions (clicking, typing)
 * - Semantic HTML (role="group", type attributes)
 * - Prop forwarding (className, orientation, align)
 */

describe('ButtonGroup', () => {
  it('renders children in a group role container', () => {
    render(
      <ButtonGroup>
        <Button>Button 1</Button>
        <Button>Button 2</Button>
      </ButtonGroup>
    );

    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByText('Button 1')).toBeInTheDocument();
    expect(screen.getByText('Button 2')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(
      <ButtonGroup>
        <Button>Button</Button>
      </ButtonGroup>
    );

    expect(document.querySelector('[data-slot="button-group"]')).toBeInTheDocument();
  });

  it('supports vertical orientation via data attribute', () => {
    render(
      <ButtonGroup orientation="vertical">
        <Button>Button</Button>
      </ButtonGroup>
    );

    expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'vertical');
  });

  it('applies custom className', () => {
    render(
      <ButtonGroup className="custom-group">
        <Button>Button</Button>
      </ButtonGroup>
    );

    expect(screen.getByRole('group')).toHaveClass('custom-group');
  });
});

describe('ButtonGroupSeparator', () => {
  it('renders separator with role', () => {
    render(
      <ButtonGroup>
        <Button>Button 1</Button>
        <ButtonGroupSeparator />
        <Button>Button 2</Button>
      </ButtonGroup>
    );

    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="button-group-separator"]')).toBeInTheDocument();
  });

  it('has vertical orientation by default', () => {
    render(<ButtonGroupSeparator />);
    expect(screen.getByRole('separator')).toHaveAttribute('data-orientation', 'vertical');
  });

  it('supports horizontal orientation', () => {
    render(<ButtonGroupSeparator orientation="horizontal" />);
    expect(screen.getByRole('separator')).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('applies custom className', () => {
    render(<ButtonGroupSeparator className="custom-separator" />);
    expect(screen.getByRole('separator')).toHaveClass('custom-separator');
  });
});

describe('ButtonGroupText', () => {
  it('renders text element', () => {
    render(<ButtonGroupText>Label</ButtonGroupText>);
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ButtonGroupText className="custom-text">Text</ButtonGroupText>);
    expect(screen.getByText('Text')).toHaveClass('custom-text');
  });
});

describe('InputGroup', () => {
  it('renders children in a group role container', () => {
    render(
      <InputGroup>
        <InputGroupInput placeholder="Enter text" />
      </InputGroup>
    );

    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(
      <InputGroup>
        <InputGroupInput />
      </InputGroup>
    );

    expect(document.querySelector('[data-slot="input-group"]')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <InputGroup className="custom-group">
        <InputGroupInput />
      </InputGroup>
    );

    expect(screen.getByRole('group')).toHaveClass('custom-group');
  });
});

describe('InputGroupAddon', () => {
  it('renders addon with default inline-start alignment', () => {
    render(
      <InputGroup>
        <InputGroupAddon>$</InputGroupAddon>
        <InputGroupInput />
      </InputGroup>
    );

    const addon = document.querySelector('[data-slot="input-group-addon"]');
    expect(addon).toHaveAttribute('data-align', 'inline-start');
  });

  it('supports different alignment positions', () => {
    const alignments = ['inline-start', 'inline-end', 'block-start', 'block-end'] as const;

    for (const align of alignments) {
      const { unmount } = render(
        <InputGroup>
          <InputGroupAddon align={align}>Label</InputGroupAddon>
          <InputGroupInput />
        </InputGroup>
      );

      expect(document.querySelector('[data-slot="input-group-addon"]')).toHaveAttribute(
        'data-align',
        align
      );
      unmount();
    }
  });

  it('focuses input when addon is clicked', async () => {
    const user = userEvent.setup();
    render(
      <InputGroup>
        <InputGroupAddon>$</InputGroupAddon>
        <InputGroupInput data-testid="input" />
      </InputGroup>
    );

    const addon = document.querySelector('[data-slot="input-group-addon"]');
    await user.click(addon!);

    expect(screen.getByTestId('input')).toHaveFocus();
  });
});

describe('InputGroupButton', () => {
  it('renders button with correct role', () => {
    render(
      <InputGroup>
        <InputGroupInput />
        <InputGroupButton>Submit</InputGroupButton>
      </InputGroup>
    );

    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('has button type by default', () => {
    render(<InputGroupButton>Click</InputGroupButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('supports submit type', () => {
    render(<InputGroupButton type="submit">Submit</InputGroupButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('forwards size prop as data attribute', () => {
    const { rerender } = render(<InputGroupButton size="xs">Button</InputGroupButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'xs');

    rerender(<InputGroupButton size="sm">Button</InputGroupButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'sm');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<InputGroupButton onClick={onClick}>Click</InputGroupButton>);

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('InputGroupText', () => {
  it('renders text content', () => {
    render(<InputGroupText>helper text</InputGroupText>);
    expect(screen.getByText('helper text')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<InputGroupText className="custom-text">text</InputGroupText>);
    expect(screen.getByText('text')).toHaveClass('custom-text');
  });
});

describe('InputGroupInput', () => {
  it('renders input element with placeholder', () => {
    render(<InputGroupInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(<InputGroupInput />);
    expect(document.querySelector('[data-slot="input-group-control"]')).toBeInTheDocument();
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    render(<InputGroupInput />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test value');
    expect(input).toHaveValue('test value');
  });
});

describe('InputGroupTextarea', () => {
  it('renders textarea element with placeholder', () => {
    render(<InputGroupTextarea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(<InputGroupTextarea />);
    expect(document.querySelector('[data-slot="input-group-control"]')).toBeInTheDocument();
  });

  it('handles user input including newlines', async () => {
    const user = userEvent.setup();
    render(<InputGroupTextarea />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'multiline{enter}text');
    expect(textarea).toHaveValue('multiline\ntext');
  });
});

describe('InputGroup compositions', () => {
  it('renders complete search input with addon', () => {
    render(
      <InputGroup>
        <InputGroupAddon>icon</InputGroupAddon>
        <InputGroupInput placeholder="Search..." />
        <InputGroupButton>Search</InputGroupButton>
      </InputGroup>
    );

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByText('icon')).toBeInTheDocument();
  });

  it('renders currency input with prefix and suffix', () => {
    render(
      <InputGroup>
        <InputGroupAddon>$</InputGroupAddon>
        <InputGroupInput type="number" placeholder="0.00" />
        <InputGroupAddon align="inline-end">USD</InputGroupAddon>
      </InputGroup>
    );

    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });
});
