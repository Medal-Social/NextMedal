'use client';

import type { ObjectFieldProps } from 'sanity';

/**
 * Custom field component that renders the input without the field title/label wrapper.
 * Used for the metadata object to avoid showing "metadata" as a label.
 */
export default function PageIdentityField(props: ObjectFieldProps) {
  // Only render the input component, skip the field wrapper (title, description, etc.)
  return <>{props.children}</>;
}
