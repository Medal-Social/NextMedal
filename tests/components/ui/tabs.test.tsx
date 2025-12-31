import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants } from '@/components/ui/tabs';

describe('Tabs', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Tabs data-testid="tabs" defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByTestId('tabs')).toHaveAttribute('data-slot', 'tabs');
  });

  it('applies horizontal orientation by default', () => {
    render(
      <Tabs data-testid="tabs" defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByTestId('tabs')).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('supports vertical orientation', () => {
    render(
      <Tabs data-testid="tabs" orientation="vertical" defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByTestId('tabs')).toHaveAttribute('data-orientation', 'vertical');
  });

  it('merges custom className', () => {
    render(
      <Tabs className="custom-tabs" data-testid="tabs" defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByTestId('tabs')).toHaveClass('custom-tabs');
  });
});

describe('TabsList', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByTestId('list')).toHaveAttribute('data-slot', 'tabs-list');
  });

  it('applies default variant', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByTestId('list')).toHaveAttribute('data-variant', 'default');
    expect(screen.getByTestId('list')).toHaveClass('bg-muted');
  });

  it('supports line variant', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList variant="line" data-testid="list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByTestId('list')).toHaveAttribute('data-variant', 'line');
    expect(screen.getByTestId('list')).toHaveClass('bg-transparent');
  });

  it('merges custom className', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList className="w-full" data-testid="list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByTestId('list')).toHaveClass('w-full');
  });
});

describe('tabsListVariants', () => {
  it('returns default variant classes', () => {
    const classes = tabsListVariants({ variant: 'default' });
    expect(classes).toContain('bg-muted');
  });

  it('returns line variant classes', () => {
    const classes = tabsListVariants({ variant: 'line' });
    expect(classes).toContain('bg-transparent');
    expect(classes).toContain('gap-1');
  });
});

describe('TabsTrigger', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByRole('tab')).toHaveAttribute('data-slot', 'tabs-trigger');
  });

  it('renders children text', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">My Tab Label</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByText('My Tab Label')).toBeInTheDocument();
  });

  it('applies styling classes', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const trigger = screen.getByRole('tab');
    expect(trigger).toHaveClass('rounded-md', 'text-sm', 'font-medium');
  });

  it('merges custom className', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" className="custom-tab">
            Tab
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByRole('tab')).toHaveClass('custom-tab');
  });
});

describe('TabsContent', () => {
  it('renders with data-slot attribute', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="content">
          Content
        </TabsContent>
      </Tabs>
    );
    expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'tabs-content');
  });

  it('renders children when selected', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Panel content here</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Panel content here')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="content">
          Content
        </TabsContent>
      </Tabs>
    );
    expect(screen.getByTestId('content')).toHaveClass('text-sm', 'flex-1', 'outline-none');
  });

  it('merges custom className', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="p-4" data-testid="content">
          Content
        </TabsContent>
      </Tabs>
    );
    expect(screen.getByTestId('content')).toHaveClass('p-4');
  });
});

describe('Tabs composition', () => {
  it('renders multiple tabs', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">First</TabsTrigger>
          <TabsTrigger value="tab2">Second</TabsTrigger>
          <TabsTrigger value="tab3">Third</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">First Content</TabsContent>
        <TabsContent value="tab2">Second Content</TabsContent>
        <TabsContent value="tab3">Third Content</TabsContent>
      </Tabs>
    );
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByText('First Content')).toBeInTheDocument();
  });

  it('shows correct content for defaultValue', () => {
    render(
      <Tabs defaultValue="tab2">
        <TabsList>
          <TabsTrigger value="tab1">First</TabsTrigger>
          <TabsTrigger value="tab2">Second</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">First Panel</TabsContent>
        <TabsContent value="tab2">Second Panel</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Second Panel')).toBeInTheDocument();
  });
});
