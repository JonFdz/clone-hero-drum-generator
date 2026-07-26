# OpenSpec — Phase 19A: Canvas Highway Preview Spike

- **Issue:** #80 — Canvas Highway Preview Spike
- **Status:** Draft for Jon's review and approval
- **Implementation state:** Not approved for implementation
- **Repository baseline:** `main` at the merge commit for the Angular workflow refactor (`f739c10c05c0237732cf100f0be1589dee2fc68a`)

## Purpose

This OpenSpec defines a contained, read-only Canvas 2D highway spike for CHDG's Preview feature. It is deliberately not a chart editor. Its job is to answer four questions before later editing work is approved:

1. Can an original five-lane drum highway be visually clear enough for chart review?
2. Can it remain synchronized with CHDG's existing Preview playback clock during play, pause and seek?
3. Can CHDG derive dependable tick, beat and measure information from the generated timing data already available to Preview?
4. Can native Canvas 2D render the intended window smoothly on an ordinary desktop without a graphics dependency?

## Source of truth and workflow

- **Engram is the persistent project memory and source of truth.**
- This OpenSpec is a reviewable transfer artifact only.
- No implementation may begin until the accepted decisions, constraints, tasks and validation rules in this package have been reconciled into Engram.
- The implementation agent must read `AGENTS.md`, the accepted OpenSpec, and current Preview code before coding.
- This package does not authorize changes to Electron main/preload, reusable packages, chart generation, chart writing, project persistence, or edit semantics.

## Package map

| File | Purpose |
|---|---|
| `proposal.md` | Product intent, scope and decision summary |
| `design.md` | Architecture, data flow, timing math, rendering contract and risks |
| `tasks.md` | Ordered implementation checklist |
| `verify.md` | Automated and manual validation protocol |
| `specs/canvas-highway-preview-spike/spec.md` | Normative requirements and acceptance scenarios |

## Hard boundary

Phase 19A is successful only if it produces evidence for a future decision. It must not become a disguised partial editor. There is no note selection, edit command, save flow, undo/redo, overlay persistence, chart rewrite, or mutation of generated output in this phase.
