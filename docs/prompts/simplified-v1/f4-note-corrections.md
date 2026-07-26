# Implementation Prompt — F4: frontend: add individual note correction and Undo/Redo

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `frontend/<ISSUE>-note-corrections`.

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

Note inspector/dialog/correction adapter and tests.

## Implement

- Open details from Highway selection.
- Change piece, target, tom/cymbal, open/closed, accent, ghost.
- Delete/restore.
- Undo/Redo.
- Show provenance/correction state.
- Keyboard/focus management.

## Do not implement

- Add/move/duration/batch/tempo/Expert+ kick.

## Acceptance

- [ ] No timing controls.
- [ ] Accent/ghost mutual exclusion clear.
- [ ] Delete undoable.
- [ ] Correction survives reopen.
- [ ] Mapping changes do not erase correction.

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
