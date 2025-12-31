import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Popover,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';

describe('Popover', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
      </Popover>
    );
    expect(screen.getByText('Open').closest('[data-slot]')).toHaveAttribute(
      'data-slot',
      'popover-trigger'
    );
  });

  it('renders trigger with children', () => {
    render(
      <Popover>
        <PopoverTrigger>Click me</PopoverTrigger>
      </Popover>
    );
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('forwards props to trigger', () => {
    render(
      <Popover>
        <PopoverTrigger data-custom="test">Open</PopoverTrigger>
      </Popover>
    );
    expect(screen.getByText('Open')).toHaveAttribute('data-custom', 'test');
  });
});

describe('PopoverHeader', () => {
  it('renders with data-slot attribute', () => {
    render(<PopoverHeader>Header content</PopoverHeader>);
    expect(screen.getByText('Header content')).toHaveAttribute('data-slot', 'popover-header');
  });

  it('applies default classes', () => {
    render(<PopoverHeader>Header</PopoverHeader>);
    expect(screen.getByText('Header')).toHaveClass('flex', 'flex-col', 'gap-1', 'text-sm');
  });

  it('merges custom className', () => {
    render(<PopoverHeader className="custom-class">Header</PopoverHeader>);
    expect(screen.getByText('Header')).toHaveClass('custom-class');
  });

  it('renders children correctly', () => {
    render(
      <PopoverHeader>
        <span>Title</span>
        <span>Description</span>
      </PopoverHeader>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});

describe('PopoverTitle', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Popover>
        <PopoverTitle>Title</PopoverTitle>
      </Popover>
    );
    expect(screen.getByText('Title')).toHaveAttribute('data-slot', 'popover-title');
  });

  it('applies font-medium class', () => {
    render(
      <Popover>
        <PopoverTitle>Title</PopoverTitle>
      </Popover>
    );
    expect(screen.getByText('Title')).toHaveClass('font-medium');
  });

  it('merges custom className', () => {
    render(
      <Popover>
        <PopoverTitle className="text-lg">Title</PopoverTitle>
      </Popover>
    );
    expect(screen.getByText('Title')).toHaveClass('text-lg');
  });
});

describe('PopoverDescription', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Popover>
        <PopoverDescription>Description</PopoverDescription>
      </Popover>
    );
    expect(screen.getByText('Description')).toHaveAttribute('data-slot', 'popover-description');
  });

  it('applies muted foreground class', () => {
    render(
      <Popover>
        <PopoverDescription>Description</PopoverDescription>
      </Popover>
    );
    expect(screen.getByText('Description')).toHaveClass('text-muted-foreground');
  });

  it('merges custom className', () => {
    render(
      <Popover>
        <PopoverDescription className="text-xs">Description</PopoverDescription>
      </Popover>
    );
    expect(screen.getByText('Description')).toHaveClass('text-xs');
  });
});

describe('Popover composition', () => {
  it('works as a composed component', () => {
    render(
      <Popover>
        <PopoverTrigger>Toggle</PopoverTrigger>
        <PopoverHeader>
          <PopoverTitle>Settings</PopoverTitle>
          <PopoverDescription>Adjust your preferences</PopoverDescription>
        </PopoverHeader>
      </Popover>
    );

    expect(screen.getByText('Toggle')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Adjust your preferences')).toBeInTheDocument();
  });
});
