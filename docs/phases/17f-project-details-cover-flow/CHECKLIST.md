# Checklist Phase 17F: Project Details + Cover Flow

## Read context

- [x] Read `AGENTS.md`.
- [x] Read desktop docs.
- [x] Read `docs/phases/17f-project-details-cover-flow/PRD.md`.
- [x] Read `docs/phases/17f-project-details-cover-flow/ADR.md`.
- [x] Read `docs/phases/17f-project-details-cover-flow/COMPONENTS.md`.
- [x] Open `docs/desktop/mockups/03-new-project.png`.
- [x] Review current routes.
- [x] Review old New Project page.
- [x] Review Projects page after Phase 17E.
- [x] Review project persistence/bridge code.

## Project schema / persistence

- [x] Add optional cover image path to project file schema/types.
- [x] Ensure existing .chdg files still open.
- [x] Add cover to ProjectStatePayload.
- [x] Save cover image path.
- [x] Open project restores cover image path.
- [x] Missing cover does not block project.

## Bridge

- [x] Add pickCoverImageFile bridge method.
- [x] Add Electron dialog image filters.
- [x] Add deleteProjectFile or removeRecentProjectAndDeleteFile bridge method.
- [x] Delete only .chdg file.
- [x] Do not delete source/audio/output folders.
- [x] Update desktop-bridge.d.ts.

## Project Details UI

- [x] Add `/projects/details` route.
- [x] Migrate New Project UI to Project Details.
- [x] Match `03-new-project.png` near pixel-perfect.
- [x] Add cover section.
- [x] Add cover preview/placeholder.
- [x] Add Choose Cover.
- [x] Add Remove Cover.
- [x] Preserve source/audio/output/metadata/offset/save/inspect behavior.
- [x] Update top-level New Project nav behavior.

## Projects UI

- [x] Project cards show Select / Edit / Remove.
- [x] Select loads active project.
- [x] Edit opens Project Details.
- [x] Remove opens confirm dialog.
- [x] Confirm offers remove from recents.
- [x] Confirm offers remove from recents + delete file.

## Tests

- [x] Project file cover field backwards compatibility.
- [x] Save/open cover image path.
- [x] Remove from recents only does not call delete.
- [x] Remove + delete calls delete bridge.
- [x] Select loads active state.
- [x] Edit route opens details.
- [x] Existing tests pass.

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
- [x] Select loads active project.
- [ ] Cover can be picked.
- [ ] Cover persists after save/reopen.
- [ ] Cover can be cleared.
- [ ] Remove from recents does not delete file.
- [ ] Remove from recents + delete removes only .chdg file.
- [ ] Existing projects without cover open.
