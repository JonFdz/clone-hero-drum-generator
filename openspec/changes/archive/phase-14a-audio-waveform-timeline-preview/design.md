# Design: Phase 14A — Audio + Waveform + Timeline Preview

## Overview

Phase 14A adds a read-only preview page for local audio and timeline-style chart inspection.

It intentionally avoids:

```txt
Clone Hero highway
persisted offset adjustment loop
note editing
mapping overrides
```

## Architecture

Recommended split:

```txt
apps/desktop/electron
  preview audio/chart source IPC handlers
  path validation

apps/desktop/src/app/services
  DesktopPreviewService
  preview model/helpers
  waveform/timeline helpers

apps/desktop/src/app/pages/preview
  audio controls
  waveform/waveform-like visualization
  timeline notes
  playhead
```

## Secure local preview

Renderer must not construct arbitrary `file://` URLs.

Recommended bridge capabilities:

```ts
getAudioPreviewSource(input): Promise<JsonEnvelope<{ src: string; sourceKind: "generated" | "selected-audio" }>>
getChartPreviewData(input): Promise<JsonEnvelope<ChartPreviewData>>
```

Exact names can follow repo style.

Electron main should validate:

```txt
generated song.ogg path belongs to current project output
selected audio path was selected/restored safely
notes.chart path belongs to current project output
```

No arbitrary file reads.

## Audio playback

Use browser `<audio>` where practical after a validated source is returned.

Track:

```txt
loadedmetadata
duration
timeupdate
play/pause
seek
error
```

## Waveform strategy

Acceptable implementations:

```txt
decoded waveform if practical
sampled amplitude overview if practical
waveform-like placeholder derived from duration if decoding is too much for this phase
```

Do not add a large audio-analysis dependency unless justified.

## Timeline note strategy

Preferred sources:

```txt
generated notes.chart parsed into preview events
structured generated/normalized hits already available in state
normalization preview data
```

If reliable seconds mapping is unavailable:

```txt
show limited state
do not fake exact sync
```

## Read-only preview

The preview must not edit notes.

The preview must not persist offset changes as part of Phase 14A.

Showing the current offset is acceptable.

Temporary preview-only offset is acceptable only if low risk and clearly not the persisted Phase 15 loop.

## Testing strategy

Test pure helpers where possible:

```txt
preview source selection priority
safe path rejection
timeline event derivation
current-time highlight helper
time formatting
waveform overview helper if present
```

## Scope guard

Do not implement:

```txt
Phase 14B highway
Phase 15 offset adjustment loop
note editing
mapping overrides
packaging
full UX polish
```
