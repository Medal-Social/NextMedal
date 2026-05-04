# Changesets

This directory holds [changesets](https://github.com/changesets/changesets) — small markdown files that describe what changed in a PR and how it should bump NextMedal's version.

## Workflow

When you open a PR that touches the template's source code, run:

```bash
pnpm changeset
```

You'll be prompted to:

1. Pick a bump type — `major` (breaking change for adopters), `minor` (new feature), or `patch` (bug fix / chore).
2. Write a one-paragraph summary that ends up in `CHANGELOG.md`.

The result is a new file under `.changeset/<some-name>.md`. Commit it alongside your code changes and push.

## What it does at release time

When a release is cut (push to `prod`), `pnpm version` consumes every accumulated changeset, bumps `package.json`, prepends an entry to `CHANGELOG.md`, and deletes the consumed `.md` files.

NextMedal is `private: true` — the template isn't published to npm. Changesets are used purely for changelog generation, version tagging, and release-note generation.

## When you don't need a changeset

Some PRs don't ship code that affects adopters: documentation-only changes, CI tweaks, hook updates, repo-meta. The `request-changeset` GitHub Action only nags you on PRs that touch package-affecting paths (`src/`, `package.json`, `tsconfig.json`, etc.) — it ignores `.github/`, `.husky/`, `.changeset/`, top-level `*.md`, `LICENSE`, `NOTICE`, and similar.

## Reference

- [Changesets docs](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)
- The release-time consumer is wired to [`@changesets/changelog-github`](https://www.npmjs.com/package/@changesets/changelog-github) so changelog entries get auto-linked to the originating PR.
