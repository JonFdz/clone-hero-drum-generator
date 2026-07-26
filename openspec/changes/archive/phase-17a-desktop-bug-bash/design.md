# Design: Phase 17A — Desktop Bug Bash

## Overview

Phase 17A fixes functional desktop bugs without broad UI redesign.

The first bug is the false `0 notes` rendering in Inspect Source for GPIF tracks.

## Architecture focus

Likely affected areas:

```txt
packages/guitarpro
packages/project inspection DTOs
apps/desktop/electron bridge validation/payload
apps/desktop/src/app/pages/inspect-source
apps/desktop/src/app/pages/track-selection
tests around inspection and display models
```

Use the actual repo structure when implementing. Do not invent new large abstractions unless needed.

## Count semantics

The central design decision is that a numeric `0` must mean known zero.

Unknown or unavailable counts must not be represented as `0`.

Recommended representation:

```ts
type TrackCount =
  | { kind: "known"; value: number }
  | { kind: "unknown" }
  | { kind: "not-applicable" };
```

A simpler implementation is acceptable if the distinction is preserved, for example:

```ts
noteCount?: number;
noteCountStatus?: "known" | "unknown" | "not-applicable";
```

or:

```ts
noteCount: number | null;
```

with clear formatting.

## Rendering rules

Use a central formatter for track count display if possible.

Recommended behavior:

```txt
known number -> "N notes"
unknown -> "n/a" or "Available after normalization"
not applicable -> "n/a"
```

Never format `undefined`, `null`, or unknown values as `0 notes`.

## Backend/DTO investigation

Implementation should identify the source of the false zero:

```txt
GPIF parser has no count and defaults to 0
project service DTO defaults missing count to 0
desktop bridge payload defaults missing count to 0
Angular UI uses ?? 0 or || 0
```

Fix at the earliest correct boundary, but keep UI defensive.

## Consistency

Detected tracks table and drum candidates cards should use the same count semantics.

If one says unknown, the other should not say zero for the same track.

## Tests

Prefer pure tests for:

```txt
GPIF inspect count unknown/unavailable behavior
MIDI inspect count known behavior
formatter does not turn unknown into 0 notes
candidate card/table use same formatted value if model helpers exist
```

If the UI does not have model helpers, extract a small pure formatter/helper.

## Scope guard

Do not implement preview redesign here.

The following are explicitly deferred:

```txt
real waveform rendering
timeline lane redesign
highway redesign
home/projects redesign
packaging
external editor integration
note editing
automatic offset detection
```

## Safety

Preserve Electron security:

```txt
contextIsolation: true
nodeIntegration: false
sandbox: true
explicit preload bridge
no generic file access from renderer
```
