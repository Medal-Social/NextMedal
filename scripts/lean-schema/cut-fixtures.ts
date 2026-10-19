// scripts/lean-schema/cut-fixtures.ts
// Usage: pnpm exec tsx scripts/lean-schema/cut-fixtures.ts <path/to/data.ndjson>
// The fixtures are committed to a PUBLIC repo: types are allowlisted, never
// secrets (mux.apiKey, sanity.previewUrlSecret), system docs or form submissions.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

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

const OUT = resolve(import.meta.dirname, '../../tests/fixtures/lean-schema');
// Never in all-ids.json: secrets and system docs (mux., sanity., system.) and form submissions (lead).
const UNSAFE = /^(mux\.|sanity\.|system\.)|^lead$/;

type Doc = { _id: string; _type: string };
// Code-unit order: stable across machines and locales, unlike localeCompare.
const byId = (a: Doc, b: Doc) => Number(a._id > b._id) - Number(a._id < b._id);
const all = readFileSync(input, 'utf8')
  .split('\n')
  .filter((line) => line.trim())
  .map((line) => JSON.parse(line) as Doc);

const docs = all.filter((doc) => KEEP.has(doc._type)).sort(byId);
// Every id + type in the dataset (no content): lets tests tell a dangling reference from a real one.
const ids = all
  .filter((doc) => !UNSAFE.test(doc._type))
  .map(({ _id, _type }) => ({ _id, _type }))
  .sort(byId);

mkdirSync(OUT, { recursive: true });
writeFileSync(resolve(OUT, 'documents.json'), `${JSON.stringify(docs, null, 2)}\n`);
writeFileSync(resolve(OUT, 'all-ids.json'), `${JSON.stringify(ids, null, 2)}\n`);
console.log(`wrote ${docs.length} documents, ${ids.length} ids`);
