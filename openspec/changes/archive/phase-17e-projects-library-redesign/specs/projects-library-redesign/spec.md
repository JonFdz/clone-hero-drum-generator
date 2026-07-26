# Spec: Projects Library Redesign

## ADDED Requirements

### Requirement: Projects matches mock 02

Projects SHALL use `docs/desktop/mockups/02-projects-library.png` as near pixel-perfect visual target.

#### Scenario: Projects layout

Given the user opens Projects
Then the page composition resembles the Projects library mock.

### Requirement: Projects supports safe remove from recents

Projects SHALL require confirmation before removing a project from recent projects.

#### Scenario: Cancel remove

Given the remove dialog is open
When the user chooses Cancel
Then the project remains in recent projects.

#### Scenario: Confirm remove

Given the remove dialog is open
When the user chooses Remove from Recent
Then the project is removed from recent projects
And the `.chdg` file is not deleted from disk.

### Requirement: Projects does not show fake activity

Projects SHALL NOT display fake Recent Activity entries.

#### Scenario: Activity data unavailable

Given no persisted activity event log exists
When Projects renders
Then it shows Library Stats/Overview instead of fake activity.

### Requirement: Projects uses truthful recent project statuses

Projects SHALL NOT invent generated/validated/failed statuses for non-current recent projects.

#### Scenario: Non-current recent project

Given a recent project is not the current loaded project
Then it shows neutral Recent status or no status.

### Requirement: Projects is cover-ready

Project cards SHALL include a cover slot/placeholder that can later display user-selected cover art.

#### Scenario: No cover available

Given a project has no cover art
Then a placeholder/source icon is shown.

### Requirement: Projects supports search/filter/sort

Projects SHALL support search/filter/sort based on available recent-project data.

#### Scenario: Search by name

Given recent projects exist
When the user searches by project name
Then matching projects are shown.

## MODIFIED Requirements

### Requirement: Existing remove action becomes confirmed remove

The existing direct Remove action is replaced with a confirmation flow.

## REMOVED Requirements

None.
