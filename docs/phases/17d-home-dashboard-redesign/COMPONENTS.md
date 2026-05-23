# Component Breakdown Phase 17D: Home Pixel-Perfect Correction

## Current PR state

PR #47 currently creates:

```txt
HomeDashboardHeroComponent
HomeNextStepCardComponent
HomeProjectStatusCardsComponent
HomeQuickActionsComponent
HomeRecentProjectsCompactComponent
HomeWorkflowProgressComponent
HomeWarningsPanelComponent
home-dashboard-model.ts
```

The model/helper work is useful. The visual composition should be corrected.

## Target direction

Build Home to match:

```txt
docs/desktop/mockups/01-home-dashboard.png
```

as closely as practical.

## Components to keep/adapt

### HomePageComponent

Should compose a smaller number of mock-like regions.

Recommended structure:

```txt
home-shell
  home-hero/current-project
  home-main-grid
    recent/continue card
    workflow/overview card
  warnings if needed
```

### HomeDashboardHeroComponent

Keep, but redesign to match the mock.

It should absorb:

```txt
primary next action
secondary actions
project state badges
```

Do not require a separate large Next Recommended Action card.

### HomeRecentProjectsCompactComponent

Keep.

Use as a compact section only.

### HomeWorkflowProgressComponent

Keep but make compact.

Do not render long explanations below each step if the mock uses a simpler workflow overview.

### HomeWarningsPanelComponent

Keep conditional.

Only show when warnings exist.

## Components to remove or visually fold

### HomeProjectStatusCardsComponent

Do not show four large metric cards as a full row unless the mock clearly supports it.

Replace with compact badges/readiness strip:

```txt
Generated
Paths ready
Modified
1 recent
```

inside the hero or current project card.

### HomeNextStepCardComponent

Remove as a standalone large card.

The next action belongs in the hero/current-project card.

### HomeQuickActionsComponent

Remove as a standalone card if it duplicates hero actions.

Actions should be available in the main Home card:

```txt
New Project
Open Project
Preview/Generate/Continue
Projects Library
```

## Model helper

Keep:

```txt
apps/desktop/src/app/services/home-dashboard-model.ts
```

But adjust output to support a compact mock-like layout:

```txt
primaryAction
secondaryActions
badges
workflow
recentProjects
warnings
```

## Hard rules

```txt
Pixel-perfect mock direction over generic dashboard interpretation.
No separate metrics dashboard row.
No duplicated CTA cards.
No duplicated quick actions.
No large empty dashboard cards.
Projects page unchanged.
OpenSpec not committed unless requested.
```
