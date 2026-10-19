/**
 * The page's one `modules` array (Vault spec 2026-10-18 §2): every block lives
 * here so duplicate, copy/paste across pages and languages, and drag work.
 * Insert groups and names come from page-blocks.ts. Deprecated and developer
 * types stay accepted for stored content; ModulesInput keeps them out of every
 * insert menu. Known gap: the Presentation overlay's insert menu lists every
 * type in `of` — delete videoHero soon after the migration (Task 35).
 */
import { defineField } from 'sanity';
import ModulesInput from '../../components/ModulesInput';
import {
  DEPRECATED_BLOCK_NAMES,
  DEVELOPER_BLOCK_NAMES,
  INSERT_GROUPS,
  PAGE_BLOCK_NAMES,
} from '../page-blocks';

export default defineField({
  name: 'modules',
  title: 'Page content',
  description: 'The blocks of this page, top to bottom.',
  type: 'array',
  of: [...PAGE_BLOCK_NAMES, ...DEVELOPER_BLOCK_NAMES, ...DEPRECATED_BLOCK_NAMES].map((type) => ({
    type,
  })),
  components: { input: ModulesInput },
  options: {
    insertMenu: {
      views: [
        { name: 'grid', previewImageUrl: (schemaType) => `/block-previews/${schemaType}.png` },
        { name: 'list' },
      ],
      groups: INSERT_GROUPS.map((group) => ({ name: group.name, of: [...group.of] })),
    },
  },
});
