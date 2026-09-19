import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { resolveDeploymentId } from '../deployment-id.js';

const root = fileURLToPath(new URL('../../', import.meta.url));

test('Docker builder exposes the supplied release ID before Next builds', () => {
  const dockerfile = readFileSync(join(root, 'Dockerfile'), 'utf8');
  const builder = dockerfile.split('FROM base AS builder')[1].split('FROM base AS runner')[0];
  assert.match(builder, /^ARG NEXT_DEPLOYMENT_ID$/m);
  assert.match(builder, /(?:ENV|\s)NEXT_DEPLOYMENT_ID=\$NEXT_DEPLOYMENT_ID(?:\s|$)/);
  assert.ok(
    builder.indexOf('NEXT_DEPLOYMENT_ID=$NEXT_DEPLOYMENT_ID') < builder.indexOf('pnpm build')
  );
});

for (const mode of ['git', 'explicit-archive', 'ci-archive', 'unidentified-archive']) {
  test(`documented Docker script forwards a stable deployment ID: ${mode}`, () => {
    const dir = mkdtempSync(join(tmpdir(), 'nextmedal-docker-'));
    try {
      mkdirSync(join(dir, 'scripts'));
      mkdirSync(join(dir, 'bin'));
      for (const file of ['docker-build.sh', 'deployment-id.js']) {
        copyFileSync(join(root, 'scripts', file), join(dir, 'scripts', file));
      }
      writeFileSync(
        join(dir, '.env'),
        'NEXT_PUBLIC_SANITY_PROJECT_ID=test\nNEXT_PUBLIC_SANITY_DATASET=production\nNEXT_PUBLIC_BASE_URL=https://example.com\n'
      );
      // Capture the real script's argv without pulling an image or running Docker.
      writeFileSync(
        join(dir, 'bin/docker'),
        '#!/bin/sh\nprintf "%s\\n" "$@" > "$DOCKER_TEST_ARGS"\n',
        { mode: 0o755 }
      );
      const env = {
        ...process.env,
        PATH: `${join(dir, 'bin')}:${process.env.PATH}`,
        DOCKER_TEST_ARGS: join(dir, 'args'),
      };
      env.NEXT_DEPLOYMENT_ID = undefined;
      env.GITHUB_SHA = undefined;
      let expected;
      if (mode === 'git') {
        execFileSync('git', ['init', '-q', dir]);
        execFileSync(
          'git',
          [
            '-c',
            'user.name=Test',
            '-c',
            'user.email=test@example.com',
            '-c',
            'commit.gpgsign=false',
            'commit',
            '--allow-empty',
            '-qm',
            'fixture',
          ],
          { cwd: dir }
        );
        expected = execFileSync('git', ['rev-parse', 'HEAD'], {
          cwd: dir,
          encoding: 'utf8',
        }).trim();
      } else if (mode === 'explicit-archive') {
        env.NEXT_DEPLOYMENT_ID = ' release-2026-09 ';
        env.GITHUB_SHA = 'ignored-ci-sha';
        expected = 'release-2026-09';
      } else if (mode === 'ci-archive') {
        env.GITHUB_SHA = 'ci-commit-sha';
        expected = env.GITHUB_SHA;
      }
      const result = spawnSync('bash', ['scripts/docker-build.sh', 'contract-image'], {
        cwd: dir,
        env,
        encoding: 'utf8',
      });
      if (mode === 'unidentified-archive') {
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /Set NEXT_DEPLOYMENT_ID/);
        return;
      }
      assert.equal(result.status, 0, result.stderr);
      const args = readFileSync(join(dir, 'args'), 'utf8').trim().split('\n');
      const index = args.indexOf(`NEXT_DEPLOYMENT_ID=${expected}`);
      assert.ok(index > 0, `deployment ID missing from Docker arguments: ${args}`);
      assert.equal(args[index - 1], '--build-arg');
      // Model the Dockerfile's ARG -> ENV handoff in a context without Git.
      const archive = join(dir, 'archive');
      mkdirSync(archive);
      assert.equal(resolveDeploymentId({ NEXT_DEPLOYMENT_ID: expected }, archive), expected);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}
