# CHDG Design V1 Implementation Sequence

This sequence recommends reviewable production issues. It does not authorize
implementation or product-behavior changes.

No phase requires new domain behavior. If implementation reveals a necessary
domain rule, it must be specified and approved in a separate product issue
before the affected phase proceeds.

## 1. Design tokens and shared primitives

- **Goal:** Map Foundations V1 into renderer-owned semantic tokens.
- **Scope:** Color, typography, spacing, radii, borders, focus, icon sizing.
- **Dependencies:** Existing Angular styling architecture.
- **Behavior constraints:** Visual-only; no persistence or workflow changes.
- **New behavior:** None.
- **Issue boundary:** Tokens and primitive styles.
- **Acceptance focus:** Semantic contrast, focus-visible, no color-only status.

## 2. Application shell and compact global navigation

- **Goal:** Restrict global navigation to application destinations.
- **Scope:** Shell, Home/Projects/Settings items, 1440 and 1024 rail variants.
- **Dependencies:** Current router and responsive layout.
- **Behavior constraints:** Preserve routes; no new workflow routes.
- **New behavior:** Responsive shell composition only.
- **Issue boundary:** Shell/navigation refactor.
- **Acceptance focus:** Orientation, working space, keyboard navigation.

## 3. Project context and save-state presentation

- **Goal:** Keep project/source identity and supported persistence state visible.
- **Scope:** Project header and project actions.
- **Dependencies:** Verification of currently exposed save-state events.
- **Behavior constraints:** Do not invent autosave guarantees.
- **New behavior:** Only presentation of verified states.
- **Issue boundary:** Header plus a separate save-state verification issue if needed.
- **Acceptance focus:** No duplicated metadata or unsupported wording.

## 4. Workflow strip and semantic states

- **Goal:** Communicate ordered progression and revisitation.
- **Scope:** Completed, current, advisory, blocking, in-progress, failed, unavailable.
- **Dependencies:** Current route readiness and navigation rules.
- **Behavior constraints:** Revisit consequences remain unresolved.
- **New behavior:** Revisit navigation and state presentation.
- **Issue boundary:** Workflow component plus route integration.
- **Acceptance focus:** Labels/icons/borders, focus, no strict-linearity promise.

## 5. Shared page structure and action hierarchy

- **Goal:** Provide consistent page header, validation summary, callouts,
  disclosure, and optional compact action region.
- **Dependencies:** Tokens, shell, workflow.
- **Behavior constraints:** One dominant action; do not obscure content.
- **New behavior:** Disclosure and responsive action placement.
- **Issue boundary:** Shared page components.
- **Acceptance focus:** Keyboard focus, readable status ownership, 1024 reachability.

## 6. Home and Project Details

- **Goal:** Establish first-use hierarchy and a clear transition to review.
- **Scope:** Home Empty; Project Details Loaded at both viewports.
- **Dependencies:** Shell, page structure, project header.
- **Behavior constraints:** Preserve current create/open/source/output actions.
- **New behavior:** Recent-project hierarchy and workflow transition presentation.
- **Issue boundary:** Home and Details screens.
- **Acceptance focus:** One primary action and no duplicated project context.

## 7. Source Review local navigation and ready state

- **Goal:** Replace the uninterrupted long page with four local tasks.
- **Scope:** Ready state, completed summaries, active Validation detail.
- **Dependencies:** Shared panels, workflow, existing Source Review state.
- **Behavior constraints:** Same Angular route and capabilities.
- **New behavior:** In-page task selection and collapse.
- **Issue boundary:** Ready state and local navigation.
- **Acceptance focus:** Meaningfully shorter page, single detail region, no nested scroll trap.

## 8. Source Review advisory-attention state

- **Goal:** Make unknown mapping attention actionable and explicitly non-blocking.
- **Scope:** Affected mapping row, advisory callout, correction/continue actions.
- **Dependencies:** Source Review navigation and mapping data.
- **Behavior constraints:** Unknown mappings remain advisory.
- **New behavior:** Contextual correction path presentation.
- **Issue boundary:** Advisory state.
- **Acceptance focus:** Affected content, consequence, correction, allowed continuation.

## 9. Generate ready and running states

- **Goal:** Clarify readiness, execution, and incompatible actions.
- **Scope:** Generate Ready/Running at both viewports.
- **Dependencies:** Workflow, current generation events.
- **Behavior constraints:** No invented phases; Open output safety unresolved.
- **New behavior:** Generic progress hierarchy and disclosed logs.
- **Issue boundary:** Ready/running states.
- **Acceptance focus:** Honest progress, retained context, Preview unavailable.

## 10. Generate failure recovery

- **Goal:** Recover inside Generate without reconstructing the workflow.
- **Scope:** Failure summary, Retry, evidence, corrective link, Preview state.
- **Dependencies:** Existing failure and retry entry points.
- **Behavior constraints:** Retry scope remains undefined.
- **New behavior:** Recovery hierarchy and contextual navigation.
- **Issue boundary:** Failure state; retry-definition work stays separate.
- **Acceptance focus:** No contradictory ready/failed/previewable signals.

## 11. Preview hierarchy and controls

- **Goal:** Make chart/highway primary and diagnostics secondary.
- **Scope:** Preview Ready at both viewports.
- **Dependencies:** Existing preview/highway and transport controls.
- **Behavior constraints:** Audio-backed behavior remains partially unvalidated.
- **New behavior:** Diagnostics disclosure and responsive composition.
- **Issue boundary:** Fallback-compatible hierarchy first; audio validation separately.
- **Acceptance focus:** Usable highway, reachable controls, honest audio status.

## 12. 1024 refinement and accessibility validation

- **Goal:** Verify desktop-window adaptation under real content and keyboard use.
- **Scope:** All eight states at 1024 × 768.
- **Dependencies:** Implemented screens.
- **Behavior constraints:** Preserve selected IA and semantics.
- **New behavior:** Responsive composition only.
- **Issue boundary:** Cross-screen refinement.
- **Acceptance focus:** Wrapping, scrolling, focus order, zoom, contrast, no overlap.

## 13. Harness and visual-validation follow-ups

- **Goal:** Make V1 implementation states deterministically reviewable.
- **Scope:** Audio-backed Preview fixture and later visual-regression coverage.
- **Dependencies:** Behavior decisions and production implementation.
- **Behavior constraints:** Synthetic fixtures do not redefine domain behavior.
- **New behavior:** Test/harness support only.
- **Issue boundary:** Separate harness and validation issues.
- **Acceptance focus:** Stable direct routes, reloads, console state, viewport captures.
