# ADR — Phase 17O — Preview Timing Diagnostics

## Context

CHDG has improved MIDI/GPIF note mapping and GPIF articulation resolution, but timing remains a major quality risk. A chart can have correct notes and still be unusable if its tempo map is missing or wrong.

MoonScraper demonstrates mature timing concepts such as BPM objects, assigned time, anchors, time signatures, beat lines, and clap playback. CHDG does not need to become MoonScraper, but it needs enough timing diagnostics to support chart generation from MIDI/GPIF.

## Decision 1 — Diagnose before editing

We will add timing diagnostics before adding tempo editing or overrides.

### Rationale

Users need to understand whether the problem is:

- global offset,
- accumulating tempo drift,
- bad source tempo,
- generation loss,
- or insufficient data.

Adding editing first would make users correct timing blindly.

## Decision 2 — Generated chart is source of Preview truth

Preview diagnostics will parse the actual generated `notes.chart`, not a theoretical in-memory chart object.

### Rationale

Preview must represent what Clone Hero/MoonScraper would open. If generation lost timing data, Preview must reveal that loss.

## Decision 3 — Compare source only when cached analysis exists

Preview will not automatically recalculate source inspection/normalization if source analysis cache is missing.

### Rationale

Preview should not trigger expensive or side-effect-prone operations. It should remain a generated-output review screen.

## Decision 4 — Use conservative severity

A constant-tempo chart is not inherently suspicious. One BPM in a long song is info only.

BPM jump threshold decisions:

- > 30 BPM: info.
- > 50 BPM: warning.

### Rationale

Avoid noisy false positives while still surfacing suspicious changes.

## Decision 5 — Offset is not a timing warning

Offset should be shown as an adjustment, not a warning.

### Rationale

Offset moves the full chart equally. It does not explain progressive drift. Treating offset as a warning would confuse users.

## Decision 6 — Writer ordering improvement is allowed

This phase may update `chartWriter` to output SyncTrack events ordered by tick, with TS before BPM on the same tick, if implementation remains small.

### Rationale

The writer currently emits all time signatures then all tempos. Although this may work, ordered output is easier to inspect and less surprising for tools/users.

## Consequences

Positive:

- Users can diagnose timing problems earlier.
- Future tempo override/editor work has a clear foundation.
- Generated chart quality issues become visible and testable.

Negative/tradeoffs:

- This phase does not fix bad tempo maps yet.
- Users may still need MoonScraper/manual review for actual correction.
- Source/generated comparison depends on cached analysis availability.

## Deferred decisions

- Persisting timing diagnostics in `.chdg`.
- Tempo override schema.
- BPM anchor model.
- Audio beat detection.
- Metronome/clap playback.
- Bar/beat normalized comparison across different resolutions.
