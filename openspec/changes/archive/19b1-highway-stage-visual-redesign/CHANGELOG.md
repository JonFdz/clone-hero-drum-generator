# Changelog — Phase 19B.1: Highway Stage Visual Redesign

## Revision 2 — visual direction and durable reference documentation

This revision adds an explicit visual-direction package derived from planning-only screenshots supplied during design discussion.

The screenshots themselves are **not included** in this OpenSpec and must not be committed to the repository. They may inform high-level composition and readability goals only. The implementation must remain original and use only native Canvas 2D primitives and gradients.

New material:

- `visual-direction.md` — operational visual language, measurable composition targets, rendering hierarchy, and anti-patterns.
- `reference-observations.md` — non-proprietary observations distilled from the planning references, plus a no-copying policy.
- Required durable documentation deliverables under `docs/reference/` for the implemented visual language and its validation checklist.

This revision does not change the semantic scope: four pitched lanes, a separate kick rail, read-only behavior, timing ownership, and Canvas-only architecture remain unchanged.
