# ADR — GPIF Timeline Extraction for Tempo, Sections, and Time Signatures

## Status

Proposed.

## Context

The current GPIF code path extracts timing information in two different ways:

1. `inspectGpifXml(...)` summarizes tempo/time-signature/section structures for inspection.
2. `normalizeGpDrumsXml(...)` creates playable hits and returns tempo/time-signature/section data for chart generation.

The normalizer currently collapses GPIF tempos to one BPM at tick 0. This loses tempo-map information and causes generated charts to drift when source tempo changes exist.

The chart writer is not the main issue: it already writes every tempo event it receives.

## Decision

Implement a shared GPIF timeline extraction model inside `packages/guitarpro`, used by normalization and optionally inspection.

Suggested internal model:

```ts
type GpifTimeline = {
  resolution: number;
  masterBars: GpifMasterBarTimelineEntry[];
  tempos: TempoEvent[];
  timeSignatures: TimeSignatureEvent[];
  sections: SongSection[];
  issues: string[];
};

type GpifMasterBarTimelineEntry = {
  index: number;
  startTick: number;
  durationTicks: number;
  numerator: number;
  denominator: number;
};
```

The timeline should know how to convert:

```text
bar index + position -> chart tick
```

For tempo automation:

```text
tick = masterBars[bar].startTick + positionToTicks(position)
```

## Rationale

Tempo, sections, time signatures, and measure-based note placement all depend on the same timeline. Implementing this once reduces drift bugs and prevents separate features from disagreeing about where a bar starts.

## Consequences

Positive:

- GPIF tempo changes export correctly.
- Sections can be placed correctly.
- Future GPIF timing work has a single model to extend.

Tradeoffs:

- Requires deeper parsing of GPIF master bars and automation nodes.
- Must be careful not to regress simpler GPIF files.
- Some GPIF files may omit enough timing data; fallbacks must remain safe.

## Alternatives considered

### A — Patch only the specific tempo automation case

Parse `MasterTrack.Automations.Automation` and assume 4/4 for tick conversion.

Rejected as the main design because it would fix Decode but keep sections/time signatures fragile. It may be acceptable as an intermediate implementation if accompanied by tests and clear TODOs, but the target architecture should be a timeline model.

### B — Use audio beat detection

Rejected. The source already contains tempo data. Audio analysis is out of scope and would be less deterministic.

### C — Use offset

Rejected. Offset shifts the whole chart equally; missing tempo changes cause cumulative drift. Offset cannot solve tempo-map loss.
