# ADR Phase 17D: Home Dashboard Pixel-Perfect Redesign

## Status

Proposed.

## Decision

Treat Phase 17D Home as a near pixel-perfect implementation of:

```txt
docs/desktop/mockups/01-home-dashboard.png
```

The previous loose dashboard interpretation should be corrected.

## Context

The first implementation of Phase 17D created a clean dashboard, but it drifted from the mock and added too many large sections:

```txt
status card grid
standalone next action card
standalone quick actions card
large workflow card
recent projects card
```

This is visually heavier and less direct than the intended Home mock.

## Decision

Recompose Home around fewer, more direct areas:

```txt
current project / continue card
compact actions
compact recent projects
compact workflow overview
conditional warnings
```

Status should be integrated as badges/strips inside these cards rather than shown as a separate metrics dashboard.

## Component decision

Keep components only where they support the target mock.

Recommended:

```txt
HomeHeroComponent or HomeCurrentProjectCardComponent
HomeRecentProjectsCompactComponent
HomeWorkflowOverviewComponent
HomeWarningsPanelComponent
HomeReadinessBadgesComponent
```

Avoid separate large components for:

```txt
HomeProjectStatusCardsComponent
HomeNextStepCardComponent
HomeQuickActionsComponent
```

unless they are visually folded into the mock-like layout.

## Non-goals

- No Projects redesign.
- No `.chdg` format change.
- No global shell/header/sidebar redesign.
- No new dependencies.
