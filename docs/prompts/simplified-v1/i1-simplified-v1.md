# Implementation Prompt — I1: integration: connect, validate, and finalize Simplified V1

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `integration/<ISSUE>-simplified-v1`.

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

Cross-feature wiring, harness, final docs/tests, obsolete-route cleanup.

## Implement

- Connect real IPC.
- Complete harness scenarios.
- Resolve shared stores/routes/styles.
- Validate 1440/1024 against Pencil.
- Accessibility and large-chart checks.
- Remove obsolete visible workflow safely.
- All gates and release evidence.

## Do not implement

- Milestone 2.
- New product behavior.

## Acceptance

- [ ] End-to-end primary flow.
- [ ] External originals removable before reopen/export.
- [ ] Decode-style tempo regression.
- [ ] Failure injection preserves valid state.
- [ ] No sidebar/Source Review/Generate visible.
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
