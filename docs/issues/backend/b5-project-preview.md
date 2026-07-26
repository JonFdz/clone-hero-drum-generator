# backend: build project-backed Preview data and timing diagnostics

**Planning ID:** B5  
**Wave:** 3  
**Depends on:** B3  
**Suggested branch/worktree:** `backend/<ISSUE>-project-preview`

## Owned paths

Preview projection, indexes, hit testing, and focused tests; no Angular components.

## Scope

- Build Preview before export from effective project state.
- Expose stable IDs, piece, target, flags, correction state, provenance, timing.
- Resolve internal audio.
- Provide efficient time-window/lane indexing.
- Keep waveform/Highway-compatible data.
- Add audio-overrun warning and multi-tempo regression.

## Non-goals

- Renderer Highway redesign.
- Playback UI.
- Tempo editing.

## Acceptance criteria

- [ ] No `notes.chart` dependency.
- [ ] Mapping/correction changes update projection.
- [ ] Two tempos stay correctly located.
- [ ] No all-notes scan per animation frame.
- [ ] Overrun includes count and max.

## Validation

- Add focused tests for the owned layer.
- Run package tests during development.
- Before PR run `pnpm build`, `pnpm typecheck`, `pnpm lint`, and `pnpm test`.
- Report shared-contract needs before implementing divergent types.
- Verify no unrelated product behavior was added.

## Delivery

- one issue/branch/worktree/PR;
- focused commits;
- PR body with summary, architecture/files, tests, limitations, and `Closes #<issue>`;
- no self-merge or self-approval.
