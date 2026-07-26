# Implementation Prompt — D1: design: define the Simplified V1 information architecture

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `design/<ISSUE>-simplified-v1-ia`.

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

`design/**` and design-only records.

## Implement

- Preserve previous CURRENT/EXPLORATION/Design V1 material as historical.
- Create a separate Simplified V1 IA section in Pencil.
- Define no-sidebar global chrome, two-step creation, contextual project header, Preview/Mappings, Project Details, export states, Projects/Settings.
- Use approved mockups as conceptual references.
- Stop for blocking IA approval.

## Do not implement

- Production code.
- Final high-fidelity frames.
- Invented backend behavior.

## Acceptance

- [ ] Every canonical route/state is represented.
- [ ] No selected Source Review/Generate workflow strip.
- [ ] Highway working space is prioritized.
- [ ] Proposals/unresolved behavior are classified.
- [ ] Pencil saves/reopens and validates.

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
