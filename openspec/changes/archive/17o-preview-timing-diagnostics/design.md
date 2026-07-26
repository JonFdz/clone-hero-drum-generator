# OpenSpec Design — 17O Preview Timing Diagnostics

## Overview

Add a deterministic timing diagnostics layer over generated `notes.chart`.

Preview should remain generated-output-only: diagnostics must come from the actual generated `notes.chart`, not from a theoretical in-memory chart. Source-vs-generated comparison may use cached source analysis if available.

## Architecture

Recommended structure:

```txt
parse generated notes.chart
  -> GeneratedChartTiming
  -> diagnostics
  -> optional source-vs-generated diagnostics
  -> Preview UI / Generate summary
```

Prefer pure functions for parser and diagnostics so tests can cover behavior without Electron UI.

## Data flow

### Preview

1. Resolve generated `notes.chart` path using existing safe path flow.
2. Parse chart preview data for highway rendering as today.
3. Parse generated timing diagnostics from the same chart file.
4. Attach timing diagnostics to Preview payload.
5. Renderer displays summary, diagnostics, tempo table, TS table, sections table, and note summary.
6. If cached source analysis is available in project state, compare source vs generated. If unavailable, show source comparison unavailable.

### Generate

1. Generate package as today.
2. After `notes.chart` is written, parse generated timing diagnostics.
3. Add concise summary/important issues to Generate result/report.
4. Do not block generation unless there is an existing fatal error mechanism that clearly requires it. Diagnostics should be visible, not silently swallowed.

## Proposed types

```ts
type TimingDiagnosticSeverity = "info" | "warning" | "error";

type TimingDiagnostic = {
  severity: TimingDiagnosticSeverity;
  code: string;
  message: string;
  details?: Record<string, unknown>;
};
```

```ts
type GeneratedChartTiming = {
  resolution: number;
  offsetSeconds: number;
  hasAccurateTiming: boolean;
  tempos: Array<{ tick: number; bpm: number; seconds: number; source: "generated-chart" }>;
  timeSignatures: Array<{ tick: number; numerator: number; denominator: number; seconds: number; source: "generated-chart" }>;
  sections: Array<{ tick: number; name: string; seconds: number; source: "generated-chart" }>;
  notes: {
    count: number;
    firstTick?: number;
    lastTick?: number;
    firstSeconds?: number;
    lastSeconds?: number;
  };
  diagnostics: TimingDiagnostic[];
};
```

Names may change if they better fit existing code, but behavior must remain.

## Parsing details

### BPM

Chart format:

```chart
0 = B 120000
```

BPM is stored as `bpm * 1000`.

### Time signatures

Chart format:

```chart
0 = TS 4
0 = TS 4 2
0 = TS 6 3
```

If denominator exponent is missing, denominator is 4.
If present, denominator is `2 ** exponent`.

### Tick to seconds

Use generated chart tempo map.
If no tempo map or no initial tempo exists, mark timing inaccurate and use existing visual fallback only where necessary.

### Offset

Parse and display, but do not use as warning.

## Source-vs-generated comparison

Use cached source analysis only.

Comparison rules:

- tempo tick: exact;
- tempo BPM: tolerance ±0.001;
- TS: exact tick/numerator/denominator;
- sections: exact tick + normalized name;
- different resolution: emit info and do not attempt advanced normalized comparison.

## Diagnostics severity guidance

- Missing BPM events: warning.
- Missing initial BPM: warning.
- Missing TS events: warning/info depending existing conventions; recommended warning if chart has notes.
- Missing initial TS: info unless implementation has a stronger reason.
- Duplicate BPM/TS tick: warning.
- Unsorted SyncTrack: info.
- Invalid BPM: error or warning; recommended error if parser can represent invalid entries.
- BPM jump > 30: info.
- BPM jump > 50: warning.
- Single BPM long song: info.
- Offset present: info.
- Source/generated tempo mismatch: warning.
- Source comparison unavailable: info.

## UI design

Preview should include:

- status summary;
- diagnostic chips/list;
- tempo event table;
- time signature table;
- section event table;
- notes summary.

Generate should include a compact summary:

- `Timing: OK` or `Timing: N warnings, M info`;
- most important warnings.

## Chart writer ordering

If included:

- Combine TS and BPM events into one SyncTrack output list.
- Sort by tick ascending.
- On same tick, TS before B.
- Keep BPM and TS values unchanged.

## Performance

Generated `notes.chart` is text and parsing should be cheap. Avoid repeated parsing if Preview already reads the same file; share parser output where possible.

## Backward compatibility

Existing Preview note rendering should continue to work.
Existing generated output semantics should remain unchanged except optional SyncTrack ordering.
