# Components — Phase 17O — Preview Timing Diagnostics

## Likely affected packages/files

This list is intentionally probable, not prescriptive. The implementation agent must inspect the current repo before editing.

### Chart parsing / diagnostics

Possible locations:

- `apps/desktop/electron/previewData.ts`
- `apps/desktop/electron/previewData.test.ts`
- `packages/chart/src/*`
- `packages/chart/src/chartWriter.ts`
- `packages/chart/src/chartWriter.test.ts`
- `packages/core/src/types.ts`
- `packages/core/src/timing.ts`

Recommendation:

- Prefer a pure parser/diagnostics module if it can be shared by Preview and Generate.
- Avoid duplicating parsing logic between Preview and Generate.

Possible new module names:

- `packages/chart/src/chartTimingParser.ts`
- `packages/chart/src/chartTimingDiagnostics.ts`
- or `apps/desktop/electron/chartTimingDiagnostics.ts` if sharing is too expensive.

### Project / Generate integration

Possible locations:

- `packages/project/src/generatePackage.ts`
- `packages/project/src/types.ts`
- `packages/project/src/issues.ts`
- `apps/desktop/electron/main.ts`
- renderer Generate components/services.

Generate should expose summary diagnostics after writing `notes.chart`.

### Preview integration

Possible locations:

- `apps/desktop/electron/previewData.ts`
- `apps/desktop/electron/main.ts`
- renderer Preview route/components/store.
- existing Preview chart stage components.

Preview should show full timing detail.

### Project analysis cache access

Possible locations:

- `packages/project/src/projectFileTypes.ts`
- `packages/project/src/projectFile.ts`
- `apps/desktop/electron/projectFileService.ts`
- renderer project state/store.

Source comparison should use existing cached analysis when available. Do not trigger source normalization from Preview.

## Proposed domain model

### Timing diagnostic

```ts
type TimingDiagnosticSeverity = "info" | "warning" | "error";

type TimingDiagnostic = {
  severity: TimingDiagnosticSeverity;
  code: string;
  message: string;
  details?: Record<string, unknown>;
};
```

### Generated chart timing

```ts
type GeneratedChartTiming = {
  resolution: number;
  offsetSeconds: number;
  hasAccurateTiming: boolean;
  tempos: GeneratedTempoEvent[];
  timeSignatures: GeneratedTimeSignatureEvent[];
  sections: GeneratedSectionEvent[];
  notes: GeneratedNoteTimingSummary;
  diagnostics: TimingDiagnostic[];
};
```

### Generated tempo event

```ts
type GeneratedTempoEvent = {
  tick: number;
  bpm: number;
  seconds: number;
  source: "generated-chart";
};
```

### Generated time signature event

```ts
type GeneratedTimeSignatureEvent = {
  tick: number;
  numerator: number;
  denominator: number;
  seconds: number;
  source: "generated-chart";
};
```

### Generated section event

```ts
type GeneratedSectionEvent = {
  tick: number;
  name: string;
  seconds: number;
  source: "generated-chart";
};
```

### Generated note timing summary

```ts
type GeneratedNoteTimingSummary = {
  count: number;
  firstTick?: number;
  lastTick?: number;
  firstSeconds?: number;
  lastSeconds?: number;
};
```

## Parsing rules

### Resolution

Read from `[Song]`:

```chart
Resolution = 960
```

If missing, existing Preview fallback is `192`. Keep backward compatibility unless the implementation identifies a better shared default.

### Offset

Read from `[Song]`:

```chart
Offset = 0.035
```

Display as adjustment. Do not warning.

### BPM

Read from `[SyncTrack]`:

```chart
0 = B 164000
```

Convert to BPM by dividing by `1000`.

Invalid BPM:

- non-finite,
- <= 0,
- unparsable.

### Time signature

Read from `[SyncTrack]`:

```chart
0 = TS 4
0 = TS 4 2
184320 = TS 6 3
```

Denominator rules:

- no second value => denominator `4`.
- second value is log2 denominator.
- `2` => denominator `4`.
- `3` => denominator `8`.

### Sections

Read from `[Events]`:

```chart
0 = E "section Intro"
```

Reuse current generated section parsing behavior where possible.

### Notes

Read from `[ExpertDrums]`:

```chart
12345 = N 2 0
```

For note summary, base note modifiers can count as events if current Preview parser already does; if this creates misleading inflated counts, document and adjust in tests. Prefer counting actual displayed Preview note events consistently with existing Preview behavior.

## Diagnostics behavior

### Missing tempo map

No BPM events:

- code: `TIMING_NO_TEMPO_EVENTS`
- severity: warning or error depending existing issue conventions; recommended warning.
- `hasAccurateTiming = false`.

### Missing initial tempo

BPM events exist but none at tick 0:

- code: `TIMING_NO_INITIAL_TEMPO`
- severity: warning.
- `hasAccurateTiming = false`.

### Missing time signatures

No TS events:

- code: `TIMING_NO_TIME_SIGNATURES`
- severity: warning or info. Recommended warning if chart has notes.

### Missing initial TS

TS events exist but none at tick 0:

- code: `TIMING_NO_INITIAL_TIME_SIGNATURE`
- severity: info/warning. Recommended info unless there are measure/section diagnostics relying on TS.

### Duplicate tempo tick

Multiple BPM entries at same tick:

- code: `TIMING_DUPLICATE_TEMPO_TICK`
- severity: warning.

### Duplicate TS tick

Multiple TS entries at same tick:

- code: `TIMING_DUPLICATE_TS_TICK`
- severity: warning.

### Unsorted SyncTrack

Events in SyncTrack are not monotonically ordered by tick:

- code: `TIMING_UNSORTED_SYNCTRACK`
- severity: info.

Do not fail Preview.

### Suspicious BPM jumps

Compare consecutive tempo events sorted by tick:

- diff > 50 BPM => `TIMING_SUSPICIOUS_BPM_JUMP_WARNING` warning.
- diff > 30 BPM => `TIMING_SUSPICIOUS_BPM_JUMP_INFO` info.

### One tempo long song

If note duration suggests a long song and only one BPM exists:

- code: `TIMING_ONLY_ONE_TEMPO_LONG_SONG`
- severity: info.

Implementation may choose a conservative threshold such as last note time > 180 seconds.

### Offset present

If offsetSeconds is non-zero:

- code: `TIMING_OFFSET_PRESENT`
- severity: info.

Message must clarify offset does not explain progressive drift.

## Source-vs-generated comparison

Use cached source analysis only.

Compare these arrays when available:

- source tempos vs generated tempos,
- source time signatures vs generated time signatures,
- source sections vs generated sections.

Recommended comparison tolerance:

- tick: exact for Phase 17O.
- BPM: ±0.001.
- TS: exact numerator/denominator/tick.
- section: exact tick + normalized lowercase name.

If source/generated resolutions differ, emit info and do not attempt normalized musical comparison in this phase.

## UI notes

Preview should include a compact summary plus expandable details.

Recommended cards/tables:

- Timing Status summary card.
- Diagnostics list.
- Tempo Events table.
- Time Signatures table.
- Sections table.
- Notes summary.

Generate can show summary only:

- count of errors/warnings/info;
- most important messages;
- no large tables unless already supported.

## Testing strategy

Pure unit tests should cover parser and diagnostic functions without Electron UI.

Renderer tests should verify that Preview shows summary states and tables if current test tooling supports it.
