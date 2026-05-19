# Checklist Phase 11: Desktop Generate MVP

## Before implementation

- [x] Read `docs/desktop/README.md`.
- [x] Read `docs/desktop/decisions.md`.
- [x] Read `docs/desktop/mockup-corrections.md`.
- [x] Read this phase PRD.
- [x] Read this phase ADR.
- [x] Review visual references.
- [x] Read OpenSpec artifacts for `phase-11-desktop-generate-mvp`.
- [x] Transferred accepted context, decisions, non-goals, validation commands, branch and review policy into Engram.

## Implementation

- [x] Implement only this phase scope.
- [x] Preserve existing tests.
- [x] Add/update tests for new behavior.
- [x] Add native source/audio/output pickers through explicit preload bridge methods.
- [x] Add project service IPC handlers for inspect, normalize, generate, and open output folder.
- [x] Implement in-memory New Project, Inspect Source, Track Selection, and Generate workflow screens.
- [x] Preserve Electron security: `contextIsolation: true`, `nodeIntegration: false`, explicit preload bridge.
- [x] Restrict source/audio/output paths to files/folders selected through desktop pickers in the current session.

## Bridge / IPC names

Implemented bridge methods:

```txt
pickSourceFile()
pickAudioFile()
pickOutputFolder()
inspectSource(input)
normalizeSelection(input)
generatePackage(input)
openOutputFolder(path)
```

Implemented IPC channels:

```txt
dialog:pick-source-file
dialog:pick-audio-file
dialog:pick-output-folder
chdg:inspect-source
chdg:normalize-selection
chdg:generate-package
shell:open-output-folder
```

## Path allowlist behavior

- [x] `inspectSource` requires `sourcePath` selected through `pickSourceFile()`.
- [x] `normalizeSelection` requires `sourcePath` selected through `pickSourceFile()`.
- [x] `generatePackage` requires source, audio, and output paths selected through their dedicated pickers.
- [x] Paths are normalized before being passed to `@chdg/project`.
- [x] Open Output Folder remains limited to selected/generated output folders.

## Output overwrite behavior

- [x] The desktop flow does not recursively clear output directories.
- [x] Before generation, Electron main checks only known CHDG output files: `notes.chart`, `song.ini`, `song.ogg`.
- [x] If known output files already exist, generation returns `OVERWRITE_CONFIRMATION_REQUIRED`; the renderer asks for confirmation and retries with `overwriteKnownFiles: true`.
- [x] Only known CHDG output files are overwritten by `@chdg/project.generatePackage`; arbitrary files are not deleted.

## Validation

- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes.
- [x] `pnpm --filter @chdg/desktop build` passes.
- [x] `pnpm --filter @chdg/desktop typecheck` passes.
- [ ] Manual desktop launch validation recorded.

## Manual validation note

Manual GUI smoke validation was not completed in this agent environment. Build/typecheck/test evidence is recorded for PR review.

## Deferred

- [x] Do not implement future phases unless explicitly approved.
- [x] No `.chdg` persistence.
- [x] No recent projects/drafts.
- [x] No validation checklist implementation.
- [x] No preview player, waveform, or highway.
- [x] No mapping overrides.
- [x] No packaging/distribution.
- [x] No external editor/Moonscraper integration.
