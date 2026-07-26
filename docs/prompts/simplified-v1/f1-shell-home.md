# Implementation Prompt — F1: frontend: replace the sidebar shell with contextual navigation

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `frontend/<ISSUE>-shell-home`.

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

App shell/routes and Home/Projects/Settings UI; no Electron main/preload.

## Implement

- Remove permanent sidebar and old global Save controls.
- Implement minimal global/contextual headers.
- Implement canonical routes and temporary redirects.
- Redesign Home, Projects, Settings.
- Add deterministic harness fixtures.

## Do not implement

- Create wizard internals.
- Editor content.
- Real desktop IPC integration.

## Acceptance

- [ ] No sidebar at 1440/1024.
- [ ] One dominant Create Project action.
- [ ] Routes match contract.
- [ ] Keyboard/focus usable.
- [ ] Old routes do not reveal old workflow UI.

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
