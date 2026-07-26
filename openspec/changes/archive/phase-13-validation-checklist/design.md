# Design: Phase 13 — Validation Checklist / Pre-Generate Review

## Overview

Phase 13 adds a project-aware validation layer.

The validation layer should be structured enough to support:

```txt
Validation page
Generate page preflight
future project dashboard badges
future packaging readiness
```

## Architecture

Recommended split:

```txt
packages/project
  validation types and pure helpers where portable

apps/desktop/src/app/services
  DesktopValidationService
  integration with project/generate/settings state

apps/desktop/electron
  explicit path/FFmpeg checks only where needed
```

Do not put all validation logic directly in components.

## Validation sources

Validation should consume:

```txt
DesktopGenerateStateService state
DesktopProjectStateService state
settings / FFmpeg diagnostic
missing path info from project load
normalization preview issues
generation issues
merge summary
output status
```

## Filesystem checks

Renderer cannot access Node APIs.

Any filesystem checks needed after project changes should go through explicit Electron bridge methods.

If Phase 12 already provides missing path information on project open, reuse it.

If live existence checks are needed, add a narrow bridge method such as:

```ts
validateProjectPaths(input): Promise<JsonEnvelope<PathValidationResult>>
```

Do not expose arbitrary filesystem APIs.

## Validation item design

Use stable IDs.

Examples:

```txt
source.missing
source.unsupported
source.path-missing
audio.missing
audio.path-missing
output.missing
tracks.missing
ffmpeg.unavailable
generation.needs-regenerate
chart.impossible-hand-chord
chart.hihat-conflict
metadata.missing-artist
metadata.missing-charter
```

## Blocking rules

Errors block generation. Warnings and info do not.

Do not over-block.

Examples of non-blocking:

```txt
missing album
missing genre
duplicate hits deduped
hi-hat conflict resolved
impossible hand chord warning
needs-regenerate status
```

`needs-regenerate` should warn, not block, because the user may be about to regenerate.

## Generate page integration

Generate page should run validation before generation.

Suggested behavior:

```txt
show validation card
disable primary Generate button if canGenerate is false
or allow click but show blocking errors and do not start generation
```

Keep existing overwrite confirmation.

## Validation page

Implement `/validation` as a real page.

Suggested sections:

```txt
Summary
Errors
Warnings
Info
Category cards
Fix actions
```

Fix actions can be simple route links:

```txt
source/audio/output -> New Project
tracks -> Track Selection
ffmpeg -> Settings
warnings from chart -> Track Selection / Generate
```

Do not build a full action automation framework.

## Project persistence

Validation summary can be recomputed.

Storing last validation summary is optional.

If stored, do not make a breaking `.chdg` schema change.

## Tests

Prefer pure tests for validation rules.

Recommended test locations:

```txt
packages/project/src/validation*.test.ts
apps/desktop/src/app/services/desktop-validation*.test.ts
```

Add component tests only if existing setup makes it easy.

## Scope guard

Do not implement:

```txt
preview player
waveform
highway
mapping overrides
note editing
packaging
full visual polish
```
