# Components / Implementation Areas — Phase 17I

This phase has no UI components. “Components” here means code modules and internal responsibilities.

## 1. GPIF Timeline Extractor

Potential file:

```text
packages/guitarpro/src/gpifTimeline.ts
```

Responsibilities:

- Parse GPIF resolution / PPQ.
- Parse master bars.
- Determine each master bar start tick.
- Determine master bar duration from time signature or duration structures.
- Convert bar/position values into chart ticks.
- Extract tempo automations into `TempoEvent[]`.
- Extract time signatures into `TimeSignatureEvent[]`.
- Extract sections/markers into `SongSection[]` when possible.

Expected public/internal functions:

```ts
export function extractGpifTimeline(root: unknown): GpifTimeline;
export function barPositionToTick(timeline: GpifTimeline, bar: number, position?: number): number | undefined;
```

## 2. GPIF Normalizer

File:

```text
packages/guitarpro/src/normalizeGpDrums.ts
```

Responsibilities after this phase:

- Use the timeline extractor for:
  - resolution
  - tempos
  - time signatures
  - sections
  - measure start tick / bar duration where applicable
- Continue normalizing drum hits as before.
- Preserve fallback behavior for GPIF files without recognized timeline data.

## 3. GPIF Inspector

File:

```text
packages/guitarpro/src/inspectGpif.ts
```

Responsibilities after this phase:

- Optionally expose richer tempo/time-signature/section summaries using parsed ticks/bar information.
- Avoid summary-only text being the only representation used for generation.

Important: generation must not depend on lossy string summaries such as `"Tempo: 160 2"`.

## 4. Chart Writer

File:

```text
packages/chart/src/chartWriter.ts
```

Expected status:

- Probably no major change needed.
- It already writes all `chart.tempos` and `chart.timeSignatures` it receives.
- Add tests only if formatting/order needs tightening.

## 5. Project Generation

File:

```text
packages/project/src/generatePackage.ts
```

Expected status:

- Should continue passing `source.tempos`, `source.timeSignatures`, and `source.sections` into `DrumChart`.
- No special-case Decode logic.

## 6. Tests / Fixtures

Potential test locations:

```text
packages/guitarpro/src/normalizeGpDrums.test.ts
packages/guitarpro/src/gpifTimeline.test.ts
packages/project/src/generatePackage.test.ts
packages/chart/src/chartWriter.test.ts
```

Required regression coverage:

- GPIF tempo at bar 0 and bar 48.
- Resolution 960, 4/4.
- Expected second tempo tick 184320.
- Generated chart includes both tempo events.
- Sections with bar positions do not all collapse to zero when timing context is available.
