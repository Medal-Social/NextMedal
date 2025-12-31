import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Select,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

describe('Select', () => {
  it('renders trigger with value placeholder as attribute', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>
    );
    // The placeholder is set as an attribute, not as text content
    const value = screen.getByRole('combobox').querySelector('[data-slot="select-value"]');
    expect(value).toHaveAttribute('placeholder', 'Select an option');
  });
});

describe('SelectTrigger', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
      </Select>
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('data-slot', 'select-trigger');
  });

  it('applies default size', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('data-size', 'default');
  });

  it('applies sm size', () => {
    render(
      <Select>
        <SelectTrigger size="sm">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('data-size', 'sm');
  });

  it('merges custom className', () => {
    render(
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByRole('combobox')).toHaveClass('w-full');
  });
});

describe('SelectValue', () => {
  it('renders with data-slot attribute', () => {
    const { container } = render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
      </Select>
    );
    expect(container.querySelector('[data-slot="select-value"]')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Value" />
        </SelectTrigger>
      </Select>
    );
    const value = container.querySelector('[data-slot="select-value"]');
    expect(value).toHaveClass('flex', 'flex-1', 'text-left');
  });

  it('merges custom className', () => {
    const { container } = render(
      <Select>
        <SelectTrigger>
          <SelectValue className="custom" placeholder="Value" />
        </SelectTrigger>
      </Select>
    );
    const value = container.querySelector('[data-slot="select-value"]');
    expect(value).toHaveClass('custom');
  });
});

describe('SelectGroup', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Select>
        <SelectGroup data-testid="group">
          <SelectItem value="1">Item 1</SelectItem>
        </SelectGroup>
      </Select>
    );
    expect(screen.getByTestId('group')).toHaveAttribute('data-slot', 'select-group');
  });

  it('applies default classes', () => {
    render(
      <Select>
        <SelectGroup data-testid="group">
          <SelectItem value="1">Item</SelectItem>
        </SelectGroup>
      </Select>
    );
    expect(screen.getByTestId('group')).toHaveClass('scroll-my-1', 'p-1');
  });

  it('merges custom className', () => {
    render(
      <Select>
        <SelectGroup className="my-group" data-testid="group">
          <SelectItem value="1">Item</SelectItem>
        </SelectGroup>
      </Select>
    );
    expect(screen.getByTestId('group')).toHaveClass('my-group');
  });
});

describe('SelectItem', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Select>
        <SelectItem value="test">Test Item</SelectItem>
      </Select>
    );
    expect(screen.getByRole('option')).toHaveAttribute('data-slot', 'select-item');
  });

  it('renders children in text slot', () => {
    render(
      <Select>
        <SelectItem value="opt">Option Text</SelectItem>
      </Select>
    );
    expect(screen.getByText('Option Text')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(
      <Select>
        <SelectItem value="opt" className="custom-item">
          Option
        </SelectItem>
      </Select>
    );
    expect(screen.getByRole('option')).toHaveClass('custom-item');
  });
});

describe('SelectLabel', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Select>
        <SelectGroup>
          <SelectLabel>Group Label</SelectLabel>
        </SelectGroup>
      </Select>
    );
    expect(screen.getByText('Group Label')).toHaveAttribute('data-slot', 'select-label');
  });

  it('applies muted text classes', () => {
    render(
      <Select>
        <SelectGroup>
          <SelectLabel>Label</SelectLabel>
        </SelectGroup>
      </Select>
    );
    expect(screen.getByText('Label')).toHaveClass('text-muted-foreground', 'text-xs');
  });

  it('merges custom className', () => {
    render(
      <Select>
        <SelectGroup>
          <SelectLabel className="font-bold">Label</SelectLabel>
        </SelectGroup>
      </Select>
    );
    expect(screen.getByText('Label')).toHaveClass('font-bold');
  });
});

describe('SelectSeparator', () => {
  it('renders with data-slot attribute', () => {
    const { container } = render(
      <Select>
        <SelectSeparator />
      </Select>
    );
    expect(container.querySelector('[data-slot="select-separator"]')).toBeInTheDocument();
  });

  it('applies separator classes', () => {
    const { container } = render(
      <Select>
        <SelectSeparator />
      </Select>
    );
    const separator = container.querySelector('[data-slot="select-separator"]');
    expect(separator).toHaveClass('bg-border', 'h-px');
  });

  it('merges custom className', () => {
    const { container } = render(
      <Select>
        <SelectSeparator className="my-separator" />
      </Select>
    );
    const separator = container.querySelector('[data-slot="select-separator"]');
    expect(separator).toHaveClass('my-separator');
  });
});

describe('Select composition', () => {
  it('works as a composed component', () => {
    const { container } = render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectSeparator />
          <SelectItem value="orange">Orange</SelectItem>
        </SelectGroup>
      </Select>
    );

    // Check placeholder is set
    const value = container.querySelector('[data-slot="select-value"]');
    expect(value).toHaveAttribute('placeholder', 'Select a fruit');
    // Check other elements
    expect(screen.getByText('Fruits')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Orange')).toBeInTheDocument();
  });
});
