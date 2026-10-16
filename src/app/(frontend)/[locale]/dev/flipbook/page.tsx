import { notFound } from 'next/navigation';
import { Flipbook } from '@/components/blocks/objects/flipbook';
import { Section } from '@/components/ui/section';

/** Dev-only harness for Playwright and manual checks (`/en/dev/flipbook`). */
export default async function FlipbookHarness({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (process.env.NODE_ENV === 'production') notFound();
  const { page } = await searchParams;
  return (
    <Section>
      <Flipbook
        src="/api/dev/flipbook-sample"
        title="Annual Review 2026"
        filename="sample.pdf"
        startPage={Number(page) || 1}
      />
    </Section>
  );
}
