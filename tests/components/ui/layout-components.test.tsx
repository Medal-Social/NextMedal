import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field';
import { Section } from '@/components/ui/section';

/**
 * Layout component tests
 *
 * Focus on BEHAVIOR, not CSS implementation:
 * - Rendering children correctly
 * - Data-slot attributes (stable API contract)
 * - Prop forwarding (className, orientation, variant)
 * - Semantic HTML elements
 */

describe('Field components', () => {
  describe('Field', () => {
    it('renders children', () => {
      render(<Field>Field content</Field>);
      expect(screen.getByText('Field content')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      render(<Field>Content</Field>);
      expect(document.querySelector('[data-slot="field"]')).toBeInTheDocument();
    });

    it('accepts orientation prop', () => {
      // orientation prop changes CSS classes via CVA, not data attributes
      render(<Field orientation="horizontal">Content</Field>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Field className="custom-field">Content</Field>);
      expect(document.querySelector('[data-slot="field"]')).toHaveClass('custom-field');
    });
  });

  describe('FieldContent', () => {
    it('renders children', () => {
      render(<FieldContent>Content here</FieldContent>);
      expect(screen.getByText('Content here')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      render(<FieldContent>Content</FieldContent>);
      expect(document.querySelector('[data-slot="field-content"]')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<FieldContent className="custom">Content</FieldContent>);
      expect(screen.getByText('Content')).toHaveClass('custom');
    });
  });

  describe('FieldDescription', () => {
    it('renders description text', () => {
      render(<FieldDescription>Enter your email address</FieldDescription>);
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      render(<FieldDescription>Description</FieldDescription>);
      expect(document.querySelector('[data-slot="field-description"]')).toBeInTheDocument();
    });
  });

  describe('FieldError', () => {
    it('renders single error message', () => {
      render(<FieldError>This field is required</FieldError>);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('renders multiple errors from array', () => {
      render(<FieldError errors={['Error 1', 'Error 2']} />);
      expect(screen.getByText('Error 1')).toBeInTheDocument();
      expect(screen.getByText('Error 2')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      render(<FieldError>Error message</FieldError>);
      expect(document.querySelector('[data-slot="field-error"]')).toBeInTheDocument();
    });

    it('renders nothing visible when no errors and no children', () => {
      const { container } = render(<FieldError />);
      const errorElement = container.querySelector('[data-slot="field-error"]');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement?.textContent).toBe('');
    });
  });

  describe('FieldGroup', () => {
    it('renders children in a group', () => {
      render(
        <FieldGroup>
          <div>Field 1</div>
          <div>Field 2</div>
        </FieldGroup>
      );
      expect(screen.getByText('Field 1')).toBeInTheDocument();
      expect(screen.getByText('Field 2')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      render(<FieldGroup>Content</FieldGroup>);
      expect(document.querySelector('[data-slot="field-group"]')).toBeInTheDocument();
    });
  });

  describe('FieldLabel', () => {
    it('renders label text', () => {
      render(<FieldLabel>Email</FieldLabel>);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      render(<FieldLabel>Label</FieldLabel>);
      expect(document.querySelector('[data-slot="field-label"]')).toBeInTheDocument();
    });
  });

  describe('FieldLegend', () => {
    it('renders legend text', () => {
      render(<FieldLegend>Legend text</FieldLegend>);
      expect(screen.getByText('Legend text')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      render(<FieldLegend>Legend</FieldLegend>);
      expect(document.querySelector('[data-slot="field-legend"]')).toBeInTheDocument();
    });

    it('accepts variant prop', () => {
      // Variant prop changes CSS classes, not attributes
      render(<FieldLegend variant="description">Small legend</FieldLegend>);
      expect(screen.getByText('Small legend')).toBeInTheDocument();
    });
  });

  describe('FieldSeparator', () => {
    it('has data-slot attribute', () => {
      render(<FieldSeparator />);
      expect(document.querySelector('[data-slot="field-separator"]')).toBeInTheDocument();
    });
  });

  describe('FieldSet', () => {
    it('renders as fieldset element with group role', () => {
      render(<FieldSet>Fields here</FieldSet>);
      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      render(<FieldSet>Content</FieldSet>);
      expect(document.querySelector('[data-slot="field-set"]')).toBeInTheDocument();
    });
  });

  describe('FieldTitle', () => {
    it('renders title text', () => {
      render(<FieldTitle>Section Title</FieldTitle>);
      expect(screen.getByText('Section Title')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      render(<FieldTitle>Title</FieldTitle>);
      expect(document.querySelector('[data-slot="field-title"]')).toBeInTheDocument();
    });
  });
});

describe('Section', () => {
  it('renders as section element by default', () => {
    render(<Section>Section content</Section>);
    const section = screen.getByText('Section content').closest('section');
    expect(section).toBeInTheDocument();
  });

  it('renders with custom element type via as prop', () => {
    render(<Section as="div">Div content</Section>);
    const div = screen.getByText('Div content').closest('div');
    expect(div).toBeInTheDocument();
    expect(div?.tagName).toBe('DIV');
  });

  it('applies custom className', () => {
    render(<Section className="custom-section">Content</Section>);
    const section = screen.getByText('Content').closest('section');
    expect(section).toHaveClass('custom-section');
  });
});

describe('Empty state components', () => {
  describe('Empty', () => {
    it('renders children', () => {
      render(<Empty>Empty state content</Empty>);
      expect(screen.getByText('Empty state content')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      render(<Empty>Content</Empty>);
      expect(document.querySelector('[data-slot="empty"]')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Empty className="custom-empty">Content</Empty>);
      expect(document.querySelector('[data-slot="empty"]')).toHaveClass('custom-empty');
    });
  });

  describe('EmptyHeader', () => {
    it('renders children', () => {
      render(<EmptyHeader>Header content</EmptyHeader>);
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      render(<EmptyHeader>Header</EmptyHeader>);
      expect(document.querySelector('[data-slot="empty-header"]')).toBeInTheDocument();
    });
  });

  describe('EmptyMedia', () => {
    it('renders children', () => {
      render(<EmptyMedia>Icon</EmptyMedia>);
      expect(screen.getByText('Icon')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      render(<EmptyMedia>Icon</EmptyMedia>);
      expect(document.querySelector('[data-slot="empty-icon"]')).toBeInTheDocument();
    });

    it('forwards variant prop as data attribute', () => {
      render(<EmptyMedia variant="icon">Icon</EmptyMedia>);
      expect(document.querySelector('[data-slot="empty-icon"]')).toHaveAttribute(
        'data-variant',
        'icon'
      );
    });
  });

  describe('EmptyTitle', () => {
    it('renders title', () => {
      render(<EmptyTitle>No results found</EmptyTitle>);
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      render(<EmptyTitle>Title</EmptyTitle>);
      expect(document.querySelector('[data-slot="empty-title"]')).toBeInTheDocument();
    });
  });

  describe('EmptyDescription', () => {
    it('renders description', () => {
      render(<EmptyDescription>Try adjusting your search</EmptyDescription>);
      expect(screen.getByText('Try adjusting your search')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      render(<EmptyDescription>Description</EmptyDescription>);
      expect(document.querySelector('[data-slot="empty-description"]')).toBeInTheDocument();
    });
  });

  describe('EmptyContent', () => {
    it('renders children', () => {
      render(<EmptyContent>Content area</EmptyContent>);
      expect(screen.getByText('Content area')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      render(<EmptyContent>Content</EmptyContent>);
      expect(document.querySelector('[data-slot="empty-content"]')).toBeInTheDocument();
    });
  });

  it('renders complete empty state composition', () => {
    render(
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">icon</EmptyMedia>
          <EmptyTitle>No messages</EmptyTitle>
          <EmptyDescription>Your inbox is empty</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <button type="button">Compose</button>
        </EmptyContent>
      </Empty>
    );

    expect(screen.getByText('No messages')).toBeInTheDocument();
    expect(screen.getByText('Your inbox is empty')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Compose' })).toBeInTheDocument();
  });
});
