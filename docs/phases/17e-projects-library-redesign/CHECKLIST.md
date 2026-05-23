# Checklist Phase 17E: Projects Library Pixel-Perfect Redesign

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/phases/17e-projects-library-redesign/PRD.md`.
- [ ] Read `docs/phases/17e-projects-library-redesign/ADR.md`.
- [ ] Read `docs/phases/17e-projects-library-redesign/COMPONENTS.md`.
- [ ] Open `docs/desktop/mockups/02-projects-library.png`.
- [ ] Compare current Projects page to mock.

## Model/helper

- [ ] Add `projects-library-model.ts`.
- [ ] Add tests.
- [ ] Infer source type from project name/path safely.
- [ ] Format last opened labels.
- [ ] Derive honest library stats.
- [ ] Filter projects by search/source type.
- [ ] Sort projects by last opened/name.
- [ ] Mark only current loaded project with real output status.

## UI

- [ ] Implement mock-like Projects header.
- [ ] Implement toolbar search/filter/sort.
- [ ] Implement project cards/rows.
- [ ] Add cover placeholder slot.
- [ ] Replace fake Recent Activity with Library Stats/Overview.
- [ ] Implement empty state.
- [ ] Implement remove confirmation dialog.
- [ ] Use trash/remove icon instead of ambiguous three dots where practical.

## Remove confirmation

- [ ] Remove action opens confirmation.
- [ ] Cancel keeps recent project.
- [ ] Confirm removes from recent list.
- [ ] Dialog states that `.chdg` file is not deleted from disk.
- [ ] No direct remove without confirmation remains.

## Behavior

- [ ] New Project works.
- [ ] Open Project works.
- [ ] Open recent works.
- [ ] Remove from recent works only after confirmation.
- [ ] View/search/filter/sort works.
- [ ] Projects page remains local/offline.
- [ ] Home remains unchanged.

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
- [ ] No fake activity shown.
- [ ] Library stats use only real available data.
- [ ] Cover placeholders look ready for future cover art.
- [ ] Remove confirmation copy is clear.
- [ ] Responsive layout works.
