# Implementation Prompt — F6: frontend: add Project Details, autosave state, rename, and Save a Copy

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `frontend/<ISSUE>-project-details`.

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

Project Details, save-state UI, Save a Copy facade/components.

## Implement

- Contextual Project Details panel.
- Edit identity, optional metadata, cover, output.
- Preview derived name/collisions.
- Saving/Saved/Save failed.
- Save a Copy.
- Transactional rename results.

## Do not implement

- Replace Audio.
- Updated Source.
- Persistent history.

## Acceptance

- [ ] Identity remains mandatory.
- [ ] Valid apply renames safely.
- [ ] Collision preserves old state.
- [ ] Copy is independent.
- [ ] No competing manual Save button.

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
