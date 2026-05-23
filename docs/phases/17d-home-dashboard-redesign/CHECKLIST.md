# Checklist Phase 17D: Home Pixel-Perfect Correction

## Visual target

- [ ] Open `docs/desktop/mockups/01-home-dashboard.png`.
- [ ] Compare current Home implementation against the mock.
- [ ] Recompose Home to match the mock as closely as practical.
- [ ] Remove generic dashboard feel.
- [ ] Remove duplicated large action sections.
- [ ] Use compact badges/readiness strips instead of a large metrics row.

## Components

- [ ] Keep/use HomeDashboardHeroComponent or equivalent.
- [ ] Keep/use HomeRecentProjectsCompactComponent.
- [ ] Keep/use HomeWorkflowProgressComponent but compact it.
- [ ] Keep/use HomeWarningsPanelComponent conditionally.
- [ ] Remove or fold HomeProjectStatusCardsComponent.
- [ ] Remove or fold HomeNextStepCardComponent.
- [ ] Remove or fold HomeQuickActionsComponent.

## Behavior

- [ ] New Project works.
- [ ] Open Project works.
- [ ] Open Recent works.
- [ ] Remove Recent works.
- [ ] Generated project primary action goes to Preview.
- [ ] Needs-regenerate project primary action goes to Generate.
- [ ] Missing paths show warning/continue setup.
- [ ] Projects page remains unchanged.

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

- [ ] Home visually matches `01-home-dashboard.png` much more closely.
- [ ] Home is direct and useful.
- [ ] No repeated/deduplicated CTA sections.
- [ ] Recent projects are secondary.
- [ ] Workflow is compact.
