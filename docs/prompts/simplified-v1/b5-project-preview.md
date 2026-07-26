# Implementation Prompt — B5: backend: build project-backed Preview data and timing diagnostics

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `backend/<ISSUE>-project-preview`.

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

Preview projection, indexes, hit testing, and focused tests; no Angular components.

## Implement

- Build Preview before export from effective project state.
- Expose stable IDs, piece, target, flags, correction state, provenance, timing.
- Resolve internal audio.
- Provide efficient time-window/lane indexing.
- Keep waveform/Highway-compatible data.
- Add audio-overrun warning and multi-tempo regression.

## Do not implement

- Renderer Highway redesign.
- Playback UI.
- Tempo editing.

## Acceptance

- [ ] No `notes.chart` dependency.
- [ ] Mapping/correction changes update projection.
- [ ] Two tempos stay correctly located.
- [ ] No all-notes scan per animation frame.
- [ ] Overrun includes count and max.

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
