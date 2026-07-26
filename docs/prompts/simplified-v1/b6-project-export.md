# Implementation Prompt — B6: backend: export self-contained projects incrementally and safely

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `backend/<ISSUE>-project-export`.

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

Project export orchestration, fingerprints, transactions, and tests.

## Implement

- Materialize chart/metadata from project.
- Reuse/copy internal audio and cover only when required.
- Compute input/output fingerprints and managed hashes.
- Detect ambiguous/external changes.
- Stage and atomically commit.
- Preserve unmanaged files.
- Emit real progress.

## Do not implement

- Export UI.
- Output marker.
- Replace Audio.

## Acceptance

- [ ] Note-only change updates chart state.
- [ ] Metadata-only change updates INI state.
- [ ] Unmanaged files survive.
- [ ] Injected failure preserves prior outputs.
- [ ] Ambiguous first export returns confirmation requirement.

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
