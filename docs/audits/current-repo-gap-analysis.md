# Current Repository Gap Analysis — Simplified V1

**Baseline:** `main@ac5ccefcd72b4c46be9e6d8e1e605a598fc0d856`

## Strengths to preserve

- MIDI and GPIF normalize into rich `DrumHit[]`.
- Hits contain tick, piece, velocity, duration provenance, and source metadata.
- Timing already includes resolution, tempo events, time signatures, and sections.
- Chart writer already emits tempo events.
- Preview already has audio, waveform, sections, timing diagnostics, and Highway.
- Electron already has projects, recents, settings, pickers, and project persistence.
- Settings already contain project and default output locations.
- Mapping override/candidate infrastructure exists.

## Gaps

### Visible flow

Current routes expose Project Details, Source Review, Generate, and Preview. Simplified V1 needs two-step creation plus a Preview/Mappings editor.

### Shell

Current permanent sidebar and global Open/Save/Save As conflict with contextual navigation and autosave.

### External dependencies

Current project stores source/audio/output/cover paths and reports missing external paths. The new project must use internal relative assets.

### Missing editable aggregate

Current `.chdg` lacks:

- imported base hits;
- stable hit IDs;
- two-level target mapping state;
- individual corrections;
- internal asset manifest;
- export fingerprints.

### Generation

Current generation re-reads source and original audio every time. Import and export must become separate services.

### Preview

Current Preview reads generated `notes.chart`/`song.ogg`. New Preview must project the internal document before first export.

### Mapping

Current override changes the musical piece and then uses a fixed piece→lane table. This cannot preserve Ride while selecting Green Cymbal.

### Persistence

Current project save is direct. New save requires temporary validation, atomic replacement, and one previous valid copy.

### Progress

Current IPC is primarily request/response. Creation/export need operation-scoped real progress events.

### Editing

Current Preview events lack stable note IDs and correction commands.

## Superseded design

The merged Pencil Design V1 remains useful for foundations, components, and Highway reference. Its Details → Source Review → Generate → Preview IA is historical and must be preserved separately from the new Simplified V1.

## Likely implementation areas

Backend/domain:

```text
packages/core
packages/project
packages/mappings
packages/chart
packages/audio
packages/validation
```

Desktop hotspots:

```text
apps/desktop/electron/main.ts
apps/desktop/electron/preload.cts
apps/desktop/electron/projectFileService.ts
apps/desktop/src/app/services/desktop-bridge.service.ts
apps/desktop/src/app/state/project-session/**
```

Frontend:

```text
apps/desktop/src/app/app.routes.ts
apps/desktop/src/app/app.component.*
apps/desktop/src/app/features/home/
apps/desktop/src/app/features/projects/
apps/desktop/src/app/features/project-details/
apps/desktop/src/app/features/source-review/
apps/desktop/src/app/features/generation/
apps/desktop/src/app/features/preview/
apps/desktop/src/browser-harness/
```

Implement project/package contracts first, then Electron integration, then final renderer wiring.
