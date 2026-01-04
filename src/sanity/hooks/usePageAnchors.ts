import { useEffect, useState } from 'react';
import { useClient } from 'sanity';

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
  anchorId?: string;
  uid?: string;
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
            _key,
            "anchorId": options.anchorId,
            "uid": options.uid
          }
        }`;

        const docs = await client.fetch<SanityDoc[]>(query, { id: pageRef });
        const draft = docs.find((d) => d._id.startsWith('drafts.'));
        const published = docs.find((d) => !d._id.startsWith('drafts.'));
        const modules = draft?.modules || published?.modules || [];

        if (Array.isArray(modules)) {
          const allAnchors = modules
            .map((m) => {
              // Use explicit ID if available, otherwise fallback to _key (which is often the default ID in frontend)
              const explicitId = m.anchorId || m.uid;
              const finalId = explicitId || m._key;

              return {
                anchor: finalId,
                label: explicitId || `Default (${m._key.slice(0, 4)}...)`,
                type: m._type,
                _key: m._key,
                isExplicit: !!explicitId,
              };
            })
            // Always keep everything, as every module is technically linkable via key
            .filter((item) => item.anchor);

          // Deduplicate
          const uniqueAnchors = Array.from(
            new Map(allAnchors.map((item) => [item.anchor, item])).values()
          ) as PageAnchor[];
          setAnchors(uniqueAnchors);
        } else {
          setAnchors([]);
        }
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
