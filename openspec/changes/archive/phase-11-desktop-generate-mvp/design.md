# Design: Phase 11 — Desktop Generate MVP

## Overview

Phase 11 connects the desktop shell to `@chdg/project`.

The goal is a usable local generation workflow without project persistence.

High-level flow:

```txt
Angular renderer
  -> DesktopBridgeService
  -> preload bridge
  -> Electron main IPC handlers
  -> @chdg/project
```

The renderer must remain sandboxed and should not access Node APIs directly.

## State model

This phase can keep state in memory only.

Suggested state:

```ts
type DesktopGenerateState = {
  sourcePath?: string;
  sourceKind?: "midi" | "gpif";
  audioPath?: string;
  outputDir?: string;
  metadata: {
    name?: string;
    artist?: string;
    album?: string;
    year?: string;
    genre?: string;
    charter?: string;
  };
  offsetMs?: number;
  inspection?: SourceInspectionResult;
  selectedTracks: number[];
  normalizationPreview?: NormalizationPreview;
  generationResult?: GeneratePackageResult;
  issues: ProjectIssue[];
  status:
    | "idle"
    | "ready-to-inspect"
    | "inspecting"
    | "ready-to-generate"
    | "generating"
    | "generated"
    | "error";
};
```

Do not save `.chdg` files in this phase.

## Bridge design

Add explicit preload APIs.

Suggested API surface:

```ts
type DesktopBridgeApi = {
  pickSourceFile(): Promise<PickResult | null>;
  pickAudioFile(): Promise<PickResult | null>;
  pickOutputFolder(): Promise<PickResult | null>;
  inspectSource(input: InspectSourceInput): Promise<JsonEnvelope<SourceInspectionResult>>;
  normalizeSelection(input: NormalizeSelectionInput): Promise<JsonEnvelope<NormalizationPreview>>;
  generatePackage(input: GeneratePackageInput): Promise<JsonEnvelope<GeneratePackageResult>>;
  openOutputFolder(path: string): Promise<JsonEnvelope<{ opened: true }>>;
};
```

Names can differ, but capabilities should remain explicit and narrow.

## IPC handlers

Electron main should register handlers for:

```txt
dialog:pick-source-file
dialog:pick-audio-file
dialog:pick-output-folder
chdg:inspect-source
chdg:normalize-selection
chdg:generate-package
shell:open-output-folder
```

or equivalent naming.

Security:

```txt
validate/normalize inputs in main
do not expose arbitrary file read/write
do not expose arbitrary command execution
do not expose shell.openPath for arbitrary renderer strings without at least basic path validation
```

## File pickers

Source picker:

```txt
.mid
.midi
.gp
```

Audio picker:

```txt
common local audio formats accepted by current audio pipeline
at minimum, allow .mp3, .wav, .ogg if supported by current implementation/ffmpeg flow
```

Output folder picker:

```txt
directory only
```

## Workflow screens

### New Project

Fields:

```txt
source file
audio file required
output folder
metadata
offset ms
```

Actions:

```txt
Inspect Source
Continue
```

### Inspect Source

Shows:

```txt
source kind
tracks
drum candidates
tempos/time signatures/sections summary
issues
```

Action:

```txt
Use Selected Track(s)
```

### Track Selection

Shows:

```txt
track candidates
checkbox/multi-select
selected tracks
normalization preview
piece summary
merge summary
warnings/issues
```

Action:

```txt
Generate
```

### Generate

Shows:

```txt
input summary
status/log
generated files
issues/warnings
Open Output Folder
```

A full progress event stream is not required if `@chdg/project` does not expose real progress yet. A step/status log is acceptable.

## Output overwrite safety

Do not recursively clear output directories.

Recommended MVP behavior:

```txt
if notes.chart/song.ini/song.ogg exist, ask confirmation before overwriting
overwrite only known output files
```

If confirmation UI is too much for this phase, generation should at least warn clearly before replacing known files or use a safe selected output folder.

## Error handling

Errors from bridge/project services should become user-visible error cards.

The UI should not crash if:

```txt
source unsupported
audio missing
output folder missing
track missing
generation fails
ffmpeg/audio conversion fails
```

## Integration with `@chdg/project`

Use:

```txt
inspectSource
normalizeSelection
generatePackage
```

Do not call CLI commands or parse CLI text.

## Testing strategy

Unit/component tests where current desktop test setup supports it.

Recommended tests:

```txt
DesktopBridgeService handles missing bridge
form validation blocks missing audio
source type detection
track selection state
bridge methods called with expected inputs
generation result display
error state display
```

Electron main/preload tests can be minimal if the repo does not yet have a strong pattern.

## Manual validation

Manual smoke is important for this phase.

Use local samples where available:

```txt
samples/demo.gp
samples/demo.mid
samples/demo.mp3
```

Try:

```txt
single-track GPIF generate
multi-track GPIF generate if meaningful
single-track MIDI generate
Open Output Folder
```

## Scope guard

Do not implement:

```txt
.chdg persistence
recent projects
validation checklist
preview player
offset adjustment preview
mapping overrides
packaging
external editor integration
```
