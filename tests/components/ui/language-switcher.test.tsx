import { fireEvent, render, screen } from '@tests/setup/providers';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkTranslationAvailability } from '@/app/actions/check-translation';
import LocaleSwitcherSelect from '@/components/blocks/layout/language-switcher/LocaleSwitcherSelect';
import { TranslationDialog } from '@/components/TranslationDialog';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock server action
vi.mock('@/app/actions/check-translation', () => ({
  checkTranslationAvailability: vi.fn(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

// Mock Dropdown Menu components to avoid Radix UI environment issues
vi.mock('@/components/ui/dropdown-menu', () => {
  const { useState } = require('react');
  return {
    DropdownMenu: ({ children, open, onOpenChange }: any) => {
      const [internalOpen, setInternalOpen] = useState(false);
      const isOpen = open !== undefined ? open : internalOpen;
      const _handleOpenChange = (newOpen: boolean) => {
        if (onOpenChange) onOpenChange(newOpen);
        if (open === undefined) setInternalOpen(newOpen);
      };

      return <div data-dropdown-open={isOpen}>{children}</div>;
    },
    DropdownMenuTrigger: ({ render }: any) => {
      if (!render) return null;
      return <div>{render}</div>;
    },
    DropdownMenuContent: ({ children }: any) => {
      // Check parent's open state
      const parent = document.querySelector('[data-dropdown-open="true"]');
      return parent ? <div role="menu">{children}</div> : null;
    },
    DropdownMenuRadioGroup: ({ children, onValueChange }: any) => (
      // biome-ignore lint/a11y/useKeyWithClickEvents: Mock component
      // biome-ignore lint/a11y/noStaticElementInteractions: Mock component
      <div
        data-testid="radio-group"
        onClick={(e: any) => {
          const target = e.target.closest('[data-value]');
          if (target?.dataset.value) {
            onValueChange(target.dataset.value);
          }
        }}
      >
        {children}
      </div>
    ),
    DropdownMenuRadioItem: ({ children, value }: any) => (
      <button type="button" role="menuitemradio" aria-checked={false} data-value={value}>
        {children}
      </button>
    ),
  };
});

// Mock AlertDialog components
vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  AlertDialogContent: ({ children }: any) => <div role="alertdialog">{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: any) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogAction: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// Mock Tooltip components
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ render, children }: any) => <div>{render || children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

// Mock Spinner component
vi.mock('@/components/ui/spinner', () => ({
  Spinner: () => <div className="animate-spin">Loading...</div>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Languages: () => <svg data-testid="languages-icon" />,
}));

// Mock utils
vi.mock('@/lib/utils/index', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('LocaleSwitcherSelect', () => {
  const _mockCheckTranslation = vi.mocked(checkTranslationAvailability);

  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).location;
    (window as any).location = { pathname: '/about' };
    sessionStorage.clear();
  });

  const defaultProps = {
    defaultValue: 'en',
    label: 'Change language',
  };

  const localeOptions = (
    <>
      <option value="en">English</option>
      <option value="nb">Norsk</option>
      <option value="ar">العربية</option>
    </>
  );

  it('should render language switcher button', () => {
    render(<LocaleSwitcherSelect {...defaultProps}>{localeOptions}</LocaleSwitcherSelect>);

    const trigger = screen.getByRole('button', { name: /change language/i });
    expect(trigger).toBeInTheDocument();
  });

  it('should extract locale options from children', () => {
    const { container } = render(
      <LocaleSwitcherSelect {...defaultProps}>{localeOptions}</LocaleSwitcherSelect>
    );

    // Component should have rendered with the children
    expect(container).toBeInTheDocument();
  });
});

describe('TranslationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('should not render when no translation request exists', () => {
    const { container } = render(<TranslationDialog />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when translation request exists in sessionStorage', () => {
    const request = {
      targetLocale: 'nb',
      targetLocaleName: 'Norsk',
      availableLocales: [{ locale: 'en', url: '/about' }],
      timestamp: Date.now(),
    };

    sessionStorage.setItem('translation-request', JSON.stringify(request));
    window.dispatchEvent(new Event('translation-request'));

    render(<TranslationDialog />);

    expect(screen.getByText('title')).toBeInTheDocument();
  });

  it('should display available locales with quick-switch buttons', () => {
    const request = {
      targetLocale: 'nb',
      targetLocaleName: 'Norsk',
      availableLocales: [
        { locale: 'en', url: '/about' },
        { locale: 'ar', url: '/ar/about' },
      ],
      timestamp: Date.now(),
    };

    sessionStorage.setItem('translation-request', JSON.stringify(request));
    window.dispatchEvent(new Event('translation-request'));

    render(<TranslationDialog />);

    expect(screen.getByText('availableIn')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'العربية' })).toBeInTheDocument();
  });

  it('should navigate to locale when clicking available locale button', () => {
    const request = {
      targetLocale: 'nb',
      targetLocaleName: 'Norsk',
      availableLocales: [
        { locale: 'en', url: '/about' },
        { locale: 'ar', url: '/ar/about' },
      ],
      timestamp: Date.now(),
    };

    sessionStorage.setItem('translation-request', JSON.stringify(request));
    window.dispatchEvent(new Event('translation-request'));

    render(<TranslationDialog />);

    const englishButton = screen.getByRole('button', { name: 'English' });
    fireEvent.click(englishButton);

    expect(mockPush).toHaveBeenCalledWith('/about');
    expect(sessionStorage.getItem('translation-request')).toBeNull();
  });

  it('should ignore stale requests older than 10 seconds', () => {
    const request = {
      targetLocale: 'nb',
      targetLocaleName: 'Norsk',
      availableLocales: [],
      timestamp: Date.now() - 11000,
    };

    sessionStorage.setItem('translation-request', JSON.stringify(request));
    window.dispatchEvent(new Event('translation-request'));

    const { container } = render(<TranslationDialog />);

    expect(container.firstChild).toBeNull();
    expect(sessionStorage.getItem('translation-request')).toBeNull();
  });

  it('should handle invalid JSON in sessionStorage gracefully', () => {
    sessionStorage.setItem('translation-request', 'invalid-json');
    window.dispatchEvent(new Event('translation-request'));

    const { container } = render(<TranslationDialog />);

    expect(container.firstChild).toBeNull();
  });
});
