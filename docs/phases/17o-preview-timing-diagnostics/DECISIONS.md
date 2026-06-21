# Decisions — Phase 17O — Preview Timing Diagnostics

## Closed decisions

### Phase name

Use `Phase 17O — Preview Timing Diagnostics`.

### Single BPM severity

A generated chart with only one BPM event is an `info`, not a warning, even for a long song.

### BPM jump thresholds

- BPM delta > 30: info.
- BPM delta > 50: warning.

### Source comparison behavior

Preview does not automatically recalculate source analysis. If cached source analysis is unavailable, show source comparison unavailable.

### Writer ordering

If implementation remains small, update `chartWriter` to output SyncTrack sorted by tick, with TS before BPM at the same tick.

### UI placement

- Preview: full timing diagnostics.
- Generate: concise summary.

### Offset

Offset is displayed as an adjustment and not treated as a warning.

## Deferred decisions

### Tempo override model

Deferred to a future phase.

### Tempo override UI

Deferred to a future phase.

### Anchors

MoonScraper-style BPM anchors are deferred.

### Audio sync QA

Metronome, claps, slow playback, and jump-to-tempo are deferred.

### Raw GPIF duplicate diagnostics

Generated chart duplicate timing diagnostics are in scope. Raw source duplicate diagnostics before GPIF dedupe are deferred.

### Normalized comparison across different resolutions

Phase 17O uses exact tick comparison. Musical/bar-beat normalized comparison is deferred.
