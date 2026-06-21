# Phase 17O — Preview Timing Diagnostics

## Status

Implemented; awaiting PR creation and external review.

## Summary

Add a timing diagnostics layer for generated Clone Hero drum charts so CHDG can explain whether a song's sync problem is likely caused by offset, missing/incorrect tempo map, source timeline issues, or generation loss.

The main user problem is songs where:

- notes are mapped correctly,
- the generated chart starts roughly in sync,
- but the song drifts later because of tempo changes or bad source tempo data,
- or a Guitar Pro / GPIF source has correct notes but unreliable tempo information.

This phase is diagnostic, not corrective. It should make timing problems visible and actionable before CHDG adds manual tempo override/editing capabilities.

## User-facing goal

When a generated song feels out of sync, Preview should answer:

- Does `notes.chart` contain a usable tempo map?
- Does it have a BPM at tick 0?
- Does it have time signatures?
- Are there suspicious BPM jumps?
- Are there duplicate or malformed timing events?
- Does generated `notes.chart` match what source analysis found?
- Is this likely an offset issue, tempo drift issue, source issue, generation issue, or unknown/manual-review issue?

## Current baseline

Known relevant baseline:

- `packages/chart/src/chartWriter.ts` writes the tempo, time signature, section, and ExpertDrums events it receives.
- `apps/desktop/electron/previewData.ts` parses generated `notes.chart` for Preview note events and generated chart section events.
- Preview currently computes seconds from generated chart tempo events but exposes only minimal timing limitations.
- GPIF timeline extraction exists in `packages/guitarpro/src/gpifTimeline.ts` and returns tempos, time signatures, sections, master bars, and issues.
- Generate uses normalized source tempos/time signatures/sections when writing the chart.
- `.chdg` analysis cache can contain source inspection and normalization preview, but there is no dedicated generated-chart timing diagnostics model yet.

## Product decisions

### One tempo in a long song

A chart with only one BPM event may be valid. This must be an `info`, not a warning.

### BPM jump thresholds

- Difference greater than 30 BPM: `info`.
- Difference greater than 50 BPM: `warning`.
- Apply only when there are at least two tempo events.

### Source comparison availability

Preview must not automatically recalculate source analysis if analysis cache is missing or stale. It should show a clear source-comparison-unavailable diagnostic and point the user to Source Review or Generate.

### SyncTrack writer ordering

If implementation effort remains small, this phase should also make `chartWriter` output `[SyncTrack]` events ordered by tick. For events on the same tick, write `TS` before `B`. This improves readability and compatibility. It must not change the semantic tempo/time signature data.

### UI placement

- Preview: full timing diagnostics details.
- Generate: summary/important diagnostics only.

### Offset

Offset is not a warning. Offset should be displayed as an adjustment, because an offset problem shifts the full chart equally. Tempo-map problems cause accumulating drift.

## In scope

- Parse generated `notes.chart` timing data more fully.
- Add a generated chart timing diagnostics model.
- Parse generated SyncTrack BPM events.
- Parse generated SyncTrack time signature events.
- Parse generated `[Events]` section markers.
- Compute seconds for tempo, time signature, section, first note, and last note.
- Detect missing/malformed/duplicate/suspicious generated timing data.
- Compare generated chart timing against cached source analysis when available.
- Surface diagnostics in Preview.
- Surface high-level timing summary in Generate result/report.
- Add pure tests for parser, diagnostics, source-vs-generated comparison, and writer ordering.
- Keep generated Preview based on actual generated `notes.chart` and `song.ogg`.

## Out of scope

- Manual tempo editing.
- Tempo overrides in `.chdg`.
- BPM anchors like MoonScraper.
- Audio beat detection.
- Automatic tempo detection from `song.ogg`.
- Automatic fixing of bad Guitar Pro tempo maps.
- Metronome playback.
- Clap playback.
- Slow playback.
- Manual note editor.
- Manual section editor.
- Full MoonScraper-style chart editor.
- Broad Preview redesign beyond adding a timing panel/card/table.

## Expected user experience

Preview should show a Timing Diagnostics area with at least:

