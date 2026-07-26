# Implementation Prompt — M2-2: lifecycle: create a new project version from an updated source

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `lifecycle/<ISSUE>-import-updated-source`.

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

Dedicated project-version domain/Desktop/UI modules.

## Implement

- Create separate project from new source.
- Reuse audio, cover, metadata, compatible mappings.
- Require new non-conflicting Project Name.
- Preserve original.
- Do not automatically carry individual corrections.

## Do not implement

- In-place regeneration/reconciliation.

## Acceptance

- [ ] Original folder/hash unchanged.
- [ ] New project ID.
- [ ] Reuse/non-reuse clearly explained.

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
