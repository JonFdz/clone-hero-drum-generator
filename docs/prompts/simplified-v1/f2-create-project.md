# Implementation Prompt — F2: frontend: build the two-step Create Project wizard

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `frontend/<ISSUE>-create-project`.

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

Creation feature/store/components and isolated harness fixtures.

## Implement

- Build Details, Mapping, and Creating routes.
- Require source/audio/Artist/Song/Project.
- Show derived folder name.
- Render recommended/manual track states.
- Render compact two-level mappings/unknowns.
- Render canonical progress through facade/fixtures.
- Handle typed errors.

## Do not implement

- Physical import.
- Editor.
- Updated Source.

## Acceptance

- [ ] Invalid direct route redirects safely.
- [ ] Unknown mapping advisory/editable.
- [ ] No inspection JSON/technical pipeline.
- [ ] No fake percentage.
- [ ] 1024 usable.

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
