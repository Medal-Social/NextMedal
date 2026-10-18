import dynamic from 'next/dynamic';
import { getLocale, getTranslations } from 'next-intl/server';
import { LOCALE_CONFIG, type SupportedLocale } from '@/i18n/config';
import type { FlipbookLabels, FlipbookProps } from './types';

// Code-split: only pages that render a flipbook download the viewer, its engine and styles.
const FlipbookViewer = dynamic(() =>
  import('./FlipbookViewer.client').then((mod) => mod.FlipbookViewer)
);

const LABEL_KEYS = [
  'previous',
  'next',
  'allPages',
  'zoom',
  'closeZoom',
  'close',
  'download',
  'fullscreen',
  'readFullscreen',
  'goToPage',
  'preparing',
  'pages',
  'page',
  'pageOf',
  'hintPointer',
  'hintTouch',
  'zoomHint',
  'error',
  'errorDetail',
  'poweredBy',
] as const satisfies readonly (keyof FlipbookLabels)[];

/** Server shell: resolves labels + text direction, then hydrates the client viewer. */
export default async function Flipbook(props: FlipbookProps) {
  const locale = (await getLocale()) as SupportedLocale;
  const t = await getTranslations('Flipbook');
  // next-intl would format {count}/{page}; keep the raw templates for the client to fill.
  const labels = {} as FlipbookLabels;
  for (const key of LABEL_KEYS) labels[key] = t.raw(key) as string;
  const dir = LOCALE_CONFIG[locale]?.dir ?? 'ltr';
  return (
    <>
      <FlipbookViewer {...props} labels={labels} dir={dir} />
      <noscript>
        <a href={props.src}>
          {labels.download}: {props.title || props.filename || 'PDF'}
        </a>
      </noscript>
    </>
  );
}
