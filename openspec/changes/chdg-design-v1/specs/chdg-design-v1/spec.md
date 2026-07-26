# CHDG Design V1 Specification

## ADDED Requirements

### Requirement: Existing Workspace Preservation

The design process SHALL inspect and preserve the existing `design/` workspace before reorganizing or extending it.

#### Scenario: Existing Pencil workspace is available
- **GIVEN** `design/chdg-ui.pen` exists
- **WHEN** work begins
- **THEN** the agent SHALL open it through Pencil MCP
- **AND** inventory existing sections, variables, components, frames, prompts, and documentation
- **AND** identify which artifacts are preserved, extended, superseded, or deferred

#### Scenario: Required workspace artifact is missing
- **GIVEN** a required design file is missing, inaccessible, or materially different
- **WHEN** preflight runs
- **THEN** the agent SHALL stop and report the missing item, locations inspected, related files found, and impact
- **AND** SHALL NOT create a replacement without approval

### Requirement: Current Application Baseline

The design process SHALL capture every required current-state scenario before correcting the design.

#### Scenario: Capturing a baseline state
- **GIVEN** the browser harness is running
- **WHEN** a required route/scenario is opened
- **THEN** the agent SHALL verify route, state, reload behavior, runtime health, and console
- **AND** capture it at 1440 × 900 and 1024 × 768 with `harnessUi=hidden`

#### Scenario: Required baseline catalog
- **WHEN** baseline capture is complete
- **THEN** screenshots SHALL exist for `empty`, `project-loaded`, `source-review-ready`, `source-review-attention`, `generate-ready`, `generate-running`, `generate-failed`, and `preview-ready`
- **AND** no required state SHALL be represented only from memory

#### Scenario: Baseline cannot be reproduced
- **GIVEN** a route redirects, renders inconsistent state, or produces an unexpected error
- **WHEN** capture is attempted
- **THEN** the agent SHALL stop that capture and report the exact URL, viewport, and discrepancy
- **AND** SHALL NOT fabricate the state

### Requirement: Screenshot Provenance

Every baseline screenshot SHALL be traceable.

#### Scenario: Saving a screenshot
- **WHEN** a screenshot is saved
- **THEN** documentation SHALL record route, scenario, viewport, capture date, harness UI setting, and known limitations
- **AND** the filename SHALL be stable and descriptive

### Requirement: Faithful Current Shell Reference

The Pencil workspace SHALL retain a faithful reference of the current shell distinct from Design V1.

#### Scenario: Recreating the current shell
- **GIVEN** baseline captures exist
- **WHEN** the current shell is represented
- **THEN** navigation, project context, runtime/status area, page region, and current hierarchy SHALL be shown faithfully
- **AND** current artifacts SHALL be visibly labeled as current rather than proposed

### Requirement: Evidence-Based UX Audit

Every major UX finding SHALL be grounded in current evidence.

#### Scenario: Recording a major finding
- **WHEN** a significant problem is documented
- **THEN** it SHALL include problem, evidence, affected screens, user consequence, severity, Design V1 response, and open question when applicable

#### Scenario: Behavior implications
- **GIVEN** a finding may require behavior changes
- **WHEN** it is recorded
- **THEN** it SHALL be classified as visual-only, information architecture, interaction, domain/product, or unresolved
- **AND** domain behavior SHALL NOT be silently redefined

### Requirement: Baseline Approval Checkpoint

The process SHALL obtain maintainer feedback after baseline and audit.

#### Scenario: Reaching Checkpoint 1
- **GIVEN** baseline and audit are complete
- **WHEN** the agent presents them
- **THEN** it SHALL show the most important evidence, severity, missing states, and open questions
- **AND** request explicit approval before final IA work

### Requirement: Two Bounded Information Architectures

The process SHALL create exactly two complete low-fidelity directions.

#### Scenario: Workflow-first alternative
- **WHEN** Workflow-first is created
- **THEN** it SHALL define global navigation, project context, ordered workflow states, page identity, next actions, attention states, and revisitation

#### Scenario: Project-workspace alternative
- **WHEN** Project workspace is created
- **THEN** it SHALL define global navigation, persistent project sections, section readiness, intended order, next actions, and prerequisite communication

#### Scenario: Third alternative appears
- **GIVEN** both complete alternatives exist
- **WHEN** another idea arises
- **THEN** it MAY be recorded as a note
- **AND** a third complete direction SHALL NOT be created without approval

### Requirement: Consistent IA Evaluation

Both alternatives SHALL be evaluated against the same criteria.

#### Scenario: Comparing alternatives
- **WHEN** alternatives are compared
- **THEN** both SHALL be assessed for orientation, project context, workflow clarity, attention visibility, revisitation, next-action clarity, 1024 viability, scalability, and implementation implications
- **AND** the recommendation SHALL state trade-offs

### Requirement: Architecture Approval Checkpoint

High-fidelity work SHALL require explicit approval of the selected direction.

#### Scenario: Reaching Checkpoint 2
- **GIVEN** both alternatives and the comparison exist
- **WHEN** the agent presents them
- **THEN** it SHALL present both, recommend one or an explicit hybrid, identify risks, and request approval
- **AND** SHALL NOT begin high fidelity before approval

### Requirement: CHDG Foundations V1

The Pencil workspace SHALL define reusable desktop foundations before final screen polish.

#### Scenario: Defining foundations
- **WHEN** Foundations V1 is created
- **THEN** it SHALL define semantic colors, typography, spacing, radii, borders/elevation, control sizing, density, icons, and focus/hover/selected/disabled/warning/error/success/destructive states

#### Scenario: Current and proposed tokens differ
- **WHEN** a current token is materially changed
- **THEN** current and V1 values SHALL remain distinguishable
- **AND** the rationale SHALL be documented

