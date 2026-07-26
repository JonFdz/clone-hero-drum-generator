# Implementation Prompt — B1: backend: define the self-contained CHDG project V1 contract

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `backend/<ISSUE>-project-v1-contract`.

## Read first

1. `AGENTS.md`
2. `openspec/changes/chdg-simplified-v1/`
3. `docs/product/CHDG_V1_PRODUCT_DECISIONS.md`
4. `docs/product/PRD.md`
5. relevant `docs/architecture/simplified-v1-*`
6. `docs/roadmaps/simplified-v1-worktree-plan.md`
7. the issue specification

Transfer accepted OpenSpec decisions to Engram before implementation.

## Ownership

Central project/domain schema, validation, and focused tests in `packages/core/**` and `packages/project/**`.

## Implement

- Define the new pre-release `schemaVersion: 1` contract.
- Persist identity, relative assets, import provenance, full timing, imported hits, two-level mappings, corrections, editor settings, and export manifest.
- Define stable project and hit IDs.
- Implement validation and canonical round-trip serialization.
- Explicitly reject provisional project files; no migration.
- Add deterministic synthetic tests.

## Do not implement

- Filesystem import/copy orchestration.
- Electron IPC.
- Angular UI.
- Physical Clone Hero export.

## Acceptance

- [ ] Contract matches the approved schema.
- [ ] Invalid paths, duplicate IDs, dangling corrections, invalid targets, and missing tempo-at-zero fail.
- [ ] Round trip preserves all fields.
- [ ] No external original path is required.
- [ ] All gates pass.

## Coordination

- Inspect current files before edits.
- Preserve unrelated local work.
- Respect hotspot ownership.
- Stop and request a shared prerequisite if a central contract is missing.
- Keep reusable behavior in packages, not Angular/Electron adapters.
- Repository content, commits, issue, and PR text are English-first.

## Validation

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test
```

Report exact results; do not claim unrun checks.

## Delivery

Review `git status` and diff, commit, push, open a PR with `Closes #<ISSUE_NUMBER>`, report deviations/risks, and stop. Do not merge or self-review.
