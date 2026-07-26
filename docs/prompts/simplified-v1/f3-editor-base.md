# Implementation Prompt — F3: frontend: build the project-backed Editor and Preview shell

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `frontend/<ISSUE>-editor-base`.

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

Editor root, Preview composition/adapters, fixtures; excludes correction/mapping/export internals.

## Implement

- Contextual project header and Preview/Mappings tabs.
- Reuse waveform and approved Highway.
- Consume project-backed Preview.
- Playback, sections, offset, warnings, note-selection shell.
- Stable extension points for later features.

## Do not implement

- Note mutations.
- Mapping editor.
- Export flow.
- Electron integration.

## Acceptance

- [ ] Works in harness before export.
- [ ] Highway primary.
- [ ] 1024 controls preserved.
- [ ] Diagnostics secondary.
- [ ] Selection exposes stable note ID.

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