### Requirement: Reusable Components V1

Repeated screen patterns SHALL use reusable Pencil components or documented variants.

#### Scenario: Component foundation
- **WHEN** the component set is complete
- **THEN** it SHALL cover app shell, navigation, workflow step, project context, page header, button variants, fields/selectors, cards/panels, status/validation, empty state, callout, progress, error, rows/tables, and action footer

### Requirement: Core High-Fidelity V1

The workspace SHALL contain the eight required high-fidelity states at the primary viewport.

#### Scenario: Complete 1440 flow
- **WHEN** the primary flow is complete
- **THEN** it SHALL include Home/Empty, Project Details/Loaded, Source Review/Ready, Source Review/Attention, Generate/Ready, Generate/Running, Generate/Failed, and Preview/Ready
- **AND** every screen SHALL use the approved IA and shared foundations/components

#### Scenario: Stable frame naming
- **WHEN** a V1 frame is created
- **THEN** its name SHALL encode version, screen, state, and viewport

### Requirement: Workflow and State Clarity

Design V1 SHALL make project, location, workflow state, attention, and next action unambiguous.

#### Scenario: Ready state
- **GIVEN** a screen is actionable
- **WHEN** it is viewed
- **THEN** project and workflow position SHALL be clear
- **AND** the primary next action SHALL dominate secondary details

#### Scenario: Attention state
- **GIVEN** Source Review needs attention
- **WHEN** it is represented
- **THEN** affected content SHALL be locatable
- **AND** blocking and advisory conditions SHALL be visually distinct
- **AND** warning semantics SHALL match current behavior or be marked proposed

#### Scenario: Running state
- **GIVEN** generation is running
- **WHEN** it is represented
- **THEN** progress, current phase, and summary feedback SHALL be visible
- **AND** technical logs SHALL be secondary or progressively disclosed

#### Scenario: Failed state
- **GIVEN** generation failed
- **WHEN** it is represented
- **THEN** the primary explanation and recovery action SHALL be clear
- **AND** technical evidence SHALL remain available without dominating

### Requirement: Desktop Viewport Adaptation

The approved 1440 design SHALL be adapted to 1024 × 768 without becoming a mobile redesign.

#### Scenario: Adapting a screen
- **WHEN** a screen is adapted to 1024 × 768
- **THEN** IA, component semantics, status meanings, and primary actions SHALL remain
- **AND** wrapping, stacking, scrolling, collapsing, and disclosure changes SHALL be documented

#### Scenario: Structural compromise is required
- **GIVEN** essential content cannot fit without changing IA
- **WHEN** the conflict is found
- **THEN** the agent SHALL present options and ask the maintainer before proceeding

### Requirement: Primary Flow Approval Checkpoint

The complete 1440 flow SHALL be approved before final adaptations and handoff.

#### Scenario: Reaching Checkpoint 3
- **GIVEN** all eight 1440 frames exist
- **WHEN** they are presented
- **THEN** the agent SHALL show shared components, behavior proposals, unresolved questions, and 1024 risks
- **AND** request explicit approval

### Requirement: Screen-to-Application Traceability

Every V1 screen SHALL map to current application references.

#### Scenario: Mapping a frame
- **WHEN** a frame is handed off
- **THEN** documentation SHALL include frame name, Angular route, harness scenario, viewport, primary state, reusable components, existing constraints, visual changes, behavior proposals, and open questions

#### Scenario: Proposed state has no current reference
- **WHEN** a design state has no route/scenario
- **THEN** it SHALL be labeled proposed future behavior
- **AND** require a separate implementation issue

### Requirement: Design Decision Record

Major accepted, rejected, and deferred decisions SHALL be recorded.

#### Scenario: Selecting IA
- **WHEN** the direction is approved
- **THEN** rationale SHALL record selected direction, hybrid responsibilities, rejected choices, risks, and deferred questions

### Requirement: Implementation Handoff

The design package SHALL support phased implementation without reinterpretation.

#### Scenario: Component inventory
- **WHEN** handoff is complete
- **THEN** it SHALL list component, variants, states, screens, current equivalent, and new behavior dependency

#### Scenario: Implementation sequence
- **WHEN** sequence is complete
- **THEN** it SHALL split foundations, shell, screens, states, dependencies, and behavior changes into focused future work

### Requirement: Pencil Integrity

The Pencil file SHALL remain valid and reviewable.

#### Scenario: Material design stage completes
- **WHEN** baseline organization, IA, foundations, or V1 frames materially change
- **THEN** the agent SHALL reopen or validate `design/chdg-ui.pen` through Pencil and visually inspect changed sections

#### Scenario: Final Pencil validation
- **WHEN** work is ready for PR
- **THEN** the file SHALL open successfully, required sections/frames SHALL be navigable, and no known broken component references SHALL remain

### Requirement: Design-Only Boundary

The change SHALL not modify production source.

#### Scenario: Final diff review
- **WHEN** the final diff is inspected
- **THEN** no file under `apps/` or `packages/` SHALL be modified
- **AND** no runtime dependency SHALL be added
- **AND** only approved design workspace, screenshots, documentation, and permitted transfer artifacts SHALL remain

#### Scenario: Production change appears necessary
- **WHEN** a runtime or harness change is discovered
- **THEN** it SHALL be recorded as follow-up work
- **AND** SHALL NOT be implemented in issue #89

### Requirement: Honest Completion Reporting

The final report SHALL distinguish completed, approved, deferred, and unverified work.

#### Scenario: Reporting completion
- **WHEN** the agent finishes
- **THEN** it SHALL report changed artifacts, captured baselines, approved IA, completed frames, Pencil validations, unresolved questions, deferred work, and final boundary review
- **AND** SHALL NOT claim approval or validation that did not occur
