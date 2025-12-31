import { getTranslations } from 'next-intl/server';
import HeaderThemeToggle from './ThemeToggle';

export default async function ThemeToggleWrapper({
  className,
  dropdownAlign,
}: {
  className?: string;
  dropdownAlign?: 'start' | 'end' | 'center';
}) {
  const t = await getTranslations('ThemeSelector');

  const labels = {
    theme: t('theme'),
    light: t('light'),
    dark: t('dark'),
    system: t('system'),
  };

  return <HeaderThemeToggle className={className} dropdownAlign={dropdownAlign} labels={labels} />;
}
