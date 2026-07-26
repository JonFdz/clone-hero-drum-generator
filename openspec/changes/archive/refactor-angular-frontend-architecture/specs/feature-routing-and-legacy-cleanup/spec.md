# Feature Routing and Legacy Cleanup Specification

## ADDED Requirements

### Requirement: Feature route loading

Home SHALL remain eagerly loaded.

Feature routes SHALL use `loadComponent` unless a documented technical reason requires another approach.

#### Scenario: The application starts

- **WHEN** Angular bootstraps the renderer
- **THEN** the Home route is available without lazy component loading
- **AND** feature pages such as Projects, Project Details, Source Review, Generate, Preview, and Settings are resolved through `loadComponent`

### Requirement: Conservative legacy cleanup

Routes and Angular components SHALL be deleted only when they are proven dead.

#### Scenario: A legacy Mapping route is considered for removal

- **WHEN** an implementation agent proposes deletion
- **THEN** it verifies no active route, import, navigation, test, documentation, or compatibility dependency remains
- **AND** it records the proof in the PR
- **OR** it retains the artifact and records it in `docs/architecture/angular-refactor-follow-ups.md`
