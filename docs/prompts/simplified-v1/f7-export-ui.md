# Implementation Prompt — F7: frontend: add Export/Update progress, conflict, success, and failure

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `frontend/<ISSUE>-export-ui`.

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

Export components/facade/tests.

## Implement

- Export/Update action in Editor.
- Managed-file summary and ambiguous destination confirmation.
- Real progress.
- Updated/unchanged files.
- Actionable failure and Done.
- Preserve Editor state.

## Do not implement

- Generate route/page.
- Output marker.

## Acceptance

- [ ] No Generate navigation.
- [ ] Done returns to Editor.
- [ ] Conflict explains replaced/preserved files.
- [ ] No fake percentage.
- [ ] Failure does not imply partial success.

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
