'use server';

import { draftMode } from 'next/headers';

export async function disableDraftMode() {
  const disable = (await draftMode()).disable();
  // Artificial delay to make the transition feel more deliberate
  const delay = new Promise((resolve) => setTimeout(resolve, 1000));
  await Promise.allSettled([disable, delay]);
}
