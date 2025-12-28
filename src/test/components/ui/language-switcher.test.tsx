import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@/test/setup';
import LocaleSwitcherSelect from '@/ui/language-switcher/LocaleSwitcherSelect';

// Mock dependencies
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: any) => {
    if (key === 'translationNotAvailable') return `Translation not available for ${params?.locale}`;
    if (key === 'goToHome') return `Go to ${params?.locale} Home`;
    return key;
  },
}));

// Mock sonner toast
const { mockToastInfo } = vi.hoisted(() => {
  return { mockToastInfo: vi.fn() };
});

vi.mock('sonner', () => ({
  toast: {
    info: mockToastInfo,
  },
}));

// Mock Dropdown Menu components to avoid Radix UI environment issues
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ render }: { render: React.ReactElement }) => <div>{render}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div role="menu">{children}</div>
  ),
  DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuRadioGroup: ({ children, onValueChange }: any) => (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Mock component
    // biome-ignore lint/a11y/noStaticElementInteractions: Mock component
    <div
      data-testid="radio-group"
      onClick={(e: any) => {
        // Find the value from the clicked target or its closest parent
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
}));

describe('LocaleSwitcherSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    defaultValue: 'en',
    label: 'Select language',
    selectLanguageLabel: 'Select language',
    languageText: 'English',
    translationUrls: {
      en: '/en/about',
      nb: '/nb/om-oss',
    },
  };

  const children = [
    <option key="en" value="en">
      English
    </option>,
    <option key="nb" value="nb">
      Norsk
    </option>,
  ];

  it('navigates to translated URL when available', async () => {
    render(<LocaleSwitcherSelect {...defaultProps}>{children}</LocaleSwitcherSelect>);

    // Click Norwegian option
    const nbOption = screen.getByRole('menuitemradio', { name: /Norsk/i });
    fireEvent.click(nbOption);

    expect(mockPush).toHaveBeenCalledWith('/nb/om-oss');
    expect(mockToastInfo).not.toHaveBeenCalled();
  });

  it('shows toast with action when translation is missing', async () => {
    const propsWithoutTranslation = {
      ...defaultProps,
      translationUrls: {
        en: '/en/some-page',
        // nb missing
      },
    };

    render(<LocaleSwitcherSelect {...propsWithoutTranslation}>{children}</LocaleSwitcherSelect>);

    // Click Norwegian option
    const nbOption = screen.getByRole('menuitemradio', { name: /Norsk/i });
    fireEvent.click(nbOption);

    // Expect toast to be called
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockToastInfo).toHaveBeenCalled();

    // Verify toast arguments contain the action
    // Component uses default prop: 'This page is not available in {locale}'
    const toastCall = mockToastInfo.mock.calls[0];
    expect(toastCall[0]).toContain('not available');
    expect(toastCall[1]).toHaveProperty('action');
    expect(toastCall[1].action).toHaveProperty('label');
    expect(toastCall[1].action.label).toContain('home');
    expect(toastCall[1].action).toHaveProperty('onClick');

    // Simulate clicking the toast action
    toastCall[1].action.onClick();
    expect(mockPush).toHaveBeenCalledWith('/nb');
  });
});
