# Checklist Phase 17D: Home Dashboard Redesign

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/desktop/feature-inventory.md`.
- [ ] Read `docs/desktop/bug-and-ui-backlog.md`.
- [ ] Read `docs/phases/17d-home-dashboard-redesign/PRD.md`.
- [ ] Read `docs/phases/17d-home-dashboard-redesign/ADR.md`.
- [ ] Read `docs/phases/17d-home-dashboard-redesign/COMPONENTS.md`.
- [ ] Open `docs/desktop/mockups/01-home-dashboard.png`.
- [ ] Read OpenSpec if present.

## Current repo review

- [ ] Review `apps/desktop/src/app/pages/home/home-page.component.ts`.
- [ ] Review `apps/desktop/src/app/pages/projects/projects-page.component.ts`.
- [ ] Review `apps/desktop/src/app/services/desktop-project-state.service.ts`.
- [ ] Review `apps/desktop/src/app/services/desktop-generate-state.service.ts`.
- [ ] Review current open/recent project behavior.
- [ ] Identify current project, output, dirty, missing paths, and recent project data.

## Model/helper work

- [ ] Add `home-dashboard-model.ts`.
- [ ] Add next action derivation.
- [ ] Add workflow status derivation.
- [ ] Add output status formatting.
- [ ] Add compact recent project limiting helper if useful.
- [ ] Add tests.

## Component work

- [ ] Add `HomeDashboardHeroComponent`.
- [ ] Add `HomeNextStepCardComponent` or equivalent hero section.
- [ ] Add `HomeProjectStatusCardsComponent`.
- [ ] Add `HomeRecentProjectsCompactComponent`.
- [ ] Add `HomeWorkflowProgressComponent`.
- [ ] Add `HomeWarningsPanelComponent`.
- [ ] Add `HomeQuickActionsComponent` if useful.
- [ ] Keep `HomePageComponent` as container/composer.

## Visual work

- [ ] Follow `01-home-dashboard.png` direction.
- [ ] Make current project / next action dominant.
- [ ] Make Recent Projects compact.
- [ ] Keep workflow canonical and visually clear.
- [ ] Use dark cards, purple accents, rounded corners, and spacing consistent with current app.
- [ ] Avoid making Home look like Projects.

## Behavior preservation

- [ ] New Project action still routes to `/new-project`.
- [ ] Open Project dialog still works.
- [ ] Open Recent still loads project state and generate state.
- [ ] Remove Recent still works.
- [ ] Missing paths still appear after opening project.
- [ ] Dirty/generated/needs-regenerate/failed statuses are preserved.
- [ ] Projects page behavior remains unchanged.

## Tests

- [ ] Test no-project next action.
- [ ] Test missing paths next action.
- [ ] Test generated next action.
- [ ] Test needs-regenerate next action.
- [ ] Test failed next action.
- [ ] Test workflow order.
- [ ] Test compact recent project limit.
- [ ] Preserve existing tests.

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

- [ ] Projects redesign;
- [ ] `.chdg` bundle/format changes;
- [ ] global sidebar/header redesign;
- [ ] packaging;
- [ ] new dependencies;
- [ ] external editor integration.
