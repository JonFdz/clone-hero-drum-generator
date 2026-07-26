# Project Session and Persistence Specification

## ADDED Requirements

### Requirement: Focused project session state

The renderer SHALL maintain active-project/workflow state through a dedicated signal-based project session store.

The project session SHALL NOT own recent-project data, application settings, FFmpeg diagnostics, desktop health, or router state.

#### Scenario: Settings are loaded

- **WHEN** application settings are loaded
- **THEN** settings state is held by the Settings feature or a dedicated settings service
- **AND** the project session is not updated with settings state

### Requirement: Centralized project hydration

The renderer SHALL centralize project open and hydration behavior in a project persistence service.

#### Scenario: A project is opened from the project library

- **WHEN** the user opens a recent project
- **THEN** the page requests the operation through the project persistence service
- **AND** the service opens the project through the desktop bridge
- **AND** the service hydrates the project session
- **AND** the page receives a typed outcome
- **AND** the page decides whether to navigate

#### Scenario: A project is opened from the application shell

- **WHEN** the user chooses Open Project from the application shell
- **THEN** the same project persistence service path is used
- **AND** no duplicate hydration implementation exists in the shell

### Requirement: Service navigation boundary

Application services SHALL NOT navigate through Angular Router.

#### Scenario: An open operation succeeds

- **WHEN** a project persistence operation succeeds
- **THEN** it returns a typed success outcome
- **AND** the page or shell performs any required route navigation
