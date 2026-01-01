import { ExternalLink, LayoutTemplate } from 'lucide-react';
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

export function EmptyPage() {
  const t = useTranslations('setup');

  const studioUrl = '/studio/structure/page';

  return (
    <Section className="min-h-[50vh] flex items-center justify-center">
      <Empty className="border-none max-w-2xl mx-auto">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LayoutTemplate />
          </EmptyMedia>
          <EmptyTitle>{t('title')}</EmptyTitle>
          <EmptyDescription className="text-left space-y-4">
            <p className="text-center">{t('description')}</p>

            <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm">
              <p className="font-medium">{t('quickSetup')}</p>

              <ol className="list-decimal list-inside space-y-2">
                <li>
                  <strong>{t('step1.title')}</strong>
                  <br />
                  <span className="text-muted-foreground ml-6">
                    {t('step1.description', { studioUrl: '' })}{' '}
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
                  <strong>{t('step2.title')}</strong>
                  <br />
                  <span className="text-muted-foreground ml-6">{t('step2.description')}</span>
                </li>

                <li>
                  <strong>{t('step3.title')}</strong>
                  <br />
                  <span className="text-muted-foreground ml-6">
                    {t.rich('step3.description', {
                      slug: (children) => (
                        <code className="bg-background px-1 py-0.5 rounded">{children}</code>
                      ),
                    })}
                  </span>
                </li>
              </ol>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-2">
              {t.rich('needHelp', {
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
            {t('openStudio')}
          </a>
        </EmptyContent>
      </Empty>
    </Section>
  );
}
