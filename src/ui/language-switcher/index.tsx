import { getCurrentPage } from '@/lib/getCurrentPage';
import LocaleSwitcherClient from './LocaleSwitcherClient';

interface LocaleSwitcherProps {
  className?: string;
  dropdownAlign?: 'start' | 'end' | 'center';
}

export default async function LocaleSwitcher({ className, dropdownAlign }: LocaleSwitcherProps) {
  // Fetch the current page with translations on the server
  const page = await getCurrentPage();

  // Transform to the shape expected by the client component
  const serverPage = page
    ? {
        _type: page._type,
        slug: page.metadata?.slug?.current,
        language: page.language,
        translations: page.translations,
      }
    : undefined;

  return (
    <LocaleSwitcherClient
      className={className}
      dropdownAlign={dropdownAlign}
      serverPage={serverPage}
    />
  );
}
