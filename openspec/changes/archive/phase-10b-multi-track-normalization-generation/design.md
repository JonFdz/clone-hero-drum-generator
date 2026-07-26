# Design: Phase 10B — Multi-track Normalization / Generation

## Overview

Phase 10B extends the structured project services from Phase 10A to support multiple selected drum tracks.

The goal is backend/CLI support, not UI.

Current high-level shape:

```txt
CLI -> packages/project -> source packages -> chart/audio packages
```

Target after this phase:

```txt
--track 3      -> selectedTracks [3]
--tracks 3,10 -> selectedTracks [3, 10]
selected tracks -> normalize each -> merge -> generate
```

## Argument parsing

Add `--tracks`.

Rules:

```txt
--track <index> keeps existing behavior
--tracks <csv> selects multiple tracks
--track and --tracks together are invalid
--tracks must not be empty
--tracks values must be integer track indexes
--tracks must not contain duplicates
```

Recommended parser model:

```ts
type TrackSelectionInput =
  | { trackIndex?: number; trackIndexes?: undefined }
  | { trackIndex?: undefined; trackIndexes: number[] };
```

or simply normalize into:

```ts
selectedTracks?: number[];
```

while keeping backwards compatibility at command boundaries.

## DTO changes

Update project DTOs to support multi-track while preserving old fields as needed.

Suggested approach:

```ts
type GeneratePackageInput = {
  trackIndex?: number;
  trackIndexes?: number[];
  ...
};

type GeneratePackageResult = {
  selectedTrack?: number;
  selectedTracks: number[];
  mergeSummary?: MultiTrackMergeSummary;
  ...
};
```

For normalization:

```ts
type NormalizationPreview = {
  selectedTrack?: number;
  selectedTracks: number[];
  hitCount: number;
  pieceSummary: Record<string, number>;
  firstHits: NormalizationHitPreview[];
  mergeSummary?: MultiTrackMergeSummary;
  issues: ProjectIssue[];
};
```

Exact field names can differ, but JSON must make multi-track selection clear.

## Normalization strategy

For each selected track:

```txt
MIDI: call existing MIDI normalization with that track index
GPIF: call existing GPIF normalization with that track index
```

Then merge the resulting hit arrays.

Keep source normalization behavior unchanged for single track.

## Merge algorithm

Recommended steps:

```txt
1. collect hits from all selected tracks
2. sort hits by tick, then stable deterministic tie-breaker
3. group hits by tick
4. resolve same tick + same piece duplicates
5. resolve same-tick open/closed hi-hat conflicts
6. detect likely impossible hand chords
7. return merged hits and merge summary/issues
```

### Deduplication

Initial duplicate identity:

```txt
tick + piece
```

When duplicates exist:

```txt
keep highest velocity
do not average velocity
do not average tick
record duplicate count
preserve source trace where feasible
```

If preserving multiple source traces requires a future `mergedSources` field, prefer adding structured merge details over breaking existing `DrumHit` compatibility.

### Hi-hat priority

If `hihat_open` and `hihat_closed` both exist at the same tick:

```txt
keep hihat_open
drop/resolve hihat_closed from the merged hit stream
record structured issue/detail
```

### Accent/ghost priority

If equivalent hits conflict by strength/articulation metadata and current data model exposes that information:

```txt
accent > normal > ghost
```

If the data model does not expose enough information yet, add a note/issue and avoid inventing behavior.

### Impossible hand chords

Detect likely impossible hand chords.

Initial heuristic:

```txt
at a given tick, count non-kick hand notes after dedupe/conflict resolution
if count > 2, add warning
```

Do not aggressively remove notes in this phase.

## Structured issues

Use `ProjectIssue`.

Suggested codes:

```txt
DUPLICATE_HIT_DEDUPED
HIHAT_OPEN_CLOSED_CONFLICT
IMPOSSIBLE_HAND_CHORD
MULTI_TRACK_MERGE_WARNING
```

Avoid flooding output with one issue per duplicate if there are many. Prefer summary details where useful.

## JSON output

Continue using Phase 10A envelope:

```json
{ "ok": true, "data": {}, "issues": [] }
```

Add multi-track result fields.

JSON stdout must remain clean.

Document in PR if `pnpm --silent` is required to avoid pnpm wrapper lines.

## Human output

Update human output only enough to show:

```txt
Selected tracks: 3, 10
Input hits
Merged hits
Duplicates removed
Impossible hand chord warnings
```

Do not redesign all CLI output.

## Testing strategy

Add tests for:

```txt
parse --tracks
reject --track + --tracks
reject invalid --tracks
normalizeSelection single-track backwards compatibility
normalizeSelection multi-track MIDI
normalizeSelection multi-track GPIF
generatePackage single-track backwards compatibility
generatePackage multi-track GPIF
duplicate hit deduplication
open hi-hat wins over closed
impossible hand chord warning
JSON parseability with --tracks
human output includes multi-track summary
```

Use synthetic fixtures/mocks where possible.

Do not commit copyrighted files.

## Carry-forward follow-ups

If practical:

```txt
add direct GPIF generatePackage unit coverage
document pnpm --silent for JSON machine output
```

## Scope guard

Do not implement:

```txt
desktop UI
project persistence
.chdg read/write
mapping overrides
preview
validation checklist UI
auto simplifier
individual note editing
```
