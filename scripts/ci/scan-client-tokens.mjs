import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Sanity API tokens are `sk` plus a long alphanumeric secret. The character
 * before `sk` must not be alphanumeric: client chunks contain encoded payloads
 * where `sk` sits in the middle of a longer run, and those are not tokens.
 *
 * `data:` URIs are removed before matching. Inlined base64 can contain an
 * `sk` run of 100 characters by chance, and that is not a token.
 */
export const SANITY_TOKEN_PATTERN = /(?<![A-Za-z0-9])sk[A-Za-z0-9]{100,}/;

const MIN_TOKEN_VALUE_LENGTH = 8;
const PRERENDER_EXTENSIONS = ['.html', '.rsc'];

export const BUNDLE_DIRECTORIES = [
  { relativePath: '.next/static', required: true },
  { relativePath: 'dist/static', required: false },
  { relativePath: '.open-next/assets', required: false },
  { relativePath: '.next/server/app', required: false, extensions: PRERENDER_EXTENSIONS },
  { relativePath: '.open-next/cache', required: false, extensions: PRERENDER_EXTENSIONS },
];

function withoutDataUris(contents) {
  return contents.replace(/(?:^|[^A-Za-z0-9])data:[^"'`\s)]*/g, ' ');
}

export function tokenValuesFromEnv(env) {
  const values = [];
  for (const [name, value] of Object.entries(env)) {
    if (!name.endsWith('TOKEN') || typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed.length < MIN_TOKEN_VALUE_LENGTH) continue;
    values.push({ name, value: trimmed });
  }
  return values;
}

export function scanContents(contents, tokenValues) {
  const visible = withoutDataUris(contents);
  const hits = [];
  if (SANITY_TOKEN_PATTERN.test(visible)) hits.push({ kind: 'sanity-pattern' });
  for (const entry of tokenValues) {
    if (visible.includes(entry.value)) hits.push({ kind: 'env-token', name: entry.name });
  }
  return hits;
}

function isDirectory(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function includedFile(name, extensions) {
  if (!extensions) return true;
  const lower = name.toLowerCase();
  return extensions.some((extension) => lower.endsWith(extension));
}

function walkFiles(directory, files, extensions) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) walkFiles(fullPath, files, extensions);
    else if (entry.isFile() && includedFile(entry.name, extensions)) files.push(fullPath);
  }
  return files;
}

export function scanBundles({ cwd, env, directories = BUNDLE_DIRECTORIES }) {
  const missing = [];
  const targets = [];
  for (const directory of directories) {
    const absolute = join(cwd, directory.relativePath);
    if (!isDirectory(absolute)) {
      if (directory.required) missing.push(directory.relativePath);
      continue;
    }
    targets.push({ ...directory, absolute });
  }
  if (missing.length > 0) return { ok: false, missing, findings: [] };

  const tokenValues = tokenValuesFromEnv(env);
  const findings = [];
  for (const target of targets) {
    for (const file of walkFiles(target.absolute, [], target.extensions)) {
      const contents = readFileSync(file).toString('latin1');
      for (const hit of scanContents(contents, tokenValues)) {
        findings.push({ file: relative(cwd, file), ...hit });
      }
    }
  }
  return { ok: findings.length === 0, missing: [], findings };
}

export function formatReport(result) {
  const lines = [];
  if (result.missing.length > 0) {
    lines.push('scan:client-tokens: client bundle not found.');
    for (const dir of result.missing) {
      lines.push(`Missing ${dir}. Run the production build before scanning.`);
    }
  }
  if (result.findings.length > 0) {
    lines.push('scan:client-tokens: secret material in a public bundle.');
    for (const finding of result.findings) {
      if (finding.kind === 'sanity-pattern') {
        lines.push(`${finding.file}: Sanity token pattern (sk followed by 100+ characters)`);
      } else {
        lines.push(`${finding.file}: value of ${finding.name}`);
      }
    }
  }
  return lines.join('\n');
}

function isDirectRun() {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isDirectRun()) {
  const result = scanBundles({ cwd: process.cwd(), env: process.env });
  if (!result.ok) {
    console.error(formatReport(result));
    process.exit(1);
  }
  console.log('scan:client-tokens: no Sanity tokens in client bundles or prerendered pages.');
}
