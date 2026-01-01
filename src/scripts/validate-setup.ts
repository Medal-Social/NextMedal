#!/usr/bin/env tsx
/**
 * Setup Validation Script
 * Run with: pnpm setup:check
 *
 * Checks if your local environment is properly configured to run NextMedal
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

type CheckResult = {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  fix?: string;
};

const results: CheckResult[] = [];

function check(name: string, condition: boolean, message: string, fix?: string): void {
  results.push({
    name,
    status: condition ? 'pass' : 'fail',
    message: condition ? `✅ ${message}` : `❌ ${message}`,
    fix: condition ? undefined : fix,
  });
}

function warn(name: string, condition: boolean, message: string, suggestion?: string): void {
  if (!condition) {
    results.push({
      name,
      status: 'warn',
      message: `⚠️  ${message}`,
      fix: suggestion,
    });
  }
}

// biome-ignore lint/suspicious/noConsole: CLI script requires console output
console.log('🔍 Validating NextMedal setup...\n');

// Check 1: Node version
const nodeVersion = process.versions.node;
const majorVersion = Number.parseInt(nodeVersion.split('.')[0] || '0', 10);
check(
  'Node.js Version',
  majorVersion >= 24,
  `Node.js ${nodeVersion} is installed`,
  `Please upgrade to Node.js 24 or later. Visit https://nodejs.org/`
);

// Check 2: .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
const envLocalExists = fs.existsSync(envLocalPath);
check(
  '.env.local File',
  envLocalExists,
  '.env.local file exists',
  'Run: cp .env.example .env.local'
);

// Check 3: Required env vars (if .env.local exists)
if (envLocalExists) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  const envLines = envContent.split('\n');
  const envVars = new Map<string, string>();

  for (const line of envLines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        envVars.set(key, value);
      }
    }
  }

  check(
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    !!envVars.get('NEXT_PUBLIC_SANITY_PROJECT_ID')?.trim(),
    'NEXT_PUBLIC_SANITY_PROJECT_ID is set',
    'Get your project ID from https://www.sanity.io/manage'
  );

  check(
    'NEXT_PUBLIC_SANITY_DATASET',
    !!envVars.get('NEXT_PUBLIC_SANITY_DATASET')?.trim(),
    'NEXT_PUBLIC_SANITY_DATASET is set',
    'Set to "production" or your dataset name'
  );

  check(
    'NEXT_PUBLIC_BASE_URL',
    !!envVars.get('NEXT_PUBLIC_BASE_URL')?.trim(),
    'NEXT_PUBLIC_BASE_URL is set',
    'Set to http://localhost:3000 for local development'
  );

  warn(
    'NEXT_PUBLIC_SANITY_BROWSER_TOKEN',
    !!envVars.get('NEXT_PUBLIC_SANITY_BROWSER_TOKEN')?.trim(),
    'NEXT_PUBLIC_SANITY_BROWSER_TOKEN is not set (optional but recommended)',
    'Create a viewer token at https://www.sanity.io/manage → Your Project → API → Tokens'
  );
}

// Check 4: node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
check(
  'Dependencies Installed',
  fs.existsSync(nodeModulesPath),
  'node_modules directory exists',
  'Run: pnpm install'
);

// Check 5: pnpm-lock.yaml exists
const pnpmLockPath = path.join(process.cwd(), 'pnpm-lock.yaml');
check(
  'pnpm Lock File',
  fs.existsSync(pnpmLockPath),
  'pnpm-lock.yaml exists (using pnpm package manager)',
  'Install pnpm: npm install -g pnpm'
);

// Check 6: Important directories exist
const srcPath = path.join(process.cwd(), 'src');
check('Source Directory', fs.existsSync(srcPath), 'src/ directory exists');

const sanityConfigPath = path.join(process.cwd(), 'sanity.config.ts');
check('Sanity Config', fs.existsSync(sanityConfigPath), 'Sanity configuration exists');

// Print results
// biome-ignore lint/suspicious/noConsole: CLI script requires console output
console.log('════════════════════════════════════════\n');

const passed = results.filter((r) => r.status === 'pass').length;
const failed = results.filter((r) => r.status === 'fail').length;
const warned = results.filter((r) => r.status === 'warn').length;

for (const result of results) {
  // biome-ignore lint/suspicious/noConsole: CLI script requires console output
  console.log(result.message);
  if (result.fix) {
    // biome-ignore lint/suspicious/noConsole: CLI script requires console output
    console.log(`   → ${result.fix}\n`);
  }
}

// biome-ignore lint/suspicious/noConsole: CLI script requires console output
console.log('\n════════════════════════════════════════');
// biome-ignore lint/suspicious/noConsole: CLI script requires console output
console.log(`\n📊 Summary: ${passed} passed, ${failed} failed, ${warned} warnings\n`);

if (failed === 0) {
  // biome-ignore lint/suspicious/noConsole: CLI script requires console output
  console.log('✨ Setup looks good! Run `pnpm dev` to start the development server.\n');
  // biome-ignore lint/suspicious/noConsole: CLI script requires console output
  console.log('📝 Next steps:');
  // biome-ignore lint/suspicious/noConsole: CLI script requires console output
  console.log('   1. Run: pnpm dev');
  // biome-ignore lint/suspicious/noConsole: CLI script requires console output
  console.log('   2. Open: http://localhost:3000/studio');
  // biome-ignore lint/suspicious/noConsole: CLI script requires console output
  console.log('   3. Create a Page document with slug "index"');
  // biome-ignore lint/suspicious/noConsole: CLI script requires console output
  console.log('   4. Publish it and visit http://localhost:3000\n');
  process.exit(0);
}
// biome-ignore lint/suspicious/noConsole: CLI script requires console output
console.log('❌ Please fix the failed checks above before running the dev server.\n');
process.exit(1);
