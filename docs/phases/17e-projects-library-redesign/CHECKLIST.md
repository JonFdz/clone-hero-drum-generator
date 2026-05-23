# Checklist Phase 17E: Projects Library Pixel-Perfect Redesign

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/desktop/README.md`.
- [x] Read `docs/desktop/decisions.md`.
- [x] Read `docs/desktop/mockup-corrections.md`.
- [x] Read `docs/phases/17e-projects-library-redesign/PRD.md`.
- [x] Read `docs/phases/17e-projects-library-redesign/ADR.md`.
- [x] Read `docs/phases/17e-projects-library-redesign/COMPONENTS.md`.
- [x] Open `docs/desktop/mockups/02-projects-library.png`.
- [x] Compare current Projects page to mock.

## Model/helper

- [x] Add `projects-library-model.ts`.
- [x] Add tests.
- [x] Infer source type from project name/path safely.
- [x] Format last opened labels.
- [x] Derive honest library stats.
- [x] Filter projects by search/source type.
- [x] Sort projects by last opened/name.
- [x] Mark only current loaded project with real output status.

## UI

- [x] Implement mock-like Projects header.
- [x] Implement toolbar search/filter/sort.
- [x] Implement project cards/rows.
- [x] Add cover placeholder slot.
- [x] Replace fake Recent Activity with Library Stats/Overview.
- [x] Implement empty state.
- [x] Implement remove confirmation dialog.
- [x] Use trash/remove icon instead of ambiguous three dots where practical.

## Remove confirmation

- [x] Remove action opens confirmation.
- [x] Cancel keeps recent project.
- [x] Confirm removes from recent list.
- [x] Dialog states that `.chdg` file is not deleted from disk.
- [x] No direct remove without confirmation remains.

## Behavior

- [x] New Project works.
- [x] Open Project works.
- [x] Open recent works.
- [x] Remove from recent works only after confirmation.
- [x] View/search/filter/sort works.
- [x] Projects page remains local/offline.
- [x] Home remains unchanged.

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

- [ ] Compare side-by-side with `02-projects-library.png`.
- [x] No fake activity shown.
- [x] Library stats use only real available data.
- [x] Cover placeholders look ready for future cover art.
- [x] Remove confirmation copy is clear.
- [x] Responsive layout works.