- overall status: OK / info / warning / error / source comparison unavailable;
- resolution;
- offset in milliseconds/seconds;
- tempo count;
- time signature count;
- section count;
- note count;
- first/last note tick;
- first/last note time;
- diagnostics list;
- tempo table;
- time signature table;
- section table.

Example tempo table:

```txt
Tick      Time       BPM      Source
0         00:00.000  164      generated chart
184320    01:10.244  160      generated chart
```

Example diagnostic language:

```txt
Possible tempo drift: source analysis found 2 tempo events, but generated notes.chart contains 1.
```

```txt
Offset is set to 35 ms. Offset shifts the full chart equally and does not explain progressive drift.
```

## Diagnostic categories

CHDG should help distinguish:

- Offset problem: everything is shifted equally.
- Tempo map problem: chart starts close but progressively drifts.
- Source problem: source GP/MIDI timing data appears incomplete/suspicious.
- Generation problem: source had timing data but generated chart lost it.
- Unknown/manual review: data is insufficient to diagnose without listening.

## Proposed diagnostic codes

- `TIMING_NO_TEMPO_EVENTS`
- `TIMING_NO_INITIAL_TEMPO`
- `TIMING_NO_TIME_SIGNATURES`
- `TIMING_NO_INITIAL_TIME_SIGNATURE`
- `TIMING_DUPLICATE_TEMPO_TICK`
- `TIMING_DUPLICATE_TS_TICK`
- `TIMING_UNSORTED_SYNCTRACK`
- `TIMING_INVALID_BPM`
- `TIMING_SUSPICIOUS_BPM_JUMP_INFO`
- `TIMING_SUSPICIOUS_BPM_JUMP_WARNING`
- `TIMING_ONLY_ONE_TEMPO_LONG_SONG`
- `TIMING_FALLBACK_USED`
- `TIMING_OFFSET_PRESENT`
- `SOURCE_GENERATED_TEMPO_COUNT_MISMATCH`
- `SOURCE_TEMPO_MISSING_IN_GENERATED`
- `GENERATED_EXTRA_TEMPO`
- `SOURCE_GENERATED_TS_COUNT_MISMATCH`
- `SOURCE_SECTION_MISSING_IN_GENERATED`
- `SOURCE_COMPARISON_UNAVAILABLE`

## Acceptance criteria

1. Preview shows timing diagnostics based on actual generated `notes.chart`.
2. Preview lists BPM events with tick, `mm:ss.mmm`, and BPM.
3. Preview lists time signature events with tick, `mm:ss.mmm`, numerator, denominator.
4. Preview lists section events with tick, `mm:ss.mmm`, and name.
5. Preview shows note count, first note tick/time, and last note tick/time.
6. If generated chart has no BPM events, Preview shows a warning and marks accurate timing unavailable.
7. If generated chart has no BPM at tick 0, Preview shows a warning and marks accurate timing unavailable.
8. If generated chart has no TS events, Preview shows an appropriate diagnostic.
9. If generated chart has no TS at tick 0, Preview shows info/warning depending on the implementation's severity model.
10. Offset is displayed as an adjustment, not as a warning.
11. A single BPM in a long song is info only, not warning.
12. BPM jumps greater than 30 BPM are info; greater than 50 BPM are warning.
13. Duplicate BPM events at the same tick are diagnosed.
14. Duplicate TS events at the same tick are diagnosed.
15. Unsorted SyncTrack event ordering is diagnosed.
16. If cached source analysis is available, source-vs-generated timing comparison runs.
17. If source has tempo events that generated chart lacks, Preview reports possible generation/timeline loss.
18. If source comparison is unavailable, Preview says so without recalculating automatically.
19. Generate exposes a summary of important timing diagnostics after generation.
20. `chartWriter` writes SyncTrack ordered by tick, with TS before B on same tick, if this remains a small change.
21. Tests cover no tempo events, missing initial tempo, multiple tempos, 6/8 time signature, duplicate events, source-vs-generated mismatch, unavailable source comparison, and writer ordering.

## Implementation rule

The first task for the implementation agent is to transfer the accepted OpenSpec into Engram. Engram is the project source of truth. Do not implement until Engram is aligned.
