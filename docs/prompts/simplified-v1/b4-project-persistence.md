# Implementation Prompt — B4: desktop: add atomic project persistence, recovery, rename, and Save a Copy

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `backend/<ISSUE>-project-persistence`.

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

Project filesystem/persistence/catalog modules and tests, excluding handler registration.

## Implement

- Implement project folder and relative assets.
- Atomic `project.chdg` write plus `recovery/previous.chdg`.
- Save queue/debounce/flush primitives.
- Transactional identity rename/collision handling.
- Full-folder Save a Copy with new ID and cleared export.
- Project catalog/recent contracts.

## Do not implement

- Renderer save UI.
- Electron main/preload registration.
- Replace Audio/Updated Source.

## Acceptance

- [ ] Interrupted save preserves previous valid project.
- [ ] Moved full folder remains valid.
- [ ] Copy has new ID and cleared export.
- [ ] Collision leaves old state unchanged.
- [ ] Relative assets resolve correctly.

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
