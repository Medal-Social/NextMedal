import { execFileSync } from 'node:child_process';

/** Resolve at build time, including direct OpenNext builds outside CI. */
export function resolveDeploymentId(env = process.env, cwd = process.cwd()) {
  const supplied = env.NEXT_DEPLOYMENT_ID?.trim() || env.GITHUB_SHA?.trim();
  if (supplied) return supplied;
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    throw new Error('Set NEXT_DEPLOYMENT_ID when building outside a Git checkout.');
  }
}
