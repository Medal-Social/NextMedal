// scripts/lean-schema/cut-fixtures.ts
// Usage: pnpm exec tsx scripts/lean-schema/cut-fixtures.ts <path/to/data.ndjson>
// The fixtures are committed to a PUBLIC repo: types are allowlisted, never
// secrets (mux.apiKey, sanity.previewUrlSecret), system docs or form submissions.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const [, , input] = process.argv;
if (!input) throw new Error('Pass the export data.ndjson path');

const KEEP = new Set([
  'page',
  'site',
  'translation.metadata',
  'pricing',
  'form',
  'logo',
  'banner',
  'person',
  'article.category',
  'docs.category',
  'placement',
  'redirect',
  'component.library',
  // Orphan types with no schema (spec §3): kept so the delete plan is tested.
  'navigation',
  'global-module',
  'testimonial',
  'intranet.department',
  'global-layout',
  'gallery',
  'announcement',
]);

type Doc = { _id: string; _type: string };
const all = readFileSync(input, 'utf8')
  .split('\n')
  .filter((line) => line.trim())
  .map((line) => JSON.parse(line) as Doc);

const docs = all.filter((doc) => KEEP.has(doc._type)).sort((a, b) => a._id.localeCompare(b._id));
// Every id + type in the dataset (no content): lets tests tell a dangling reference from a real one.
const ids = all
  .filter((doc) => !doc._type.startsWith('mux.') && !doc._type.startsWith('sanity.'))
  .map(({ _id, _type }) => ({ _id, _type }))
  .sort((a, b) => a._id.localeCompare(b._id));

mkdirSync('tests/fixtures/lean-schema', { recursive: true });
writeFileSync('tests/fixtures/lean-schema/documents.json', `${JSON.stringify(docs, null, 2)}\n`);
writeFileSync('tests/fixtures/lean-schema/all-ids.json', `${JSON.stringify(ids, null, 2)}\n`);
console.log(`wrote ${docs.length} documents, ${ids.length} ids`);
