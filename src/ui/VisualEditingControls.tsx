import { draftMode } from 'next/headers';
import { VisualEditing } from 'next-sanity/visual-editing';
import DraftModeControls from './DraftModeControls';

export default async function VisualEditingControls() {
  const { isEnabled } = await draftMode();

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      <VisualEditing />
      <DraftModeControls />
    </>
  );
}
