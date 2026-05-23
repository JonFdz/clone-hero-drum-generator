# ADR Phase 17D: Home Dashboard Redesign

## Status

Proposed.

## Decision

Redesign Home as a dashboard / launchpad for the current project, not as another project library page.

Primary visual reference:

```txt
docs/desktop/mockups/01-home-dashboard.png
```

## Context

The current Home and Projects screens overlap heavily.

Current Home:

```txt
apps/desktop/src/app/pages/home/home-page.component.ts
```

shows Recent Projects and Workflow overview.

Current Projects:

```txt
apps/desktop/src/app/pages/projects/projects-page.component.ts
```

also shows Recent Projects and project open/create actions.

This causes Home and Projects to feel like the same screen.

## Decision details

Home becomes:

```txt
current project dashboard
next action launcher
project status summary
compact recent projects
workflow progress
warnings/health
```

Projects remains:

```txt
full recent/project library
open/remove/manage .chdg files
```

## Component decision

Split Home into focused components:

```txt
HomeDashboardHeroComponent
HomeNextStepCardComponent
HomeProjectStatusCardsComponent
HomeRecentProjectsCompactComponent
HomeWorkflowProgressComponent
HomeWarningsPanelComponent
HomeQuickActionsComponent
```

`HomePageComponent` remains the container/composer.

## Model/helper decision

Add an Angular-free helper if practical:

```txt
apps/desktop/src/app/services/home-dashboard-model.ts
```

This helper should derive:

```txt
next action
workflow statuses
status labels
compact dashboard model
```

The helper must be unit tested.

## Data decision

Use existing state only:

```txt
DesktopProjectStateService
DesktopGenerateStateService
DesktopBridgeService for open project dialog only
```

No new persistence, no `.chdg` format change, no new background scanning.

## Visual decision

Follow the dark/purple mock style, but keep canonical product rules.

Important correction:

```txt
.chdg is the project file, not the generated Clone Hero package.
```

## Non-goals

- No Projects page redesign.
- No global header/sidebar redesign.
- No `.chdg` bundling/format changes.
- No packaging/distribution.
- No new dependencies.
