# CHDG Simplified V1 Task Checklist

Check only work actually completed. Wave 0 does not authorize production apply
work.

## 0. Wave 0 specification

- [x] Record maintainer-approved product decisions.
- [x] Replace product PRD in the transfer package.
- [x] Audit current repository gaps.
- [x] Define domain, project schema, routes, progress, and IPC contracts.
- [x] Record ADRs.
- [x] Define backend/design/frontend/integration roadmap.
- [x] Define worktree waves, hotspots, merge order, and milestones.
- [x] Define issue specifications and implementation prompts.
- [x] Define acceptance, test, harness, and traceability plans.
- [x] Copy final approved mockups byte-for-byte.
- [x] Create OpenSpec proposal, design, requirements, and tasks.
- [ ] Apply package to a `spec/chdg-simplified-v1` branch.
- [ ] Verify overlay paths at repository root.
- [ ] Open Wave 0 review PR.
- [ ] Maintainer approves Wave 0.
- [ ] Transfer approved OpenSpec to Engram.
- [ ] Create actual GitHub issues and replace planning IDs with real numbers.

## 1. B1 — Project/domain contract

- [ ] Define direct project schema V1.
- [ ] Define `projectId` and mandatory identity.
- [ ] Define relative asset manifest.
- [ ] Define persisted imported hits and stable IDs.
- [ ] Define timing/source document.
- [ ] Define two-level mappings.
- [ ] Define sparse individual corrections.
- [ ] Define editor/offset state.
- [ ] Define internal export manifest.
- [ ] Implement strict validation.
- [ ] Add serialization/round-trip/collision tests.
- [ ] Approve B1 contract checkpoint.
- [ ] Merge B1 before dependent backend work.

## 2. D1 — Simplified IA

- [ ] Preserve historical Pencil content.
- [ ] Add supersession record.
- [ ] Add approved mockups as reference section.
- [ ] Define no-sidebar application and creation chrome.
- [ ] Define active project header.
- [ ] Define Preview/Mappings permanent navigation.
- [ ] Define contextual Project Details/Edit Note/Export.
- [ ] Define 1440 and 1024 structural strategies.
- [ ] Define component/state inventory.
- [ ] Validate Pencil and report D1 checkpoint.
- [ ] Maintainer approves D1.

## 3. B2 — Import

- [ ] Implement analyze-import service.
- [ ] Implement track recommendation/manual selection data.
- [ ] Implement mapping candidates.
- [ ] Implement temporary project creation.
- [ ] Archive source.
- [ ] Convert internal OGG.
- [ ] Prepare optional cover.
- [ ] Materialize source document.
- [ ] Emit real progress.
- [ ] Validate and atomically commit final project folder.
- [ ] Roll back failed temporary creation.
- [ ] Add synthetic tests.

## 4. B3 — Effective chart

- [ ] Implement stable hit identity.
- [ ] Implement musical piece resolution.
- [ ] Implement Clone Hero target resolution.
- [ ] Implement correction precedence.
- [ ] Implement piece/target/flags/delete/restore commands.
- [ ] Enforce accent/ghost exclusion.
- [ ] Enforce no tick/length/add/move.
- [ ] Emit zero-length effective notes.
- [ ] Add mapping-preserves-correction tests.
- [ ] Add deterministic round-trip tests.

## 5. B4 — Persistence

- [ ] Implement atomic save.
- [ ] Implement `recovery/previous.chdg`.
- [ ] Implement coalescing autosave queue.
- [ ] Implement close/switch flush.
- [ ] Implement transactional identity/folder rename.
- [ ] Implement catalog metadata.
- [ ] Implement Save a Copy full-folder duplication.
- [ ] Reset copy ID/export ownership.
- [ ] Add failure/rollback/concurrency tests.

## 6. D2 — Pencil

- [ ] Create Simplified V1 component system.
- [ ] Create required 1440 main frames.
- [ ] Validate/report 1440 checkpoint.
- [ ] Maintainer approves 1440.
- [ ] Create advisory/error/contextual states.
- [ ] Create required 1024 adaptations.
- [ ] Validate/report 1024/state checkpoint.
- [ ] Maintainer approves D2.
- [ ] Record final Pencil hash.

## 7. B5 — Project-backed Preview

- [ ] Derive preview from project/effective chart.
- [ ] Load internal `assets/song.ogg`.
- [ ] Expose stable note IDs and correction metadata.
- [ ] Implement indexed hit testing/visible note queries.
- [ ] Preserve waveform/Highway timing.
- [ ] Implement duration warning.
- [ ] Implement internal audio error.
- [ ] Add synthetic multi-tempo Decode-style regression.
- [ ] Add large-chart performance tests.

## 8. B6 — Exporter

