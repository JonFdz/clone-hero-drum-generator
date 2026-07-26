# Implementation Tasks: CHDG Design V1

Keep this checklist synchronized. Do not check a task until the artifact and validation both exist. Approval checkpoints are blocking.

## 0. Preflight and Synchronization

- [x] Read root `AGENTS.md`, issue #89, this OpenSpec, and all design workspace instructions.
- [x] Verify the current branch is `design/89-pencil-bootstrap`.
- [x] Verify the branch includes merged issue #90.
- [x] If behind main, preserve local work and synchronize safely.
- [x] Confirm no uncommitted work would be lost.
- [x] Locate and open `design/chdg-ui.pen` through Pencil MCP.
- [x] Inventory existing design files, frames, variables, components, prompts, and decisions.
- [x] Stop and report any missing/materially different required artifact. (No required artifact was missing or materially relocated.)
- [x] Ask about every material ambiguity. (The instruction conflict is carried into Approval Checkpoint 1.)

## 1. Preservation Plan

- [x] List artifacts to preserve unchanged.
- [x] List artifacts to extend.
- [x] List artifacts that may be superseded or archived.
- [x] Confirm existing structure or propose a minimal mapping.
- [x] Ask before materially reorganizing `design/`. (No material reorganization was performed or proposed.)
- [x] Distinguish CURRENT, EXPLORATION, SELECTED, V1, and DEFERRED material.

## 2. Browser Baseline Setup

- [ ] Start `pnpm --filter @chdg/desktop dev:browser`. (Attempted with pinned pnpm; the repository launcher hit environment-only child-process `EPERM`. A direct equivalent Angular CLI invocation was used for validation.)
- [x] Verify loopback host, direct navigation, reload, runtime health, and hidden harness UI.
- [x] Confirm screenshot naming and provenance location.

## 3. Baseline Capture — 1440 × 900

- [x] Home / Empty.
- [x] Project Details / Loaded.
- [x] Source Review / Ready.
- [x] Source Review / Attention.
- [x] Generate / Ready.
- [x] Generate / Running.
- [x] Generate / Failed.
- [x] Preview / Ready.

## 4. Baseline Capture — 1024 × 768

- [x] Home / Empty.
- [x] Project Details / Loaded.
- [x] Source Review / Ready.
- [x] Source Review / Attention.
- [x] Generate / Ready.
- [x] Generate / Running.
- [x] Generate / Failed.
- [x] Preview / Ready.
- [x] Record route, scenario, viewport, date, harness UI, and limitations for every capture.
- [x] Verify no private data appears.

## 5. Current Foundations and Shell

- [x] Inspect current application styles and existing Pencil tokens.
- [x] Represent current colors, typography, spacing, sizing, radii, borders/elevation, and status semantics.
- [x] Recreate or verify the current shell faithfully.
- [x] Keep current references distinct from V1 proposals.
- [x] Validate Pencil after current-state updates.

## 6. UX Audit

- [x] Audit navigation and orientation.
- [x] Audit project context.
- [x] Audit workflow progression and revisitation.
- [x] Audit hierarchy and repeated information.
- [x] Audit primary/secondary actions.
- [x] Audit progressive disclosure and technical detail.
- [x] Audit empty, ready, attention, running, failure, retry, and recovery states.
- [x] Audit density, wrapping, scroll, and narrow desktop behavior.
- [x] Classify findings as visual, IA, interaction, domain, or unresolved.
- [x] Give every major finding evidence, affected screens, consequence, severity, and V1 response.
- [x] Prioritize findings and link them to screenshots.

## 7. APPROVAL CHECKPOINT 1 — Baseline and Audit

- [x] Present baseline catalog and top findings.
- [x] Present missing/ambiguous behavior.
- [x] Ask whether findings are missing or misprioritized.
- [x] Record feedback and explicit approval.
- [x] Do not continue without approval.

## 8. Workflow-First Low Fidelity

- [x] Define global navigation and project context.
- [x] Define ordered workflow states.
- [x] Demonstrate Details → Source Review → Generate → Preview.
- [x] Demonstrate attention in a current/previous step.
- [x] Demonstrate revisitation.
- [x] Demonstrate 1024 viability.

## 9. Project-Workspace Low Fidelity

