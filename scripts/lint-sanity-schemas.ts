#!/usr/bin/env npx tsx
/**
 * Lint Sanity Schema Files
 *
 * Detects inline object definitions in array members that are missing the required `name` property.
 * Without a `name`, copy/paste functionality, GraphQL schema generation, and TypeGen won't work properly.
 *
 * @see https://www.sanity.io/docs/help/error-value-of-type-object-is-not-allowed-in-this-array-field
 *
 * Usage: npx tsx scripts/lint-sanity-schemas.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const SCHEMA_DIR = path.join(process.cwd(), 'src/sanity/schemaTypes');

interface LintIssue {
  file: string;
  line: number;
  message: string;
}

function findSchemaFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findSchemaFiles(fullPath));
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function lintFile(filePath: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Track brace depth to identify array contexts
  let inArrayOf = false;
  let braceDepth = 0;
  let arrayOfBraceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Track when we enter an 'of:' array definition
    if (/\bof:\s*\[/.test(line)) {
      inArrayOf = true;
      arrayOfBraceDepth = braceDepth;
    }

    // Count braces
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    braceDepth += openBraces - closeBraces;

    // Reset when we exit the array
    if (inArrayOf && braceDepth <= arrayOfBraceDepth && /\]/.test(line)) {
      inArrayOf = false;
    }

    // Pattern 1: defineArrayMember with type: 'object' but no name on same or next few lines
    if (/defineArrayMember\(\s*\{/.test(line)) {
      // Look at next 3 lines to see if there's a name property before type: 'object'
      const contextLines = lines.slice(i, i + 5).join('\n');

      if (/type:\s*['"]object['"]/.test(contextLines)) {
        // Check if name property exists before type
        const beforeType = contextLines.split(/type:\s*['"]object['"]/)[0];
        if (!/name:\s*['"]/.test(beforeType)) {
          issues.push({
            file: path.relative(process.cwd(), filePath),
            line: lineNum,
            message:
              'Inline object in defineArrayMember is missing required `name` property. This breaks copy/paste functionality.',
          });
        }
      }
    }

    // Pattern 2: Plain object literal { type: 'object', ... } without name in array context
    if (inArrayOf) {
      // Match opening brace of object that might be a type: 'object' without name
      if (/^\s*\{\s*$/.test(line) || /^\s*\{[^}]*$/.test(line)) {
        const contextLines = lines.slice(i, i + 5).join('\n');

        // Check if this is a type: 'object' definition
        if (/type:\s*['"]object['"]/.test(contextLines)) {
          const beforeType = contextLines.split(/type:\s*['"]object['"]/)[0];
          // Only flag if there's no name property and it's not using defineArrayMember
          if (!/name:\s*['"]/.test(beforeType) && !/defineArrayMember/.test(contextLines)) {
            issues.push({
              file: path.relative(process.cwd(), filePath),
              line: lineNum,
              message:
                'Inline object in array is missing required `name` property. Consider using defineArrayMember({ name: "...", type: "object", ... }).',
            });
          }
        }
      }
    }
  }

  return issues;
}

function main() {
  console.log('🔍 Linting Sanity schema files for missing inline object names...\n');

  if (!fs.existsSync(SCHEMA_DIR)) {
    console.error(`❌ Schema directory not found: ${SCHEMA_DIR}`);
    process.exit(1);
  }

  const files = findSchemaFiles(SCHEMA_DIR);
  const allIssues: LintIssue[] = [];

  for (const file of files) {
    const issues = lintFile(file);
    allIssues.push(...issues);
  }

  if (allIssues.length === 0) {
    console.log('✅ All schema files pass! No unnamed inline objects found.\n');
    process.exit(0);
  }

  console.log(`❌ Found ${allIssues.length} issue(s):\n`);

  for (const issue of allIssues) {
    console.log(`  ${issue.file}:${issue.line}`);
    console.log(`    ${issue.message}\n`);
  }

  console.log('💡 Fix: Add a `name` property to each inline object in array definitions.');
  console.log('   Example: defineArrayMember({ name: "my-item", type: "object", ... })\n');
  console.log(
    '📚 See: https://www.sanity.io/docs/help/error-value-of-type-object-is-not-allowed-in-this-array-field\n'
  );

  process.exit(1);
}

main();
