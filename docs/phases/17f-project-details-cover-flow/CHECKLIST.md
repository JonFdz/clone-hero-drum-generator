# Checklist Phase 17F: Project Details + Cover Flow

## Read context

- [ ] Read `AGENTS.md`.
- [ ] Read desktop docs.
- [ ] Read `docs/phases/17f-project-details-cover-flow/PRD.md`.
- [ ] Read `docs/phases/17f-project-details-cover-flow/ADR.md`.
- [ ] Read `docs/phases/17f-project-details-cover-flow/COMPONENTS.md`.
- [ ] Open `docs/desktop/mockups/03-new-project.png`.
- [ ] Review current routes.
- [ ] Review old New Project page.
- [ ] Review Projects page after Phase 17E.
- [ ] Review project persistence/bridge code.

## Project schema / persistence

- [ ] Add optional cover image path to project file schema/types.
- [ ] Ensure existing .chdg files still open.
- [ ] Add cover to ProjectStatePayload.
- [ ] Save cover image path.
- [ ] Open project restores cover image path.
- [ ] Missing cover does not block project.

## Bridge

- [ ] Add pickCoverImageFile bridge method.
- [ ] Add Electron dialog image filters.
- [ ] Add deleteProjectFile or removeRecentProjectAndDeleteFile bridge method.
- [ ] Delete only .chdg file.
- [ ] Do not delete source/audio/output folders.
- [ ] Update desktop-bridge.d.ts.

## Project Details UI

- [ ] Add `/projects/details` route.
- [ ] Migrate New Project UI to Project Details.
- [ ] Match `03-new-project.png` near pixel-perfect.
- [ ] Add cover section.
- [ ] Add cover preview/placeholder.
- [ ] Add Choose Cover.
- [ ] Add Remove Cover.
- [ ] Preserve source/audio/output/metadata/offset/save/inspect behavior.
- [ ] Update top-level New Project nav behavior.

## Projects UI

- [ ] Project cards show Select / Edit / Remove.
- [ ] Select loads active project.
- [ ] Edit opens Project Details.
- [ ] Remove opens confirm dialog.
- [ ] Confirm offers remove from recents.
- [ ] Confirm offers remove from recents + delete file.

## Tests

- [ ] Project file cover field backwards compatibility.
- [ ] Save/open cover image path.
- [ ] Remove from recents only does not call delete.
- [ ] Remove + delete calls delete bridge.
- [ ] Select loads active state.
- [ ] Edit route opens details.
- [ ] Existing tests pass.

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

- [ ] Projects New Project opens Project Details.
- [ ] Existing project Edit opens Project Details.
- [ ] Select loads active project.
- [ ] Cover can be picked.
- [ ] Cover persists after save/reopen.
- [ ] Cover can be cleared.
- [ ] Remove from recents does not delete file.
- [ ] Remove from recents + delete removes only .chdg file.
- [ ] Existing projects without cover open.