- [x] Define global navigation and project context.
- [x] Define stable project sections and readiness.
- [x] Demonstrate Details → Source Review → Generate → Preview.
- [x] Demonstrate prerequisites and next action.
- [x] Demonstrate 1024 viability.

## 10. IA Comparison

- [x] Compare orientation, project context, workflow clarity, attention, revisitation, next action, 1024 viability, scalability, and implementation implications.
- [x] Form a recommendation with explicit trade-offs.
- [x] If hybrid, define exact responsibility boundaries.
- [x] Do not create a third complete alternative without approval.
- [x] Validate Pencil after alternatives.

## 11. APPROVAL CHECKPOINT 2 — Information Architecture

- [x] Present both directions and comparison matrix.
- [x] Present recommendation/hybrid, risks, and implications.
- [x] Ask for explicit approval.
- [x] Record approved direction and corrections.
- [x] Do not start high fidelity without approval.

## 12. Decision Record and Foundations V1

- [x] Document selected direction, hybrid elements, rejected choices, risks, and deferred questions.
- [x] Define V1 semantic colors, typography, spacing, radii, borders/elevation, density, control sizes, icons, and all key states.
- [x] Keep current and V1 foundations distinct.
- [x] Document material token changes.

## 13. Reusable Components V1

- [x] App shell and global navigation.
- [x] Project context and workflow steps.
- [x] Page headers and action footer.
- [x] Button variants and states.
- [x] Fields and selectors.
- [x] Cards and panels.
- [x] Status pills and validation messages. Approved deviation: no generic standalone status-pill component. Status representations are implemented through owner-specific components and variants.
- [x] Empty state and callouts.
- [x] Progress and error states.
- [x] Rows and tables.
- [x] Record component variants/states and validate references.

## 14. High-Fidelity V1 — 1440 × 900

- [x] Home / Empty.
- [x] Project Details / Loaded.
- [x] Source Review / Ready.
- [x] Source Review / Attention.
- [x] Generate / Ready.
- [x] Generate / Running.
- [x] Generate / Failed.
- [x] Preview / Ready.
- [x] Verify shell, project context, workflow, next actions, attention semantics, progress/failure hierarchy, and progressive disclosure.
- [x] Classify material changes.
- [x] Validate Pencil and inspect every frame.

## 15. APPROVAL CHECKPOINT 3 — Complete 1440 Flow

- [x] Present all eight frames, shared components, behavior proposals, unresolved questions, and 1024 risks.
- [x] Ask for explicit approval.
- [x] Record corrections and approval.
- [x] Do not finalize 1024/handoff without approval.

## 16. Desktop Adaptation — 1024 × 768

- [x] Adapt all eight required states.
- [x] Document wrapping, stacking, scrolling, collapsing, and disclosure changes.
- [x] Verify every primary action remains accessible.
- [x] Ask before a material structural compromise. (No adaptation required a material change to the approved IA.)
- [x] Validate Pencil and inspect every 1024 frame.

## 17. Traceability and Handoff

- [x] Create/update state matrix.
- [x] Map every frame to route, scenario, viewport, state, components, constraints, visual changes, behavior proposals, and open questions.
- [x] Mark states without current scenarios as proposed future behavior.
- [x] Complete component inventory.
- [x] Complete phased implementation sequence.
- [x] Identify behavior changes needing separate issues.
- [x] Do not implement production changes.

## 18. Documentation and Final Validation

- [x] Update `design/README.md` and established decision/handoff files.
- [x] Document statuses, screenshot conventions, selected IA, frame naming, and handoff usage.
- [x] Ensure all artifacts are English-first.
- [x] Open Pencil successfully and verify required sections, 1440 frames, 1024 frames, component references, and frame names.
- [x] Review complete diff.
- [x] Confirm no file under `apps/` or `packages/` changed.
- [x] Confirm no runtime dependency changed.
- [x] Confirm screenshots contain no private data.
- [x] Confirm unsupported behavior claims are not presented as current fact.
- [x] Leave incomplete/unapproved tasks unchecked.

## 19. Completion Report

- [x] Report artifacts changed, captures completed, approved IA, foundations/components, frames completed, Pencil validations, unresolved questions, deferred work, deviations, and final boundary review.
- [x] Confirm no production source was changed.
- [x] Do not merge without explicit maintainer approval.
