# Implementation Prompt — B3: backend: materialize effective drum notes and individual corrections

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `backend/<ISSUE>-effective-chart`.

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

New effective-chart, correction, command, and target-mapping modules/tests.

## Implement

- Implement two-level mapping resolution.
- Materialize effective notes from imported hits.
- Implement change/delete/restore overlays.
- Validate accent/ghost and targets.
- Implement reversible session command primitives.
- Always emit length 0 and normal Expert kicks.
- Test precedence.

## Do not implement

- Persistence queue.
- Electron/Angular.
- Add/move/duration/batch/tempo.

## Acceptance

- [ ] Ride can target Green Cymbal while remaining Ride.
- [ ] Individual correction survives mapping changes.
- [ ] Delete/restore deterministic.
- [ ] Accent/ghost mutually exclusive.
- [ ] Ticks remain imported and length is 0.

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
