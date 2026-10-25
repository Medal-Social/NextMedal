/**
 * The page's one `modules` array (Vault spec 2026-10-18 §2): every block lives
 * here so duplicate, copy/paste across pages and languages, and drag work.
 * Insert groups and names come from page-blocks.ts. The developer showcase
 * stays accepted for the /components page; ModulesInput keeps it out of every
 * insert menu.
 */
import { defineField } from 'sanity';
import ModulesInput from '../../components/ModulesInput';
import { DEVELOPER_BLOCK_NAMES, INSERT_GROUPS, PAGE_BLOCK_NAMES } from '../page-blocks';

export default defineField({
  name: 'modules',
  title: 'Page content',
  description: 'The blocks of this page, top to bottom.',
  type: 'array',
  of: [...PAGE_BLOCK_NAMES, ...DEVELOPER_BLOCK_NAMES].map((type) => ({ type })),
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
