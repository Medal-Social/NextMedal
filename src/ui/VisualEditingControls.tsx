import { SanityLive, fetchSanityLive } from '@/sanity/lib/fetch';
import { VisualEditing, groq } from 'next-sanity';
import { draftMode } from 'next/headers';
import DraftModeControls from './DraftModeControls';

export default async function VisualEditingControls() {
  const globalModules = await fetchSanityLive({
    query: groq`*[_type == 'global-module']{
			_id,
			path,
			excludePaths[]
		}`,
  });

  return (
    <>
      <SanityLive />
      {(await draftMode()).isEnabled && (
        <>
          <VisualEditing />
          <DraftModeControls globalModules={globalModules} />
        </>
      )}
    </>
  );
}
