'use client';

import { Loader2 } from 'lucide-react';
// import { useDraftModeEnvironment } from 'next-sanity/hooks'
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { VscBeakerStop } from 'react-icons/vsc';
import { disableDraftMode } from './actions/disableDraftMode';

export default function DraftModeControls() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // const environment = useDraftModeEnvironment()
  // if (!['live', 'unknown'].includes(environment)) return null

  const disable = () =>
    startTransition(async () => {
      await disableDraftMode();
      router.refresh();
    });

  return (
    <details className="backdrop-blur-lg backdrop-saturate-200 fixed right-4 bottom-0 rounded-t bg-amber-200/90 text-xs shadow-xl not-hover:opacity-50 open:opacity-100">
      <summary className="p-2">Draft Mode</summary>

      <menu className="animate-fade-to-r p-2 pt-0">
        <li>
          {pending ? (
            <div className="inline-flex items-center gap-1 py-0.5">
              <Loader2 className="size-3 shrink-0 animate-spin" />
              Disabling draft mode...
            </div>
          ) : (
            <button
              type="button"
              className="inline-flex items-center gap-1 py-0.5 hover:underline"
              onClick={disable}
              disabled={pending}
            >
              <VscBeakerStop className="shrink-0" />
              Disable Draft Mode
            </button>
          )}
        </li>
      </menu>
    </details>
  );
}
