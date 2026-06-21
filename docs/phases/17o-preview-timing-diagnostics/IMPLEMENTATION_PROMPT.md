# Implementation Prompt — Phase 17O — Preview Timing Diagnostics

You are implementing Phase 17O in repo:

```txt
JonFdz/clone-hero-drum-generator
```

## Critical first task

First task: transfer the accepted OpenSpec into Engram.

Engram is the project source of truth.

Do not implement until Engram is aligned.

If any required file is missing, stop and report exactly what is missing.
Do not invent missing files.
If anything is ambiguous, ask before implementing.
Do not perform final review.
Do not merge without Jon's approval.

## Goal

Add Preview Timing Diagnostics so CHDG can explain generated chart timing problems, especially missing/incorrect tempo maps in songs with tempo changes or GPIF/MIDI sources whose notes are correct but timing is unreliable.

This phase is diagnostic-only.

## Read first

Read these files after transferring OpenSpec into Engram:

- `docs/phases/17o-preview-timing-diagnostics/README.md`
- `docs/phases/17o-preview-timing-diagnostics/PRD.md`
- `docs/phases/17o-preview-timing-diagnostics/ADR.md`
- `docs/phases/17o-preview-timing-diagnostics/COMPONENTS.md`
- `docs/phases/17o-preview-timing-diagnostics/CHECKLIST.md`
- `openspec/changes/17o-preview-timing-diagnostics/proposal.md`
- `openspec/changes/17o-preview-timing-diagnostics/design.md`
- `openspec/changes/17o-preview-timing-diagnostics/tasks.md`
- `openspec/changes/17o-preview-timing-diagnostics/verify.md`
- `openspec/changes/17o-preview-timing-diagnostics/specs/preview-timing-diagnostics/spec.md`

Then inspect current code before making changes.

Likely relevant files:

- `packages/chart/src/chartWriter.ts`
- `apps/desktop/electron/previewData.ts`
- `apps/desktop/electron/previewData.test.ts`
- `packages/project/src/generatePackage.ts`
- `packages/project/src/types.ts`
- `packages/project/src/projectFileTypes.ts`
- Preview renderer route/components/store
- Generate renderer route/components/store

## Scope

Implement:

- generated `notes.chart` timing parser;
- generated timing diagnostics model;
- BPM table data with tick/time/BPM;
- time signature table data with tick/time/numerator/denominator;
- section table data with tick/time/name;
- note count and first/last note timing summary;
- diagnostics for missing/invalid/duplicate/suspicious timing;
- source-vs-generated comparison when cached source analysis exists;
- source-comparison-unavailable info when cache is missing;
- Preview UI for detailed timing diagnostics;
- Generate summary for important timing diagnostics;
- chartWriter SyncTrack ordering by tick if small;
- tests.

## Non-goals

Do not implement:

- manual tempo editing;
- tempo overrides;
- BPM anchors;
- audio beat detection;
- automatic tempo correction;
- metronome;
- clap playback;
- slow playback;
- manual note editor;
- section editor;
- full MoonScraper clone.

## Product decisions

- One BPM in a long song is info only.
- BPM delta > 30 is info.
- BPM delta > 50 is warning.
- Offset is info/adjustment, not warning.
- Preview does not auto-recalculate source analysis.
- Source/generated comparison uses cached analysis only.
- BPM compare tolerance: ±0.001 BPM.
- Phase 17O uses exact tick comparison.
- If writer ordering is changed, same tick order must be TS before B.

## Required diagnostics

Implement these codes or equivalent constants:

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

## Tests required

Add/update tests for:

- chart with no BPM events;
- chart with BPM events but missing tick 0 BPM;
- chart with multiple BPM events;
- chart with `TS 6 3` decoded as `6/8`;
- duplicate BPM tick;
- duplicate TS tick;
- unsorted SyncTrack;
- suspicious BPM jump info;
- suspicious BPM jump warning;
- single BPM long song info only;
- offset present info only;
- source/generated tempo mismatch;
- source comparison unavailable;
- writer ordering TS before B at same tick.

## Evidence

Before opening PR or marking ready, update:

```txt
docs/phases/17o-preview-timing-diagnostics/EVIDENCE.md
```

Include:

- commands run;
- test results;
- manual validation notes;
- screenshots or copied UI text for Preview diagnostics;
- Generate timing summary evidence;
- known limitations.

## PR requirements

- Link the approved issue.
- Include `status:approved` issue reference if applicable.
- Summarize implementation and non-goals.
- Include evidence.
- Do not merge.
