import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

describe('Accordion', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Accordion data-testid="accordion">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByTestId('accordion')).toHaveAttribute('data-slot', 'accordion');
  });

  it('applies default classes', () => {
    render(
      <Accordion data-testid="accordion">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByTestId('accordion')).toHaveClass('flex', 'w-full', 'flex-col', 'gap-3');
  });

  it('merges custom className', () => {
    render(
      <Accordion className="custom-class" data-testid="accordion">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByTestId('accordion')).toHaveClass('custom-class');
  });
});

describe('AccordionItem', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1" data-testid="item">
          <AccordionTrigger>Trigger</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByTestId('item')).toHaveAttribute('data-slot', 'accordion-item');
  });

  it('applies border and background classes', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1" data-testid="item">
          <AccordionTrigger>Trigger</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    );
    const item = screen.getByTestId('item');
    expect(item).toHaveClass('rounded-lg', 'border', 'border-border', 'bg-card');
  });

  it('merges custom className', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1" className="my-item" data-testid="item">
          <AccordionTrigger>Trigger</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByTestId('item')).toHaveClass('my-item');
  });
});

describe('AccordionTrigger', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionTrigger>Click Me</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'accordion-trigger');
  });

  it('renders children text', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionTrigger>FAQ Question</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByText('FAQ Question')).toBeInTheDocument();
  });

  it('renders chevron icon', () => {
    const { container } = render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    );
    expect(container.querySelector('[data-slot="accordion-trigger-icon"]')).toBeInTheDocument();
  });

  it('applies hover and focus classes', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    );
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveClass('hover:bg-muted/30');
    expect(trigger).toHaveClass('focus-visible:ring-2');
  });

  it('merges custom className', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionTrigger className="custom-trigger">Trigger</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByRole('button')).toHaveClass('custom-trigger');
  });
});

describe('AccordionContent', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Accordion defaultValue={['item-1']}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent data-testid="content">Panel content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'accordion-content');
  });

  it('renders children when open', () => {
    render(
      <Accordion defaultValue={['item-1']}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>This is the answer</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByText('This is the answer')).toBeInTheDocument();
  });

  it('has animation classes', () => {
    render(
      <Accordion defaultValue={['item-1']}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent data-testid="content">Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByTestId('content')).toHaveClass('overflow-hidden');
  });
});

describe('Accordion composition', () => {
  it('renders multiple items', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionTrigger>First Question</AccordionTrigger>
          <AccordionContent>First Answer</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Second Question</AccordionTrigger>
          <AccordionContent>Second Answer</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByText('First Question')).toBeInTheDocument();
    expect(screen.getByText('Second Question')).toBeInTheDocument();
  });

  it('supports controlled open state via defaultValue', () => {
    render(
      <Accordion defaultValue={['item-2']}>
        <AccordionItem value="item-1">
          <AccordionTrigger>First</AccordionTrigger>
          <AccordionContent>First Content</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Second</AccordionTrigger>
          <AccordionContent>Second Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByText('Second Content')).toBeInTheDocument();
  });
});
