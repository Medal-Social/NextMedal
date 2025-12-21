import { codeToHtml } from 'shiki';
import CopyButton from './CopyButton';

export default async function Code({ value }: { value: { code: string; language?: string } }) {
  if (!value?.code) return null;

  try {
    const html = await codeToHtml(value.code, {
      lang: value.language || 'text',
      theme: 'github-dark',
    });

    return (
      <div className="relative my-6 overflow-hidden rounded-lg group">
        <CopyButton code={value.code} className="absolute top-3 right-3 z-10" />
        <div
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Scrollable code block needs to be keyboard accessible
          tabIndex={0}
          className="[&>pre]:!bg-[#0d1117] [&>pre]:!p-4 [&>pre]:!m-0 [&>pre]:overflow-x-auto"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki generates safe HTML
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  } catch (error) {
    console.error('Code highlighting failed:', error);
    return (
      <div className="relative my-6 overflow-hidden rounded-lg group bg-[#0d1117] p-4">
        <CopyButton code={value.code} className="absolute top-3 right-3 z-10" />
        <pre className="m-0 overflow-x-auto text-sm text-white">
          <code>{value.code}</code>
        </pre>
      </div>
    );
  }
}
