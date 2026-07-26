# Change Proposal: CHDG Design V1

## Summary

Extend the existing CHDG Pencil workspace from a bootstrap/current-state reference into the first coherent corrected design direction for the core desktop workflow.

The change captures the current application through deterministic browser scenarios, produces an evidence-based UX audit, compares two bounded information architectures, establishes reusable Foundations V1, creates high-fidelity core workflow screens, and prepares a route/scenario/component handoff for phased implementation.

## Why

The original issue intentionally stopped before redesign. Issue #90 now provides stable browser scenarios, so design decisions can be based on the real UI and real states rather than memory or ad-hoc screenshots.

The result should let a later implementation agent answer:

- Which project and workflow state is active?
- What requires attention?
- What is blocking versus advisory?
- What is the primary next action?
- How can the user recover or revisit a completed step?
- Which changes are visual, interaction-level, or product/domain changes?

## Design V1 Definition

Design V1 is the first corrected and internally coherent direction for CHDG. It is implementation-ready for the core workflow, but it is not the final exhaustive design for every dialog, Settings edge case, animation, future feature, or rare error.

## Required Outcomes

1. Existing design workspace inventory and preservation plan.
2. Current UI screenshots at 1440 × 900 and 1024 × 768.
3. Screenshot provenance.
4. Faithful current shell reference.
5. Evidence-based UX audit.
6. Workflow-first and Project-workspace low-fidelity alternatives.
7. Explicitly approved selected direction or hybrid.
8. CHDG Foundations V1 and reusable components.
9. High-fidelity V1 for eight core screens/states.
10. State matrix, screen/scenario mapping, component inventory, and phased implementation sequence.

## Core Screens and States

- Home / Empty
- Project Details / Loaded
- Source Review / Ready
- Source Review / Attention
- Generate / Ready
- Generate / Running
- Generate / Failed
- Preview / Ready

## Approval Model

The agent must stop for explicit maintainer approval:

1. After baseline capture and the UX audit.
2. After presenting both information-architecture alternatives and a recommendation.
3. After presenting the complete 1440 × 900 V1 flow.

## In Scope

- Existing Pencil workspace validation and preservation.
- Baseline capture through the browser harness.
- Current visual tokens and shell reference.
- UX audit.
- Exactly two complete low-fidelity information-architecture alternatives.
- Selected-direction rationale.
- Desktop foundations and reusable components.
- Core V1 screens at two desktop sizes.
- Route/scenario/state traceability.
- Implementation handoff documentation.

## Out of Scope

- Any modification under apps/ or packages/.
- Angular, Electron, backend, preload, IPC, parsing, mapping, generation, persistence, or preview implementation.
- New runtime dependencies.
- Playwright or automated visual regression.
- Mobile design.
- Complete Settings redesign.
- Final animation specifications.
- Every secondary dialog and rare edge state.
- More than two complete IA alternatives.
- Pencil-to-code generation.

## Risks and Mitigations

### Existing work is overwritten

Inspect first, preserve useful assets, document supersession, edit with Pencil MCP, and validate the file after material stages.

### Design drifts from product behavior

Use the browser harness and current code as current-state references. Classify behavior proposals separately and never invent whether a warning blocks progress.

### Scope becomes unbounded

Limit high fidelity to the eight core states, limit IA to two alternatives, use blocking checkpoints, and record deferred work.

### Large viewport works but ordinary desktop windows fail

Design the primary flow at 1440 × 900, then explicitly adapt and review at 1024 × 768.

## Success Criteria

The change succeeds when the current UI is reproducibly captured, the maintainer approves a documented architecture, reusable foundations support all required states, every V1 frame maps to a route/scenario, implementation can be split into focused follow-up issues, and the final diff contains no production source changes.
