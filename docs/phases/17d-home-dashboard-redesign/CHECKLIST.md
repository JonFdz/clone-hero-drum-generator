# Checklist Phase 17D: Home Dashboard Redesign

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/desktop/README.md`.
- [x] Read `docs/desktop/decisions.md`.
- [x] Read `docs/desktop/mockup-corrections.md`.
- [x] Read `docs/desktop/feature-inventory.md`.
- [x] Read `docs/desktop/bug-and-ui-backlog.md`.
- [x] Read `docs/phases/17d-home-dashboard-redesign/PRD.md`.
- [x] Read `docs/phases/17d-home-dashboard-redesign/ADR.md`.
- [x] Read `docs/phases/17d-home-dashboard-redesign/COMPONENTS.md`.
- [x] Open `docs/desktop/mockups/01-home-dashboard.png`.
- [x] Read OpenSpec if present.

## Current repo review

- [x] Review `apps/desktop/src/app/pages/home/home-page.component.ts`.
- [x] Review `apps/desktop/src/app/pages/projects/projects-page.component.ts`.
- [x] Review `apps/desktop/src/app/services/desktop-project-state.service.ts`.
- [x] Review `apps/desktop/src/app/services/desktop-generate-state.service.ts`.
- [x] Review current open/recent project behavior.
- [x] Identify current project, output, dirty, missing paths, and recent project data.

## Model/helper work

- [x] Add `home-dashboard-model.ts`.
- [x] Add next action derivation.
- [x] Add workflow status derivation.
- [x] Add output status formatting.
- [x] Add compact recent project limiting helper if useful.
- [x] Add tests.

## Component work

- [x] Add `HomeDashboardHeroComponent`.
- [x] Add `HomeNextStepCardComponent` or equivalent hero section.
- [x] Add `HomeProjectStatusCardsComponent`.
- [x] Add `HomeRecentProjectsCompactComponent`.
- [x] Add `HomeWorkflowProgressComponent`.
- [x] Add `HomeWarningsPanelComponent`.
- [x] Add `HomeQuickActionsComponent` if useful.
- [x] Keep `HomePageComponent` as container/composer.

## Visual work

- [x] Follow `01-home-dashboard.png` direction.
- [x] Make current project / next action dominant.
- [x] Make Recent Projects compact.
- [x] Keep workflow canonical and visually clear.
- [x] Use dark cards, purple accents, rounded corners, and spacing consistent with current app.
- [x] Avoid making Home look like Projects.

## Behavior preservation

- [x] New Project action still routes to `/new-project`.
- [x] Open Project dialog still works.
- [x] Open Recent still loads project state and generate state.
- [x] Remove Recent still works.
- [x] Missing paths still appear after opening project.
- [x] Dirty/generated/needs-regenerate/failed statuses are preserved.
- [x] Projects page behavior remains unchanged.

## Tests

- [x] Test no-project next action.
- [x] Test missing paths next action.
- [x] Test generated next action.
- [x] Test needs-regenerate next action.
- [x] Test failed next action.
- [x] Test workflow order.
- [x] Test compact recent project limit.
- [x] Preserve existing tests.

## Validation

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

## Manual validation

- [ ] Open app with no project.
- [ ] Home shows create/open project dashboard.
- [ ] Open recent project.
- [ ] Home shows current project status.
- [ ] Remove recent project.
- [ ] Create new project.
- [ ] Generated project shows Preview next action.
- [ ] Needs-regenerate project shows Generate next action.
- [ ] Missing paths show warnings.
- [ ] Projects page still works unchanged.
- [ ] Home no longer feels like duplicate of Projects.

## Out of scope confirmation

Do not implement:

- [x] Projects redesign;
- [x] `.chdg` bundle/format changes;
- [x] global sidebar/header redesign;
- [x] packaging;
- [x] new dependencies;
- [x] external editor integration.
