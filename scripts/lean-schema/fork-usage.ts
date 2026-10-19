/**
 * Fork usage report for the blocks removed from the NextMedal template (Vault plan
 * 2026-10-18, Task 26, spec D6). Forks keep their own copies; this only informs the
 * PR descriptions (medal-customers and upstream).
 *
 * Usage (from apps/NextMedal):
 *   pnpm exec tsx scripts/lean-schema/fork-usage.ts            # code: schema + renderer per app
 *   pnpm exec tsx scripts/lean-schema/fork-usage.ts --content  # also published page counts (read-only Sanity queries)
 * Prints Markdown tables.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const TYPES = [
  'team',
  'contact',
  'breadcrumbs',
  'latest-articles',
  'pricing-comparison',
  'lead-magnet',
  'videoHero',
  'component-gallery',
  'component.library',
] as const;

const APPS_DIR = resolve(__dirname, '../../..');
const REPO = resolve(APPS_DIR, '..');

function files(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

function sourceHas(dir: string, pattern: RegExp): boolean {
  return files(dir).some((file) => pattern.test(readFileSync(file, 'utf8')));
}

const escapeType = (type: string) => type.replace(/[.-]/g, (c) => `\\${c}`);
const apps = readdirSync(APPS_DIR).filter(
  (name) => name !== 'NextMedal' && existsSync(join(APPS_DIR, name, 'src'))
);

console.log('| Block | Schema defined in | Rendered by |');
console.log('|---|---|---|');
for (const type of TYPES) {
  const defined = apps.filter((app) =>
    sourceHas(
      join(APPS_DIR, app, 'src/sanity/schemaTypes'),
      new RegExp(`name: ['"]${escapeType(type)}['"]`)
    )
  );
  const rendered = apps.filter((app) =>
    sourceHas(join(APPS_DIR, app, 'src/components'), new RegExp(`case ['"]${escapeType(type)}['"]`))
  );
  console.log(`| ${type} | ${defined.join(', ') || '—'} | ${rendered.join(', ') || '—'} |`);
}

if (process.argv.includes('--content')) {
  type App = { app: string; sanity_project_id?: string };
  const config = JSON.parse(readFileSync(join(REPO, 'scripts/ci/apps.json'), 'utf8')) as App[];
  const query = `{${TYPES.map((type) =>
    type === 'component.library'
      ? `"${type}": count(*[_type == "${type}"])`
      : `"${type}": count(*[defined(modules) && "${type}" in modules[]._type])`
  ).join(', ')}}`;
  console.log(
    '\nPublished documents whose top-level `modules` hold the block (dataset `production`):\n'
  );
  console.log(`| App | ${TYPES.join(' | ')} |`);
  console.log(`|---|${TYPES.map(() => '---').join('|')}|`);
  for (const { app, sanity_project_id: projectId } of config) {
    if (!projectId) continue;
    const out = execFileSync(
      'pnpm',
      [
        'exec',
        'sanity',
        'documents',
        'query',
        query,
        '--project-id',
        projectId,
        '--dataset',
        'production',
        '--api-version',
        '2025-08-15',
      ],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    );
    // pnpm may print warnings before the JSON.
    const counts = JSON.parse(out.slice(out.indexOf('{'))) as Record<string, number>;
    console.log(`| ${app} | ${TYPES.map((type) => counts[type] || '·').join(' | ')} |`);
  }
}
