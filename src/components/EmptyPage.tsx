import { ExternalLink, LayoutTemplate, Library } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { buttonVariants } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Section } from '@/components/ui/section';

// Collection config error types (kept for backward compatibility)
type CollectionConfigError =
  | { type: 'SITE_SETTINGS_MISSING'; locale: string }
  | { type: 'FRONTPAGE_MISSING'; collectionType: string; field: string };

interface EmptyPageProps {
  type?: 'page' | 'collection';
  error?: CollectionConfigError;
}

export function EmptyPage({ type = 'page', error }: EmptyPageProps = {}) {
  const setupT = useTranslations('setup');
  const collectionT = useTranslations('collectionSetup');

  // Determine which translations to use based on type
  const isCollection = type === 'collection';
  const t = isCollection ? collectionT : setupT;

  // Determine studio URL based on error type
  const getStudioUrl = () => {
    if (!isCollection) {
      return '/studio/structure/page';
    }

    if (error?.type === 'SITE_SETTINGS_MISSING') {
      return '/studio/structure/site';
    }

    if (error?.type === 'FRONTPAGE_MISSING') {
      return `/studio/structure/site;collection=${error.field}`;
    }

    return '/studio';
  };

  const studioUrl = getStudioUrl();

  // Get error-specific details for collection errors
  const getErrorKey = () => {
    if (!isCollection || !error) return null;
    return error.type === 'SITE_SETTINGS_MISSING' ? 'siteSettingsMissing' : 'frontpageMissing';
  };

  const errorKey = getErrorKey();

  // Render collection setup instructions
  if (isCollection && errorKey) {
    const isSiteSettingsMissing = error?.type === 'SITE_SETTINGS_MISSING';
    const locale = error?.type === 'SITE_SETTINGS_MISSING' ? error.locale : '';
    const collection =
      error?.type === 'FRONTPAGE_MISSING' ? error.collectionType.replace('collection.', '') : '';

    return (
      <Section className="min-h-[50vh] flex items-center justify-center">
        <Empty className="border-none max-w-2xl mx-auto">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Library />
            </EmptyMedia>
            <EmptyTitle>{t(`${errorKey}.title`)}</EmptyTitle>
            <EmptyDescription className="text-left space-y-4">
              <p className="text-center">{t(`${errorKey}.description`, { locale, collection })}</p>

              <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm">
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    <strong>{t(`${errorKey}.step1`)}</strong>
                  </li>
                  <li>
                    <strong>{t(`${errorKey}.step2`, { locale, collection })}</strong>
                  </li>
                  <li>
                    <strong>{t(`${errorKey}.step3`)}</strong>
                  </li>
                  {isSiteSettingsMissing && (
                    <li>
                      <strong>{t('siteSettingsMissing.step4')}</strong>
                    </li>
                  )}
                </ol>
              </div>
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <a
              href={studioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'default' })}
            >
              {t('openStudio')}
            </a>
          </EmptyContent>
        </Empty>
      </Section>
    );
  }

  // Default page setup instructions
  return (
    <Section className="min-h-[50vh] flex items-center justify-center">
      <Empty className="border-none max-w-2xl mx-auto">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LayoutTemplate />
          </EmptyMedia>
          <EmptyTitle>{setupT('title')}</EmptyTitle>
          <EmptyDescription className="text-left space-y-4">
            <p className="text-center">{setupT('description')}</p>

            <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm">
              <p className="font-medium">{setupT('quickSetup')}</p>

              <ol className="list-decimal list-inside space-y-2">
                <li>
                  <strong>{setupT('step1.title')}</strong>
                  <br />
                  <span className="text-muted-foreground ml-6">
                    {setupT('step1.description', { studioUrl: '' })}{' '}
                    <a
                      href={studioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {studioUrl}
                      <ExternalLink className="size-3" />
                    </a>
                  </span>
                </li>

                <li>
                  <strong>{setupT('step2.title')}</strong>
                  <br />
                  <span className="text-muted-foreground ml-6">{setupT('step2.description')}</span>
                </li>

                <li>
                  <strong>{setupT('step3.title')}</strong>
                  <br />
                  <span className="text-muted-foreground ml-6">
                    {setupT.rich('step3.description', {
                      slug: (children) => (
                        <code className="bg-background px-1 py-0.5 rounded">{children}</code>
                      ),
                    })}
                  </span>
                </li>
              </ol>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-2">
              {setupT.rich('needHelp', {
                readme: (children) => (
                  <a
                    href="https://github.com/Medal-Social/NextMedal#readme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {children}
                  </a>
                ),
                contact: (children) => (
                  <a
                    href="https://www.medalsocial.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {children}
                  </a>
                ),
              })}
            </p>
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <a
            href={studioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: 'default' })}
          >
            {setupT('openStudio')}
          </a>
        </EmptyContent>
      </Empty>
    </Section>
  );
}
