# Design: Phase 17D Home Pixel-Perfect Correction

## Target

Use:

```txt
docs/desktop/mockups/01-home-dashboard.png
```

as near pixel-perfect reference.

## Layout decision

Use fewer, stronger sections:

```txt
Hero/current-project card
Compact recent projects
Compact workflow overview
Conditional warnings
```

Status and next action should live inside the hero/current-project card.

## Existing PR reuse

Keep:

```txt
home-dashboard-model.ts
recent project behavior
open/remove project behavior
tests where still valid
```

Change:

```txt
visual composition
component hierarchy
status/quick/next-action presentation
```

## Component strategy

Delete, merge, or stop rendering standalone:

```txt
HomeProjectStatusCardsComponent
HomeNextStepCardComponent
HomeQuickActionsComponent
```

unless their content is visually folded into the mock-like hero.

## Acceptance

The final Home must look significantly closer to the mock than the current PR screenshots.
