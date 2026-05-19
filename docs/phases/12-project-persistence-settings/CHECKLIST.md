# Checklist Phase 12: Project Persistence + Settings

## Before implementation

- [x] Read `docs/desktop/README.md`.
- [x] Read `docs/desktop/decisions.md`.
- [x] Read `docs/desktop/mockup-corrections.md`.
- [x] Read this phase PRD.
- [x] Read this phase ADR.
- [x] Review visual references.

## Implementation

- [x] Define `.chdg` JSON project schema (`schemaVersion: 1`).
- [x] Add project read/write services in Electron main.
- [x] Add settings read/write in local app data.
- [x] Add recent projects tracking (add/remove/dedupe/limit).
- [x] Add FFmpeg path setting and diagnostic.
- [x] Add dirty state tracking.
- [x] Add output status tracking (`not-generated`, `generated`, `needs-regenerate`, `failed`).
- [x] Update preload bridge with explicit project/settings methods.
- [x] Update `DesktopBridgeService` with new methods.
- [x] Create `DesktopProjectStateService` for project/settings state.
- [x] Integrate dirty/needs-regenerate into `DesktopGenerateStateService`.
- [x] Update Home page with recent projects.
- [x] Update Projects page with recent projects.
- [x] Update New Project page with create/save/save-as/open flows.
- [x] Update Settings page with persistent settings and FFmpeg test.
- [x] Update topbar with project status and quick actions.
- [x] Preserve Phase 11 generate flow.
- [x] Preserve Electron security boundaries (`contextIsolation`, `nodeIntegration: false`, `sandbox`).
- [x] Add tests for project file serialization, parsing, invalid files, unsupported schema.
- [x] Add tests for settings defaults, read/write, recents dedupe/limit/remove.
- [x] Add tests for FFmpeg diagnostic shape.
- [x] Preserve existing tests.
- [x] Update docs if implementation differs.

## Validation

- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes (255 tests).
- [x] `pnpm --filter @chdg/desktop build` passes.
- [x] `pnpm --filter @chdg/desktop typecheck` passes.
- [x] `pnpm chdg --help` works.
- [ ] Manual desktop validation recorded if relevant.

## Notes

- Broad UX polish is intentionally deferred until a dedicated **Desktop UX Polish Before Packaging** phase.
- Only blocker fixes were applied in Phase 12 (missing scroll, path overflow, input sizing where needed).
- Default project location: `~/Documents/CHDG Projects/<project-name>/`.
- Default output folder: `<project-folder>/output/`.
- Settings stored in Electron `userData/settings.json`.
- Recent projects stored in Electron `userData/recents.json`.
- `.chdg` schema version is `1`. Unknown future versions fail with `UNSUPPORTED_PROJECT_VERSION`.
