import { LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  return (
    <Section className="min-h-[50vh] flex items-center justify-center">
      <Empty className="border-none max-w-lg mx-auto">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LayoutTemplate />
          </EmptyMedia>
          <EmptyTitle>No Index Page Found</EmptyTitle>
          <EmptyDescription>
            There's no place like... index?
            <br className="mb-2" />
            Add a new Page document in your Sanity Studio (/studio) with the slug "index".
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            nativeButton={false}
            render={
              <a href="https://www.medalsocial.com" target="_blank" rel="noopener noreferrer">
                Visit Medal Social
              </a>
            }
            variant="outline"
          />
        </EmptyContent>
      </Empty>
    </Section>
  );
}
