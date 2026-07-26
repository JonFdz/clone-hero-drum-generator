# Spec: Generate

## ADDED Requirements

### Requirement: Generate is the unified readiness and generation screen

The application SHALL provide `/generate` as the only user-facing screen for generation readiness and package generation.

#### Scenario: User opens Generate

- **GIVEN** a project is open
- **WHEN** the user opens `/generate`
- **THEN** the page title is `Generate`
- **AND** validation readiness is shown on the same page
- **AND** generation configuration is shown on the same page
- **AND** generation actions are available according to readiness state

### Requirement: Validation is integrated into Generate

The application SHALL show validation readiness inside Generate instead of a standalone Validation page.

#### Scenario: Validation report is shown

- **GIVEN** the user opens `/generate`
- **WHEN** validation completes
- **THEN** Generate shows a Validation Report with errors, warnings, info, and last checked timestamp
- **AND** Generate shows a QA Checklist with validation items and fix actions where available

### Requirement: Validation runs automatically

The application SHALL run validation when Generate opens and immediately before generation starts.

#### Scenario: Validation on page entry

- **GIVEN** the user opens `/generate`
- **WHEN** the page initializes
- **THEN** validation is executed automatically
- **AND** readiness status is updated

#### Scenario: Validation before generation

- **GIVEN** the user clicks `Start Generate`
- **WHEN** generation is about to begin
- **THEN** validation is executed again
- **AND** generation starts only if there are no blocking errors

### Requirement: Errors block generation, warnings do not

The application SHALL block generation on validation errors and allow generation with warnings or info.

#### Scenario: Blocking errors exist

- **GIVEN** validation contains one or more blocking errors
- **WHEN** the user views Generate
- **THEN** `Start Generate` is disabled
- **AND** the blocking errors are shown in QA Checklist

#### Scenario: Only warnings and info exist

- **GIVEN** validation contains warnings or info but no blocking errors
- **WHEN** the user views Generate
- **THEN** `Start Generate` is enabled
- **AND** warnings/info are visible but non-blocking

### Requirement: Validation navigation is removed

The application SHALL remove standalone Validation navigation.

#### Scenario: Sidebar navigation

- **GIVEN** the app sidebar is visible
- **WHEN** navigation items are rendered
- **THEN** `Generate` is present
- **AND** `Validation` is not present

#### Scenario: Legacy validation route

- **GIVEN** a user navigates to `/validation`
- **WHEN** routing resolves
- **THEN** the app redirects to `/generate`
- **AND** no standalone Validation page is displayed

### Requirement: Generate shows generation configuration

The application SHALL show the configuration needed for generation.

#### Scenario: Configuration is displayed

- **GIVEN** a project has generation inputs
- **WHEN** the user opens Generate
- **THEN** Generation Configuration shows Source File, Audio File, Selected Tracks, Output Folder, Song, Artist, Album, and Offset
- **AND** each row indicates OK, warning, or missing where applicable

### Requirement: Generate shows generation steps

The application SHALL show high-level generation steps.

#### Scenario: Before generation

- **GIVEN** generation has not started
- **WHEN** Generate is displayed
- **THEN** generation steps are shown as pending

#### Scenario: After successful generation

- **GIVEN** generation succeeds
- **WHEN** Generate updates
- **THEN** generation steps are shown as completed

### Requirement: Generate shows output files after success

The application SHALL show generated output files and metrics after successful generation.

#### Scenario: Generation completes

- **GIVEN** generation succeeds
- **WHEN** the result is applied
- **THEN** Output Files Preview lists generated files
- **AND** metrics such as Hits, Mapped, Deduped, and Tracks are shown when available
- **AND** `Open Preview` is enabled

### Requirement: Generate autosaves successful generation state when possible

The application SHALL autosave successful generation state if the project has a file path.

#### Scenario: Project file exists

- **GIVEN** a project has a `.chdg` file path
- **WHEN** generation succeeds
- **THEN** generation result/output state is autosaved once
- **AND** autosave does not trigger generation again
- **AND** autosave does not mark the project as needing regenerate by itself

### Requirement: Final review remains external

The implementing agent SHALL NOT perform final review or merge.

#### Scenario: Implementation is complete

- **GIVEN** implementation and validation commands are complete
- **WHEN** the agent updates the PR
- **THEN** the PR states that final review is external by Jon/ChatGPT
- **AND** the PR is not merged by the agent
