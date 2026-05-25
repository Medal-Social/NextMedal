#!/usr/bin/env tsx
/**
 * Post-clone setup: pull agent skills from installed dependencies.
 *
 * Runs `npx @tanstack/intent install`, which writes a small managed
 * block to AGENTS.md instructing your AI coding agent (Claude Code,
 * Cursor, Copilot, etc.) how to discover and load skills shipped by
 * the npm packages you depend on.
 *
 * Idempotent — safe to re-run after bumping any intent-enabled
 * dependency (e.g. @medalsocial/sdk, @medalsocial/meda).
 */
import { execSync } from 'node:child_process';

const run = (cmd: string): void => {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
};

console.log('Setting up NextMedal — pulling agent skills from dependencies...\n');
run('npx --yes @tanstack/intent install');

console.log('\n✓ Done. AGENTS.md now contains skill-loading guidance for your agent.');
console.log('  Re-run `pnpm intent` after bumping any intent-enabled dependency.');
