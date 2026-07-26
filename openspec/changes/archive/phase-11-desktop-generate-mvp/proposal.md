# Proposal: Phase 11 — Desktop Generate MVP

## Change ID

`phase-11-desktop-generate-mvp`

## Summary

Implement the first usable CHDG Desktop workflow for generating a Clone Hero song folder from local MIDI or Guitar Pro/GPIF sources.

Phase 10 created the Electron + Angular desktop shell.
Phase 10A created `@chdg/project` and clean CLI JSON.
Phase 10B added multi-track normalization/generation.

Phase 11 connects the desktop shell to the structured project services through the secure Electron bridge and implements the core user workflow:

```txt
New Project
  -> select source file
  -> select required audio file
  -> select output folder
  -> inspect source
  -> select one or more drum tracks
  -> enter metadata/offset
  -> generate
  -> view logs/result
  -> open output folder
```

## Why this phase exists

The backend/CLI can now generate packages cleanly, including multi-track. The desktop shell exists but is still placeholders.

This phase turns the desktop app into a first usable local tool without yet introducing persistence, preview, validation checklist, or mapping overrides.

## Goals

1. Add native desktop file/folder pickers through Electron preload bridge.
2. Add New Project form in the desktop app.
3. Auto-detect source type by extension:
   - `.mid`
   - `.midi`
   - `.gp`
4. Require audio file for Desktop Generate MVP.
5. Allow output folder selection.
6. Allow metadata input:
   - name
   - artist
   - album
   - year
   - genre
   - charter
7. Allow offset input in milliseconds.
8. Inspect selected source through `@chdg/project`.
9. Show track candidates.
10. Allow selecting one or more tracks.
11. Show combined/normalization summary where available.
12. Generate via `@chdg/project.generatePackage`.
13. Show generation progress/log/status in the UI.
14. Show generated output files:
   - `notes.chart`
   - `song.ini`
   - `song.ogg`
15. Add Open Output Folder action through Electron bridge.
16. Preserve existing CLI/package behavior.

## Non-goals

- No `.chdg` project persistence.
- No recent projects/drafts.
- No save/load project.
- No validation checklist implementation.
- No audio/waveform preview.
- No Clone Hero highway preview.
- No offset adjustment preview.
- No mapping override UI.
- No mapping profiles.
- No individual note editing.
- No packaging/distribution.
- No external editor/Moonscraper integration.
- No automatic simplification of impossible chords.
- No full desktop hot reload/dev workflow unless trivial and isolated.
- No Electron deep-link/file association work.

## Product constraints

Continue to respect:

```txt
local-first
100% offline
local files only
no uploads
no YouTube/URL imports
no scraping
no Moonscraper dependency
.chdg is a project file, not Clone Hero output
Clone Hero output = folder with notes.chart, song.ini, song.ogg
```

## Required docs to read

```txt
docs/desktop/README.md
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
docs/phases/11-desktop-generate-mvp/PRD.md
docs/phases/11-desktop-generate-mvp/ADR.md
docs/phases/11-desktop-generate-mvp/CHECKLIST.md
docs/phases/10-desktop-app-shell/PRD.md
docs/phases/10a-structured-project-services/PRD.md
docs/phases/10b-multi-track-normalization-generation/PRD.md
```

Visual references:

```txt
docs/desktop/mockups/03-new-project.png
docs/desktop/mockups/04-inspect-source.png
docs/desktop/mockups/05-track-selection.png
docs/desktop/mockups/06-generate.png
```

Remember: if mockup text conflicts with `docs/desktop/mockup-corrections.md`, the docs are canonical.

## Branch

```txt
feat/phase-11-desktop-generate-mvp
```

## Expected architecture

Desktop should call structured services through Electron main/preload, not by parsing CLI text.

Recommended flow:

```txt
Angular renderer
  -> typed DesktopBridgeService
  -> preload bridge
  -> Electron main IPC handlers
  -> @chdg/project
```

The renderer must not access Node APIs directly.

Security constraints remain:

```txt
contextIsolation: true
nodeIntegration: false
explicit preload bridge
no fs/child_process direct access from Angular renderer
```

## Suggested bridge capabilities

Add explicit safe methods, for example:

```ts
pickSourceFile(): Promise<PickedFile | null>
pickAudioFile(): Promise<PickedFile | null>
pickOutputFolder(): Promise<PickedFolder | null>
inspectSource(input): Promise<JsonEnvelope<SourceInspectionResult>>
normalizeSelection(input): Promise<JsonEnvelope<NormalizationPreview>>
generatePackage(input): Promise<JsonEnvelope<GeneratePackageResult>>
openOutputFolder(path): Promise<JsonEnvelope<{ opened: true }>>
```

Exact names can follow existing project style.

## UI workflow

This phase can be implemented as a simple guided flow inside the existing desktop routes. It does not need full project persistence.

Minimum usable workflow:

```txt
New Project:
  source file
  audio file required
  output folder
  metadata
  offset ms

Inspect Source:
  source inspection result
  track candidates
  warnings/issues

Track Selection:
  single/multi-track selection
  combined summary after selection

Generate:
  generation status/logs
  output files
  open output folder
```

The app may keep state in memory only for this phase.

## Output folder behavior

Recommended behavior:

```txt
user selects output folder
generation writes notes.chart/song.ini/song.ogg into that folder
if folder exists, do not silently delete arbitrary files
warn or require explicit confirmation before overwriting known output files
```

MVP may use a simple safe overwrite policy:

```txt
overwrite notes.chart/song.ini/song.ogg only after UI confirmation
never recursively clear the output directory
```

## Validation

Required:

```bash
pnpm build
pnpm typecheck
pnpm test
```

Desktop validation:

```bash
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
```

or equivalent if workspace script names differ.

Manual desktop smoke validation:

```txt
desktop app launches
source picker opens
audio picker opens
output folder picker opens
source inspection works with samples/demo.gp or samples/demo.mid
track candidates render
single-track selection works
multi-track selection works if meaningful sample exists
generation creates notes.chart, song.ini, song.ogg
output result renders
Open Output Folder works
existing CLI commands still work
```

If desktop cannot be launched in the agent environment, state that clearly and provide build/typecheck/test evidence.

## Review policy

The implementation agent should do focused self-checks only.

Final PR review is external and will be performed by Jon/ChatGPT.

The agent must not merge.
