# Tasks: Phase 12 — Project Persistence + Settings

## 1. Read project context

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/phases/12-project-persistence-settings/PRD.md`.
- [ ] Read `docs/phases/12-project-persistence-settings/ADR.md`.
- [ ] Read `docs/phases/12-project-persistence-settings/CHECKLIST.md`.
- [ ] Read `docs/phases/11-desktop-generate-mvp/PRD.md`.
- [ ] Review visual references:
  - `docs/desktop/mockups/01-home-dashboard.png`
  - `docs/desktop/mockups/02-projects-library.png`
  - `docs/desktop/mockups/03-new-project.png`
  - `docs/desktop/mockups/10-settings.png`
- [ ] Read these OpenSpec artifacts:
  - `proposal.md`
  - `design.md`
  - `specs/project-persistence-settings/spec.md`
  - `tasks.md`
  - `verify.md`

## 2. Sync context to Engram

- [ ] Save change ID: `phase-12-project-persistence-settings`.
- [ ] Save branch name: `feat/phase-12-project-persistence-settings`.
- [ ] Save issue number once created.
- [ ] Save `.chdg` format decision: JSON schemaVersion 1.
- [ ] Save path decision: absolute paths for MVP; no asset copy/bundle yet.
- [ ] Save default project location: `~/Documents/CHDG Projects/<project-name>/`.
- [ ] Save default output location: project folder `/output`.
- [ ] Save settings scope: project location, default output folder, default charter, default offset, ffmpeg path.
- [ ] Save dirty/output status states.
- [ ] Save UX polish decision: broad polish deferred until before packaging; only blockers now.
- [ ] Save non-goals:
  - no bundle format
  - no file association
  - no cloud sync
  - no validation checklist
  - no preview
  - no mapping overrides
  - no packaging
- [ ] Save review rule: final PR review is external and must be done by Jon/ChatGPT.
- [ ] Save merge rule: never merge without Jon's explicit approval.

## 3. Inspect current implementation

- [ ] Inspect Phase 11 desktop state service.
- [ ] Inspect Electron bridge/preload/main.
- [ ] Inspect Settings page.
- [ ] Inspect Home/Projects placeholders.
- [ ] Inspect current tests.
- [ ] Inspect app package config and Electron storage paths.

## 4. Define project/settings models

- [ ] Add `.chdg` project file types.
- [ ] Add runtime parser/validator.
- [ ] Add project state mapping to/from desktop state.
- [ ] Add settings types.
- [ ] Add recent project types.
- [ ] Add dirty/output status types.

## 5. Implement Electron project/settings services

- [ ] Add safe project file save.
- [ ] Add Save As project file dialog.
- [ ] Add Open Project file dialog.
- [ ] Add project file read.
- [ ] Add settings read/write in local app data.
- [ ] Add recent projects read/write.
- [ ] Add FFmpeg diagnostic.
- [ ] Avoid arbitrary filesystem APIs.
- [ ] Preserve source/audio/output picker allowlists.

## 6. Add preload/bridge APIs

- [ ] Add project methods to preload.
- [ ] Add settings methods to preload.
- [ ] Add recent project methods to preload.
- [ ] Add FFmpeg diagnostic method.
- [ ] Update TypeScript bridge declarations.
- [ ] Update DesktopBridgeService.

## 7. Update desktop state/UI

- [ ] Add project file path.
- [ ] Add project name.
- [ ] Add dirty state.
- [ ] Add output status.
- [ ] Add missing path warnings.
- [ ] Add recent projects to Home/Projects.
- [ ] Add Save / Save As / Open flows.
- [ ] Update New Project to create project defaults.
- [ ] Update Settings page with persistent settings.
- [ ] Add FFmpeg path/diagnostic UI.
- [ ] Mark needs-regenerate when generation inputs change.

## 8. Preserve generation

- [ ] Ensure loaded project can inspect.
- [ ] Ensure loaded project can normalize.
- [ ] Ensure loaded project can generate.
- [ ] Ensure generated output updates generation status.
- [ ] Ensure known output overwrite behavior remains safe.

## 9. UX blocker fixes only

- [ ] Fix any inputs that block usability.
- [ ] Fix path overflow if it breaks layout.
- [ ] Fix missing scroll if content becomes inaccessible.
- [ ] Do not perform full visual redesign.

## 10. Tests

- [ ] Test project serialization.
- [ ] Test project parsing.
- [ ] Test invalid project file.
- [ ] Test unsupported schema version.
- [ ] Test settings defaults/read/write.
- [ ] Test recent projects add/remove/dedupe/limit.
- [ ] Test dirty state transitions.
- [ ] Test needs-regenerate transitions.
- [ ] Test missing path detection.
- [ ] Test FFmpeg diagnostic shape where practical.
- [ ] Preserve existing tests.

## 11. Validate

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

Manual validation:

- [ ] Create project.
- [ ] Save `.chdg`.
- [ ] Reopen `.chdg`.
- [ ] Recent project appears.
- [ ] Settings persist.
- [ ] FFmpeg diagnostic works.
- [ ] Generate after loading project.
- [ ] Changing input marks dirty/needs regenerate.
- [ ] Missing path warning works if file moved.

## 12. Docs/checklist

- [ ] Update `docs/phases/12-project-persistence-settings/CHECKLIST.md`.
- [ ] Update docs if actual schema/settings differ.
- [ ] Add note that broad UX polish is deferred until before packaging.
- [ ] Do not mark future phase work complete.

## 13. Git and PR

- [ ] Confirm branch is `feat/phase-12-project-persistence-settings`.
- [ ] Commit changes.
- [ ] Push branch.
- [ ] Create PR linked to issue when issue exists.
- [ ] Do not merge.
