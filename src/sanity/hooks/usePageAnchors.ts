import { useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { anchorChoices } from '@/lib/block-anchors';

export type PageAnchor = {
  anchor: string;
  label: string;
  type: string;
  _key: string;
  isExplicit: boolean;
};

// Define types for Sanity document structure
type SanityModule = {
  _type: string;
  _key: string;
};

type SanityDoc = {
  _id: string;
  modules?: SanityModule[];
};

export function usePageAnchors(pageRef: string | undefined) {
  const [anchors, setAnchors] = useState<PageAnchor[]>([]);
  const [loading, setLoading] = useState(false);
  const client = useClient({ apiVersion: '2024-01-01' });

  useEffect(() => {
    if (!pageRef) {
      setAnchors([]);
      return;
    }

    const fetchAnchors = async () => {
      setLoading(true);
      try {
        const query = `*[_id in [$id, "drafts." + $id]] {
          _id,
          modules[] {
            _type,
            _key
          }
        }`;

        const docs = await client.fetch<SanityDoc[]>(query, { id: pageRef });
        const draft = docs.find((d) => d._id.startsWith('drafts.'));
        const published = docs.find((d) => !d._id.startsWith('drafts.'));
        const modules = draft?.modules || published?.modules || [];

        // Only the fixed anchors the site renders (Vault spec 2026-10-18 D3).
        setAnchors(Array.isArray(modules) ? anchorChoices(modules) : []);
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: Client-side debugging
        console.error('Failed to fetch page anchors:', error);
        setAnchors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnchors();
  }, [pageRef, client]);

  return { anchors, loading };
}
