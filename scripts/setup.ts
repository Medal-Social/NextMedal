#!/usr/bin/env tsx
/**
 * Post-clone setup: pull agent skills from installed dependencies.
 *
 * Runs the locally-pinned `@tanstack/intent` via `pnpm exec`, which
 * writes a small managed block to AGENTS.md instructing your AI
 * coding agent (Claude Code, Cursor, Copilot, etc.) how to discover
 * and load skills shipped by the npm packages you depend on.
 *
 * Idempotent — safe to re-run after bumping any intent-enabled
 * dependency (e.g. @medalsocial/sdk, @medalsocial/meda).
 *
 * Uses `pnpm exec` (NOT `npx`) so the locked devDependency version
 * runs every time. Bypassing the lockfile via `npx` would make
 * AGENTS.md output non-deterministic across environments and break
 * the `intent-sync` CI gate with drift unrelated to repo changes.
 */
import { execSync } from 'node:child_process';

const run = (cmd: string): void => {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
};

console.log('Setting up NextMedal — pulling agent skills from dependencies...\n');
run('pnpm exec intent install');

console.log('\n✓ Done. AGENTS.md now contains skill-loading guidance for your agent.');
console.log('  Re-run `pnpm intent` after bumping any intent-enabled dependency.');
