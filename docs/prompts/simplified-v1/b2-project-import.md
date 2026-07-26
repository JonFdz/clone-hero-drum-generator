# Implementation Prompt — B2: backend: import deterministic sources into a self-contained project

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `backend/<ISSUE>-project-import`.

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

New import/analyze modules, synthetic fixtures, and focused tests; avoid Electron hotspots.

## Implement

- Analyze source, recommend tracks, build mapping definitions, timing summary, and warnings.
- Create project transactionally from approved selection.
- Archive source, convert internal OGG, prepare optional cover, materialize hits/timing.
- Emit canonical real progress steps.
- Clean temporary state on failure.

## Do not implement

- Angular wizard.
- Electron picker/IPC wiring.
- Note correction commands.
- Clone Hero export.

## Acceptance

- [ ] Deleting external originals does not affect the project.
- [ ] No partial final folder remains after injected failures.
- [ ] Track recommendation is deterministic.
- [ ] Unknown mappings remain explicit.
- [ ] Progress order matches contract.

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
