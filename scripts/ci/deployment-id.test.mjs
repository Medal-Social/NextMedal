import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { resolveDeploymentId } from '../deployment-id.js';

for (const resolve of [resolveDeploymentId]) {
  test('manual builds have a stable release ID', () => {
    assert.equal(resolve({ NEXT_DEPLOYMENT_ID: ' explicit ', GITHUB_SHA: 'ci' }), 'explicit');
    assert.equal(resolve({ GITHUB_SHA: 'ci' }), 'ci');
    const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    assert.equal(resolve({}), sha);
    assert.equal(resolve({ NEXT_DEPLOYMENT_ID: ' ', GITHUB_SHA: '' }), sha);
    const outsideGit = mkdtempSync(join(tmpdir(), 'deployment-id-'));
    try {
      assert.throws(() => resolve({}, outsideGit), /Set NEXT_DEPLOYMENT_ID/);
      assert.equal(resolve({ NEXT_DEPLOYMENT_ID: 'archive-build' }, outsideGit), 'archive-build');
    } finally {
      rmSync(outsideGit, { recursive: true });
    }
  });
}