- [ ] Generate chart/ini from project.
- [ ] Copy internal audio/cover.
- [ ] Compute desired fingerprints.
- [ ] Compare internal export manifest and target.
- [ ] Preserve unmanaged files.
- [ ] Require confirmation for ambiguity/external changes.
- [ ] Stage and validate changed managed files.
- [ ] Commit atomically/with rollback evidence.
- [ ] Update project export manifest.
- [ ] Emit real progress.
- [ ] Return updated/unchanged/removed summary.
- [ ] Add export failure and external modification tests.

## 9. F1 — Shell/Home/Settings

- [ ] Remove permanent sidebar.
- [ ] Implement minimal app header.
- [ ] Implement Home and Projects hierarchy.
- [ ] Implement Settings presentation.
- [ ] Add canonical routes/temporary redirects.
- [ ] Add deterministic fixtures and component tests.
- [ ] Validate 1440/1024 and keyboard navigation.

## 10. F2 — Create Project

- [ ] Implement Details step.
- [ ] Implement mandatory validation and derived-name preview.
- [ ] Implement Track & Mapping step.
- [ ] Implement recommended/manual track states.
- [ ] Implement unknown mapping flow.
- [ ] Implement real-step progress facade/UI.
- [ ] Implement failure/retry states.
- [ ] Open Editor after completion.
- [ ] Add harness scenarios/tests.

## 11. D3 — Design handoff

- [ ] Finalize screen/state inventory.
- [ ] Finalize route/scenario map.
- [ ] Finalize component inventory.
- [ ] Finalize interaction/keyboard notes.
- [ ] Finalize responsive rules.
- [ ] Classify behavior/proposals/unresolved.
- [ ] Validate all Pencil frames.
- [ ] Publish implementation handoff.
- [ ] Maintainer approves D3.

## 12. B7 — Electron/IPC

- [ ] Extract modular handlers from `main.ts`.
- [ ] Define preload/global/renderer typed API.
- [ ] Implement job progress subscription lifecycle.
- [ ] Adapt import/project/preview/edit/export services.
- [ ] Validate all payloads/paths/IDs.
- [ ] Keep renderer filesystem-isolated.
- [ ] Add IPC contract tests.
- [ ] Ensure one owner changed hotspots.

## 13. F3 — Editor base

- [ ] Implement contextual project header.
- [ ] Implement Preview/Mappings tabs.
- [ ] Reuse transport/waveform/Highway.
- [ ] Bind project-backed preview facade.
- [ ] Implement offset.
- [ ] Implement note selection shell.
- [ ] Implement warnings/diagnostics disclosure.
- [ ] Add 1440/1024/harness tests.

## 14. F6 — Project Details/autosave

- [ ] Implement contextual details surface.
- [ ] Implement mandatory identity/metadata/cover/output.
- [ ] Implement Apply-time rename states.
- [ ] Implement Saving/Saved/Save failed.
- [ ] Implement Save a Copy.
- [ ] Implement collision/failure states.
- [ ] Add keyboard/focus/tests.

## 15. F4 — Note corrections

- [ ] Implement note inspector.
- [ ] Implement piece and target changes.
- [ ] Implement tom/cymbal and hi-hat controls.
- [ ] Implement accent/ghost mutual exclusion.
- [ ] Implement delete/restore.
- [ ] Implement Undo/Redo.
- [ ] Exclude timing/duration/add controls.
- [ ] Add keyboard/tests/harness states.

## 16. F5 — Mappings

- [ ] Implement compact two-level rows.
- [ ] Implement unknown mapping piece then target.
- [ ] Implement target color references.
- [ ] Implement reset confirmation.
- [ ] Preserve individual corrections.
- [ ] Refresh Preview.
- [ ] Add tests/harness states.

## 17. F7 — Export UI

- [ ] Implement Export/Update action.
- [ ] Implement managed-file confirmation.
- [ ] Implement ambiguity/external-change states.
- [ ] Implement real-step progress.
- [ ] Implement success/failure/result summary.
- [ ] Implement Done returning to Editor.
- [ ] Add tests/harness states.

## 18. I1 — Final integration

- [ ] Integrate real IPC facades.
- [ ] Remove obsolete workflow navigation/routes/components after verification.
- [ ] Complete deterministic browser harness.
- [ ] Validate all 1440/1024 states.
- [ ] Validate keyboard/focus/contrast/zoom.
- [ ] Validate large-chart performance.
- [ ] Validate portable-folder behavior.
- [ ] Validate autosave/recovery.
- [ ] Validate multi-tempo regression.
- [ ] Validate atomic export.
- [ ] Run build/typecheck/lint/test.
- [ ] Update PRD/architecture/design/handoff as-built.
- [ ] Produce release-candidate evidence.
- [ ] External review.
- [ ] Maintainer approves merge.

## 19. Milestone 2

- [ ] Specify/implement Replace Project Audio.
- [ ] Specify/implement Import Updated Source as New Version.
- [ ] Do not modify original project.
- [ ] Do not auto-transfer corrections without approved reconciliation.
