import { ExternalLink, LayoutTemplate } from 'lucide-react';
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
  // Detect if we're in dev mode by checking localhost
  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const studioUrl = isDev ? 'http://localhost:3000/studio' : '/studio';

  return (
    <Section className="min-h-[50vh] flex items-center justify-center">
      <Empty className="border-none max-w-2xl mx-auto">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LayoutTemplate />
          </EmptyMedia>
          <EmptyTitle>Welcome to NextMedal!</EmptyTitle>
          <EmptyDescription className="text-left space-y-4">
            <p className="text-center">
              Your site is running, but no index page exists yet. Let's create one!
            </p>

            <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm">
              <p className="font-medium">Quick Setup (3 steps):</p>

              <ol className="list-decimal list-inside space-y-2">
                <li>
                  <strong>Open Sanity Studio</strong>
                  <br />
                  <span className="text-muted-foreground ml-6">
                    Visit{' '}
                    <a
                      href={studioUrl}
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {studioUrl}
                      <ExternalLink className="size-3" />
                    </a>
                  </span>
                </li>

                <li>
                  <strong>Create an index page</strong>
                  <br />
                  <span className="text-muted-foreground ml-6">
                    Click "Create" → "Page" → Set slug to{' '}
                    <code className="bg-background px-1 py-0.5 rounded">index</code>
                  </span>
                </li>

                <li>
                  <strong>Publish it</strong>
                  <br />
                  <span className="text-muted-foreground ml-6">
                    Click the "Publish" button in the Studio, then refresh this page
                  </span>
                </li>
              </ol>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-2">
              Need help? Check the{' '}
              <a
                href="https://github.com/Medal-Social/NextMedal#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                README
              </a>{' '}
              or{' '}
              <a
                href="https://www.medalsocial.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                contact Medal Social
              </a>
            </p>
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <a href={studioUrl} className={buttonVariants({ variant: 'default' })}>
            Open Sanity Studio
          </a>
        </EmptyContent>
      </Empty>
    </Section>
  );
}
