# Workflow Feature Composition Specification

## ADDED Requirements

### Requirement: Thin generation page

The Generate page SHALL act as a composition and navigation boundary, not as the owner of generation orchestration.

#### Scenario: Generation view is rendered

- **WHEN** the Generate feature renders
- **THEN** focused components represent readiness, validation report, configuration, QA checklist, steps, log, output preview, and action bar
- **AND** a generation service owns validation refresh, execution, overwrite flow, autosave, output-folder operations, and typed results

### Requirement: Integrated mapping review

Mapping SHALL remain integrated into Source Review as the primary UX.

#### Scenario: A user reviews mapping candidates

- **WHEN** Source Review presents mapping candidates
- **THEN** mapping transformations and profile operations are owned by the Source Review/Mapping feature boundary
- **AND** the UI does not import a legacy independent Mapping page's private model
- **AND** profile CRUD is performed through a dedicated feature service

### Requirement: Focused workflow presentation components

Workflow-heavy pages SHALL split stable visual responsibilities into focused components.

#### Scenario: Source Review is migrated

- **WHEN** Source Review is implemented after this change
- **THEN** selected-source summary, source/combined summaries, track candidates, mapping review, mapping profiles, normalization status, and action areas are independently extractable where they represent stable responsibilities
- **AND** bridge access and workflow orchestration remain outside presentation components

### Requirement: Preview behavior preservation

The Preview feature SHALL preserve chart display, transport interaction, offset behavior, and metrics after its component migration.

#### Scenario: A user opens Preview after generation

- **WHEN** the project has generated output
- **THEN** Preview continues to present the same chart, transport controls, offset behavior, and metric information as before the refactor
