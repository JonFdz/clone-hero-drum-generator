# Spec: Home Dashboard Pixel-Perfect Correction

## ADDED Requirements

### Requirement: Home follows the mock closely

Home SHALL use `docs/desktop/mockups/01-home-dashboard.png` as near pixel-perfect visual target.

#### Scenario: Home visual composition

Given Home is opened
Then the layout resembles the mock rather than a generic multi-card metrics dashboard.

### Requirement: Next action is integrated

Home SHALL integrate the primary next action into the main current-project/hero card.

#### Scenario: Generated project

Given the project is generated
Then the main card shows Preview as the primary action
And there is no separate large Next Recommended Action card duplicating it.

### Requirement: Status is compact

Home SHALL present project/output/path status as compact badges or strips rather than a full row of large metric cards.

#### Scenario: Project status

Given output and paths are ready
Then status appears compactly in the main layout.

### Requirement: Quick actions do not duplicate

Home SHALL not show a standalone quick actions card that duplicates hero actions.

#### Scenario: Actions visible

Given the hero already shows New Project, Open Project, and primary next action
Then a separate Quick Actions card is not shown with the same actions.

## MODIFIED Requirements

### Requirement: Workflow is compact

The workflow remains visible but is compact and close to the mock.

## REMOVED Requirements

None.
