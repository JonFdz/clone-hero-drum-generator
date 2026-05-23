# Component Breakdown Phase 17D: Home Dashboard Redesign

This document is the implementation blueprint for Phase 17D.

Visual reference:

```txt
docs/desktop/mockups/01-home-dashboard.png
```

## Current files

Current Home:

```txt
apps/desktop/src/app/pages/home/home-page.component.ts
```

Related current Projects page:

```txt
apps/desktop/src/app/pages/projects/projects-page.component.ts
```

Current state/services:

```txt
apps/desktop/src/app/services/desktop-project-state.service.ts
apps/desktop/src/app/services/desktop-generate-state.service.ts
apps/desktop/src/app/services/desktop-bridge.service.ts
```

## New suggested file layout

```txt
apps/desktop/src/app/pages/home/components/home-dashboard-hero.component.ts
apps/desktop/src/app/pages/home/components/home-next-step-card.component.ts
apps/desktop/src/app/pages/home/components/home-project-status-cards.component.ts
apps/desktop/src/app/pages/home/components/home-recent-projects-compact.component.ts
apps/desktop/src/app/pages/home/components/home-workflow-progress.component.ts
apps/desktop/src/app/pages/home/components/home-warnings-panel.component.ts
apps/desktop/src/app/pages/home/components/home-quick-actions.component.ts

apps/desktop/src/app/services/home-dashboard-model.ts
apps/desktop/src/app/services/home-dashboard-model.test.ts
```

Exact names may follow repo style, but keep responsibilities separated.

## HomePageComponent

Keep as page-level container.

Responsibilities:

```txt
compose dashboard components
provide state from DesktopProjectStateService and DesktopGenerateStateService
handle routing
handle open recent project
handle open project dialog
handle remove recent project
```

Avoid:

```txt
large inline workflow card template
large inline recent project template
next-action decision logic embedded directly in template
```

## HomeDashboardHeroComponent

Main dashboard card.

Visual role:

```txt
largest Home card
first thing user sees after page title
```

Display:

```txt
project name
project path or "Unsaved project"
dirty/modified state
output status pill
missing path count warning if any
primary action button
secondary actions
```

Primary action examples:

```txt
No project -> New Project
Missing paths -> Continue Setup
Needs regenerate -> Generate
Generated -> Preview
Failed -> Review Generate
```

Inputs:

```txt
dashboardModel
```

Outputs:

```txt
action
newProject
openProject
```

## HomeNextStepCardComponent

Focused "next best action" card.

Display:

```txt
short title
one-sentence reason
primary button
secondary link if useful
```

It may be merged into `HomeDashboardHeroComponent` if the mock and layout are cleaner, but the next-action model must stay clear/testable.

## HomeProjectStatusCardsComponent

Small status cards row.

Cards:

```txt
Project
Output
Paths
Recent
```

Optional card only if already available:

```txt
FFmpeg
```

Do not run new diagnostics automatically.

## HomeRecentProjectsCompactComponent

Compact list, not full library.

Display:

```txt
up to 3 recent projects
name
path
Open action
Remove action
View all projects link
```

Rules:

```txt
Do not duplicate the full Projects page.
Do not dominate the Home screen.
```

## HomeWorkflowProgressComponent

Six-step workflow strip.

Canonical steps:

```txt
1 Import source
2 Inspect
3 Select track(s)
4 Generate
5 Validate
6 Preview
```

Display state:

```txt
complete
current
available
blocked
upcoming
unknown
```

Avoid misleading completion if data is unavailable.

## HomeWarningsPanelComponent

Conditional.

Show only when:

```txt
missingPathWarnings.length > 0
outputStatus === "failed"
other existing project-state warning is available
```

Display:

```txt
warning title
short message
action to fix
```

Do not create new warning systems.

## HomeQuickActionsComponent

Small action group.

Actions may include:

```txt
New Project
Open Project
Continue Setup
Generate
Preview
Open Projects Library
```

Only show actions that make sense.

## Pure model helper

Create:

```txt
apps/desktop/src/app/services/home-dashboard-model.ts
```

Suggested exports:

```txt
deriveHomeDashboardModel()
deriveHomeNextAction()
deriveWorkflowStepStatuses()
formatHomeOutputStatus()
compactPathLabel()
```

## Implementation order

1. Add model helper and tests.
2. Extract compact Recent Projects component.
3. Add Dashboard Hero and Next Step.
4. Add Status Cards.
5. Add Workflow Progress.
6. Add Warnings Panel.
7. Compose HomePage.
8. Visual polish against `01-home-dashboard.png`.
9. Manual validate routes/actions.

## Required tests

Test:

```txt
no project -> next action is New Project
missing paths -> next action is Continue Setup
not-generated -> safe setup/generate route
needs-regenerate -> next action is Generate
generated -> next action is Preview
failed -> next action is Review Generate
workflow has six canonical steps in order
recent project compact count limits to 3
output labels are stable
```

## Hard rules

```txt
Do not redesign Projects page in this phase.
Do not change .chdg format.
Do not add dependencies.
Do not present .chdg as generated song package.
Do not claim workflow steps are complete unless state supports it.
```
