# Implementation Prompt — D2: design: create the complete Simplified V1 Pencil flow

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `design/<ISSUE>-simplified-v1-pencil`.

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

`design/**` only.

## Implement

- Create high-fidelity 1440×900 and 1024×768 flow.
- Cover required empty/ready/attention/progress/failure/contextual states.
- Reuse approved foundations and Highway.
- Define structural 1024 adaptation.
- Use blocking 1440 checkpoint before final handoff.

## Do not implement

- Production implementation.
- Regenerating approved mockups.

## Acceptance

- [ ] Required frames and exact dimensions.
- [ ] No sidebar.
- [ ] One dominant action per context.
- [ ] Highway primary.
- [ ] All frames visually/layout validated.

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
