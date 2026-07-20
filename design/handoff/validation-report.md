# CHDG Design V1 Validation Report

**Date:** 2026-07-18
**Branch:** `design/89-pencil-bootstrap`
**Pencil Git blob hash:** `70bf618ab1b33db6aed3e98ba410a5c2fad84357`

## Pencil validation

- `design/chdg-ui.pen` reopened successfully through Pencil MCP after save.
- The document contains 24 top-level nodes:
  - workspace cover;
  - two CURRENT sections;
  - two IA explorations and one comparison;
  - Foundations V1 and reusable-components sections;
  - eight 1440 frames;
  - eight 1024 frames.
- Pencil reports 50 reusable nodes: 15 preserved CURRENT nodes and 35 V1 nodes.
- All eight 1440 frames and all eight 1024 frames were visually inspected.
- CURRENT foundations and shell, both explorations, IA comparison, Foundations
  V1, and the reusable-component section were visually inspected.
- Deep layout validation reported `No layout problems` for CURRENT foundations,
  CURRENT shell, Foundations V1, reusable components, and all sixteen V1 frames.
- Frame names and exact dimensions match the state matrix.
- Reusable component instances rendered successfully in inspected frames; no
  broken asset or visible component reference was found.
- CURRENT, EXPLORATION, SELECTED, and V1 material remain visibly separated.
- Standalone PNG export was not performed; this is an approved non-blocking
  deviation. Pencil MCP screenshots are the visual-review evidence.

## Browser baseline validation inherited from Checkpoint 1

- All eight deterministic states were captured at 1440 × 900 and 1024 × 768.
- Direct loading, reload stability, hidden harness controls, route/scenario
  identity, console inspection, and provenance were accepted by the maintainer.
- The exact `pnpm --filter @chdg/desktop dev:browser` launcher failed with an
  environment-only child-process `EPERM`.
- The equivalent Angular browser-harness invocation served the same harness on
  `127.0.0.1:4200` and was used for validation.

## Repository boundary

- Changed tracked and new files are under `design/` only.
- No file under `apps/` or `packages/` changed.
- No dependency, lockfile, browser-harness fixture, or production behavior
  changed.
- Baseline screenshots remain unchanged and contain no private data.
- Changed Markdown contains no private absolute paths.
- `git diff --check` passes.
- OpenSpec is an intentionally ignored local transfer artifact and records the
  exact prescribed launcher deviation honestly.

## Unresolved behavior preserved

- generation Retry scope;
- downstream invalidation after upstream edits;
- Open output safety during generation;
- exact save-state transitions;
- primary audio-backed Preview behavior.
