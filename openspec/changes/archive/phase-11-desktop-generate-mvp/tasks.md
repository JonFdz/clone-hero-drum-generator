# Tasks: Phase 11 — Desktop Generate MVP

## 1. Read project context

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/phases/11-desktop-generate-mvp/PRD.md`.
- [ ] Read `docs/phases/11-desktop-generate-mvp/ADR.md`.
- [ ] Read `docs/phases/11-desktop-generate-mvp/CHECKLIST.md`.
- [ ] Read `docs/phases/10-desktop-app-shell/PRD.md`.
- [ ] Read `docs/phases/10a-structured-project-services/PRD.md`.
- [ ] Read `docs/phases/10b-multi-track-normalization-generation/PRD.md`.
- [ ] Review visual references:
  - `docs/desktop/mockups/03-new-project.png`
  - `docs/desktop/mockups/04-inspect-source.png`
  - `docs/desktop/mockups/05-track-selection.png`
  - `docs/desktop/mockups/06-generate.png`
- [ ] Read these OpenSpec artifacts:
  - `proposal.md`
  - `design.md`
  - `specs/desktop-generate-mvp/spec.md`
  - `tasks.md`
  - `verify.md`

## 2. Sync context to Engram

- [ ] Save change ID: `phase-11-desktop-generate-mvp`.
- [ ] Save branch name: `feat/phase-11-desktop-generate-mvp`.
- [ ] Save issue number once created.
- [ ] Save scope: Desktop Generate MVP only.
- [ ] Save source formats: `.mid`, `.midi`, `.gp`.
- [ ] Save audio required for Desktop MVP.
- [ ] Save output files: `notes.chart`, `song.ini`, `song.ogg`.
- [ ] Save architecture: Angular renderer -> preload bridge -> Electron main -> `@chdg/project`.
- [ ] Save security constraints:
  - `contextIsolation: true`
  - `nodeIntegration: false`
  - explicit preload bridge
  - no direct Node APIs in renderer.
- [ ] Save non-goals:
  - no `.chdg` persistence
  - no recent projects
  - no validation checklist
  - no preview player
  - no mapping overrides
  - no packaging
  - no external editor/Moonscraper integration.
- [ ] Save review rule: final PR review is external and must be done by Jon/ChatGPT.
- [ ] Save merge rule: never merge without Jon's explicit approval.

## 3. Inspect current implementation

- [ ] Inspect `apps/desktop`.
- [ ] Inspect Electron main/preload bridge.
- [ ] Inspect desktop routes/pages.
- [ ] Inspect current desktop services.
- [ ] Inspect `@chdg/project` exports.
- [ ] Inspect current package build order/workspace dependencies.
- [ ] Inspect desktop test setup.

## 4. Add bridge capabilities

- [ ] Add source file picker.
- [ ] Add audio file picker.
- [ ] Add output folder picker.
- [ ] Add inspect source IPC handler.
- [ ] Add normalize selection IPC handler.
- [ ] Add generate package IPC handler.
- [ ] Add open output folder IPC handler.
- [ ] Type the preload API.
- [ ] Ensure renderer does not access Node directly.
- [ ] Add safe error envelopes.

## 5. Build desktop state/services

- [ ] Add/update DesktopBridgeService.
- [ ] Add in-memory generation workflow state.
- [ ] Add source type detection.
- [ ] Add metadata/offset model.
- [ ] Add selected tracks model.
- [ ] Add issues/error state model.
- [ ] Add generated result model.

## 6. Implement New Project screen

- [ ] Source file field + picker.
- [ ] Audio file field + picker.
- [ ] Output folder field + picker.
- [ ] Metadata fields.
- [ ] Offset ms input.
- [ ] Audio required validation.
- [ ] Source type display.
- [ ] Inspect Source action.

## 7. Implement Inspect Source screen

- [ ] Run inspect through bridge.
- [ ] Display source kind.
- [ ] Display tracks.
- [ ] Display drum candidates.
- [ ] Display tempo/time signature/section summaries.
- [ ] Display issues/warnings.
- [ ] Allow continue to track selection.

## 8. Implement Track Selection screen

- [ ] Render track candidates.
- [ ] Allow single and multi-track selection.
- [ ] Run normalization preview.
- [ ] Display selected tracks.
- [ ] Display hit count.
- [ ] Display piece summary.
- [ ] Display first hits.
- [ ] Display merge summary when multi-track.
- [ ] Display issues/warnings.

## 9. Implement Generate screen

- [ ] Render input summary.
- [ ] Trigger generate through bridge.
- [ ] Show generating status.
- [ ] Show success/error result.
- [ ] Show generated files.
- [ ] Show selected tracks and merge summary.
- [ ] Show issues/warnings.
- [ ] Add Open Output Folder action.

## 10. Output overwrite safety

- [ ] Do not recursively delete output folder contents.
- [ ] Add safe behavior for known files if they already exist.
- [ ] Prefer confirmation before overwriting `notes.chart`, `song.ini`, or `song.ogg`.
- [ ] Document actual behavior in PR.

## 11. Tests

- [ ] Test source type detection.
- [ ] Test missing audio validation.
- [ ] Test missing source/output validation.
- [ ] Test bridge service with missing bridge.
- [ ] Test inspect flow state where practical.
- [ ] Test selected tracks state.
- [ ] Test generate request payload.
- [ ] Test generation result rendering.
- [ ] Test error rendering.
- [ ] Preserve existing tests.

## 12. Validate

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
```

Desktop-specific:

```bash
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
```

or equivalent.

Manual validation:

- [ ] Desktop app launches.
- [ ] Source picker opens.
- [ ] Audio picker opens.
- [ ] Output folder picker opens.
- [ ] Inspect `samples/demo.gp`.
- [ ] Inspect `samples/demo.mid`.
- [ ] Select single track.
- [ ] Select multiple tracks where meaningful.
- [ ] Generate GPIF package.
- [ ] Generate MIDI package.
- [ ] Generated output contains `notes.chart`, `song.ini`, `song.ogg`.
- [ ] Open Output Folder works.
- [ ] Existing CLI commands still work.

If desktop cannot be launched in the environment, state that clearly in PR.

## 13. Docs/checklist

- [ ] Update `docs/phases/11-desktop-generate-mvp/CHECKLIST.md`.
- [ ] Update docs if actual bridge/API/screen names differ.
- [ ] Do not mark future phase work complete.

## 14. Git and PR

- [ ] Confirm branch is `feat/phase-11-desktop-generate-mvp`.
- [ ] Commit changes.
- [ ] Push branch.
- [ ] Create PR linked to issue when issue exists.
- [ ] Do not merge.
