# PRD Phase 17D: Home Dashboard Pixel-Perfect Redesign

## Goal

Rework the Home screen so it follows the existing Home mockup as closely as practical.

Primary visual target:

```txt
docs/desktop/mockups/01-home-dashboard.png
```

This phase should be treated as a **near pixel-perfect Home implementation**, not a loose dashboard interpretation.

## Current PR correction

The first Phase 17D implementation improved the old Home, but it drifted away from the mockup by adding a generic dashboard structure with too many repeated/abstract cards:

```txt
Current Project hero
Project / Output / Paths / Recent status cards
Next Recommended Action
Quick Actions
Workflow
Recent Projects
```

The desired correction is:

```txt
Home should look and behave like the mockup.
Home should be direct and operational.
Home should not become a generic metrics dashboard.
```

## Product direction

Home is the first landing/launchpad screen.

It should help the user immediately:

```txt
continue the current project
start a new project
open an existing project
understand the current workflow state at a glance
open recent projects quickly
```

It should not force the user to interpret many status cards.

## Scope

Included:

```txt
Home page only
near pixel-perfect composition based on 01-home-dashboard.png
recomposition of the current PR #47 Home layout
current project / continue work card
compact recent projects section
compact workflow overview/progress
clear primary and secondary actions
minimal status badges integrated into cards
responsive behavior that preserves the mock composition
```

Out of scope:

```txt
Projects page redesign
New Project redesign
Preview redesign
Generate/Validation/Mapping/Settings redesign
global sidebar/header redesign
.chdg bundle/format changes
new persistence model
new dependencies
```

## Design correction from current PR

Remove or collapse these as separate large sections:

```txt
HomeProjectStatusCardsComponent as a full row of four metric cards
HomeNextStepCardComponent as a large standalone card
HomeQuickActionsComponent as a standalone sidebar card duplicating hero actions
large descriptive workflow card with long descriptions
```

Keep useful logic from the current PR, but the UI must be recomposed.

## Required target structure

The Home content should be closer to this structure:

```txt
[Top content header / hero area]
- compact app/project intro
- current project name when available
- primary CTA to continue
- secondary actions: New Project / Open Project

[Main content grid]
Left:
- Continue / current project card
- recent projects compact card

Right:
- workflow overview / next steps card
- quick project state hints if needed

[Optional warning strip]
- only when there are missing paths or failed output
```

Do not render a separate grid of generic "Project / Output / Paths / Recent" metric cards unless the mock explicitly supports it visually. Prefer badges inside the main project card.

## Current project card

When a project exists, show:

```txt
project name
project path
generated/needs-regenerate/not-generated/failed badge
dirty/modified badge if applicable
primary action
secondary actions
small readiness indicators
```

Recommended actions:

```txt
generated -> Preview
needs-regenerate -> Generate
failed -> Review Generate
missing paths -> Continue Setup
no project -> New Project
```

Secondary actions should not duplicate across separate cards.

## No-project state

When no project exists, Home should invite the user to:

```txt
New Project
Open Project
```

and show the workflow overview as guidance.

## Recent projects

Recent projects on Home should be compact:

```txt
max 2 or 3 items
name
path
Open
Remove
View all Projects
```

Do not make it the main focus.

## Workflow overview

Workflow should be compact and visually similar to the mock.

Canonical steps:

```txt
Import source
Inspect
Select track(s)
Generate
Validate
Preview
```

Avoid long paragraphs under each step. Use short labels/statuses. Do not mark multiple steps as "current" unless there is a clear reason.

## Component guidance

The current PR created several components. Reuse only what helps the mock implementation.

Recommended final component split:

```txt
HomePageComponent
HomeHeroComponent / HomeCurrentProjectCardComponent
HomeRecentProjectsCompactComponent
HomeWorkflowOverviewComponent
HomeWarningsPanelComponent
```

Optional:

```txt
HomeActionBarComponent
HomeReadinessBadgesComponent
```

Avoid standalone components that exist only to create extra dashboard sections:

```txt
large NextStep card
large QuickActions card
four-card status metrics row
```

## Data/model guidance

Keep the pure model helper from the current PR:

```txt
apps/desktop/src/app/features/home/home-dashboard.model.ts
```

But adjust it if needed so the model supports:

```txt
primary action
secondary actions
compact badges
workflow step statuses
recent projects subset
warnings
```

Model logic is good; the main correction is visual composition.

## Acceptance criteria

- Home closely follows `docs/desktop/mockups/01-home-dashboard.png`.
- Home does not look like a generic dashboard of many cards.
- The current project / continue action is direct and dominant.
- Next action is integrated into the main card, not duplicated as a separate large card.
- Quick actions do not duplicate hero/current-project actions.
- Status information is compact, using badges/strips rather than many large metric cards.
- Recent projects are compact.
- Workflow is compact and canonical.
- Existing project actions still work.
- Projects page remains unchanged.
- Tests still pass.
