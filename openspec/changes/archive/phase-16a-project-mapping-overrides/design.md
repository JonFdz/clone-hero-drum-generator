# Design: Phase 16A — Project Mapping Overrides

## Overview

Phase 16A adds project-scoped mapping overrides.

Overrides are stored in `.chdg`, applied during normalization/generation, and exposed in the desktop UI for review and editing.

## Architecture

Recommended split:

```txt
packages/project
  project mapping override types
  project read/write persistence
  normalization/generation integration

packages/core or mapper package
  override application helper

apps/desktop/src/app/services
  mapping override state/service
  integration with project/generate state

apps/desktop/src/app/pages or components
  Mapping Overrides UI
```

Use existing package boundaries where possible.

## Data model

Use a project-scoped model.

Recommended shape:

```ts
type MappingOverrideTarget =
  | { kind: "piece"; piece: DrumPiece }
  | { kind: "ignore" };

type ProjectMappingOverride = {
  sourceKind: "midi" | "gpif";
  key: string;
  target: MappingOverrideTarget;
  label?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

A map/object shape is acceptable if it is easy to save, load, validate, and migrate.

## Key strategy

Recommended keys:

```txt
midi:<noteNumber>
gpif:<sourceKey>
```

Use actual source trace data if the repo already exposes a stable key.

Do not invent keys that cannot be recovered from inspection/normalization data.

## Override application

Apply overrides before or during normalization.

Algorithm:

```txt
for each source event/hit:
  build source override key
  if override exists:
    if target ignore -> skip
    if target piece -> use target piece
  else:
    use automatic mapping
```

Preserve source trace where possible.

## UI design

Show a table/card list.

Fields:

```txt
source kind
source key
source label
detected count / first hit if available
automatic mapping
override target
ignore action
reset action
status/limitations
```

Targets should use `DrumPiece` names.

Avoid Clone Hero color-only labels.

## Staleness

Override changes should mark existing preview/output stale.

MVP behavior:

```txt
mark project dirty
mark outputStatus needs-regenerate if generated
clear normalization preview or show stale warning
```

## Validation

Validate persisted overrides:

```txt
known source kind
non-empty key
target kind is piece/ignore
piece is valid DrumPiece
```

Malformed overrides should produce validation warnings/errors and not crash.

## Tests

Prefer pure helper tests:

```txt
override key creation
MIDI override application
GPIF override application
ignore behavior
sidestick -> snare
reset/removal behavior
persist/read roundtrip
old project without overrides loads
stale state after override change
```

## Scope guard

Do not implement:

```txt
global profiles
profile import/export
Songsterr-specific profile system
note editor
automatic mapping detection/ML
packaging
full UX polish
```
