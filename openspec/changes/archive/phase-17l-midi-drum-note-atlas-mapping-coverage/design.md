# Design — Phase 17L: MIDI Drum Note Atlas and Mapping Coverage

## Current state

The current mapping data is a flat JSON object:

```json
{
  "35": "kick",
  "36": "kick",
  "37": "snare"
}
```

The current mapper returns a `DrumPiece` or `unknown`. This does not support confidence, candidates, ignored known percussion, or detailed Source Review coverage.

## Proposed model

### Atlas version

```ts
export const MIDI_DRUM_NOTE_ATLAS_VERSION = "0.1.0";
```

Use this value in source-review normalization cache/fingerprint logic.

### Types

```ts
export type DrumMappingAction = "map" | "candidate" | "ignore" | "unknown";
export type DrumMappingConfidence = "high" | "medium" | "low";
export type DrumMappingSource = "gm" | "gm2" | "gs" | "profile";
export type DrumMappingFamily =
  | "kick"
  | "snare"
  | "hihat"
  | "tom"
  | "cymbal"
  | "aux-percussion"
  | "fx"
  | "metronome"
  | "digital"
  | "unknown";

export type DrumNoteAtlasEntry = {
  note: number;
  name: string;
  action: DrumMappingAction;
  piece?: Exclude<DrumPiece, "unknown">;
  confidence: DrumMappingConfidence;
  family: DrumMappingFamily;
  source: DrumMappingSource;
  reason: string;
};
```

### Resolver output

```ts
export type DrumNoteResolution =
  | { action: "map"; note: number; entry: DrumNoteAtlasEntry; piece: Exclude<DrumPiece, "unknown"> }
  | { action: "candidate"; note: number; entry: DrumNoteAtlasEntry; suggestedPiece?: Exclude<DrumPiece, "unknown"> }
  | { action: "ignore"; note: number; entry: DrumNoteAtlasEntry }
  | { action: "unknown"; note: number };
```

## Normalization behavior

### Without project override

| Resolution | Behavior |
|---|---|
| `map` | Create `DrumHit`. |
| `candidate` | Do not create `DrumHit`; record candidate coverage. |
| `ignore` | Do not create `DrumHit`; record ignored known percussion coverage. |
| `unknown` | Do not create `DrumHit`; record unknown coverage and non-blocking issue/status. |

### With project override

Overrides remain authoritative:

- `piece` override creates a hit for that note using the override piece.
- `ignore` override skips that note even if atlas action is `map`.

## Coverage summary

Add to normalization preview:

```ts
export type MappingCoverageSummary = {
  atlasVersion: string;
  totalEventCount: number;
  mappedEventCount: number;
  candidateEventCount: number;
  ignoredEventCount: number;
  unknownEventCount: number;
  mappedSourceCount: number;
  candidateSourceCount: number;
  ignoredSourceCount: number;
  unknownSourceCount: number;
};
```

## Mapping rows

Extend mapping rows/candidates to represent all mapping states:

```ts
export type MappingCandidate = {
  key: string;
  sourceKind: "midi" | "gpif";
  sourceValue: string;
  label?: string;
  noteName?: string;
  action: "map" | "candidate" | "ignore" | "unknown";
  automaticPiece?: DrumHit["piece"];
  suggestedPiece?: Exclude<DrumPiece, "unknown">;
  confidence?: "high" | "medium" | "low";
  family?: string;
  source?: string;
  count: number;
  firstTick?: number;
  reason?: string;
};
```

The exact existing type name may be preserved if that reduces churn, but the data must support the fields above.

## Source Review minimal UI

Source Review should show compact coverage without a full redesign:

```text
Mapped 1,204 · Candidates 18 · Ignored 42 · Unknown 3
```

Candidates/unknowns should remain visible in Mapping Review. Ignored known percussion should be visible but not noisy.

## Cache/fingerprint

Source Review analysis/normalization cache must include `MIDI_DRUM_NOTE_ATLAS_VERSION`. Cached `.chdg` analysis from an older atlas must be considered stale.

## Mapping table

The normative mapping table is in:

```text
docs/phases/17l-midi-drum-note-atlas-mapping-coverage/MAPPING_ATLAS_DECISIONS.md
```

The implementation must follow that table unless Jon explicitly approves a change.

## Deferred work

### Phase 17M

Full Source Review Mapping Coverage UI.

### Phase 17N

GPIF articulation metadata mapping, including `InputMidiNumbers=92`, `Hi-Hat (half)`, `OutputMidiNumber=46` -> `hihat_open`.
