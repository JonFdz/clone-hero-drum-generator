# Implementation Prompt — B7: desktop: integrate Simplified V1 packages through typed IPC and progress

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `desktop/<ISSUE>-simplified-v1-ipc`.

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

Electron main/preload/bridge/global declarations and modular handlers exclusively.

## Implement

- Extract modular handler registration.
- Expose import, catalog/open, edit commands, Preview, autosave, Save a Copy, export, scoped progress.
- Validate paths, payloads, IDs.
- Adapt harness bridge contracts.
- Add adapter tests.

## Do not implement

- Feature styling.
- Domain duplication in Electron.

## Acceptance

- [ ] No arbitrary renderer writes.
- [ ] Listeners scoped/cleaned.
- [ ] Typed errors preserved.
- [ ] No parsing/generation logic in adapter.
- [ ] Health/settings remain functional.

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
