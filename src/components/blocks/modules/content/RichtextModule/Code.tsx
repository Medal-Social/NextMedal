import { codeToHtml } from 'shiki';
import { logger } from '@/lib/core/logger';
import CopyButton from './CopyButton';
import { Mermaid } from './Mermaid';

export default async function Code({ value }: { value: { code: string; language?: string } }) {
  if (!value?.code) return null;

  // Route to Mermaid renderer for diagrams
  if (value.language === 'mermaid') {
    return <Mermaid value={value as { code: string; language: 'mermaid' }} />;
  }

  try {
    const html = await codeToHtml(value.code, {
      lang: value.language || 'text',
      theme: 'github-dark',
    });

    return (
      <div className="relative my-6 overflow-hidden rounded-lg border border-zinc-700 group bg-[#0C1117]">
        {value.language && value.language !== 'text' && (
          <div className="absolute top-0 left-0 rounded-br-lg border-b border-r border-zinc-700 bg-[#161b22] px-3 py-1 font-mono text-xs font-medium text-zinc-400">
            {value.language}
          </div>
        )}
        <CopyButton code={value.code} className="absolute top-3 right-3 z-10" />
        <div
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Scrollable code block needs to be keyboard accessible
          tabIndex={0}
          className={`[&>pre]:!bg-[#0C1117] [&>pre]:!p-4 [&>pre]:!m-0 [&>pre]:overflow-x-auto ${value.language && value.language !== 'text' ? '[&>pre]:!pt-10' : ''}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  } catch (error) {
    logger.error({ err: error }, 'Code highlighting failed');
    return (
      <div className="relative my-6 overflow-hidden rounded-lg border border-zinc-700 group bg-[#0C1117] p-4">
        <CopyButton code={value.code} className="absolute top-3 right-3 z-10" />
        <pre className="m-0 overflow-x-auto text-sm text-zinc-100">
          <code>{value.code}</code>
        </pre>
      </div>
    );
  }
}
