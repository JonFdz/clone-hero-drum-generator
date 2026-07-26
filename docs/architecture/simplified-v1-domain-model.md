# Simplified V1 Domain Model

## Aggregate

`ChdgProject` is the sole post-import source of truth.

```text
ChdgProject
├── identity
├── internal assets
├── import provenance
├── timing
├── imported hits
├── mapping state
├── individual corrections
├── editor settings
└── export state
```

## Imported hit

The base is immutable after creation.

```ts
export type ImportedDrumHit = {
  id: string;
  tick: number;
  detectedPiece: DrumPiece;
  velocity: number;
  durationTicks: number;
  sourceMappingKey: string;
  source: MidiDrumHitSource | GpifDrumHitSource;
};
```

The persisted opaque ID must be unique, stable across save/open/export and mapping changes, independent of array order, and usable by corrections and Preview selection.

## Source mapping

```ts
export type SourceMappingDefinition = {
  key: string;
  sourceKind: "midi" | "gpif";
  sourceLabel: string;
  detectedPiece: DrumPiece;
  defaultTarget?: CloneHeroTarget;
  count: number;
  confidence?: "high" | "medium" | "low";
  status: "mapped" | "unknown" | "ignored";
};
```

## Two override levels

```ts
export type ProjectMappings = {
  interpretationOverrides: Record<
    string,
    { kind: "piece"; piece: Exclude<DrumPiece, "unknown"> }
      | { kind: "ignore" }
  >;
  targetOverrides: Record<string, CloneHeroTarget>;
};
```

Effective piece:

```text
interpretation override ?? imported detectedPiece
```

Effective target:

```text
source target override ?? default target for effective piece
```

A globally ignored source mapping produces no effective notes. To restore those notes the user changes the mapping; individual restore is reserved for individual deletions.

## Clone Hero target

```ts
export type CloneHeroTarget = {
  lane: "kick" | "red" | "yellow" | "blue" | "green";
  cymbal: boolean;
};
```

Validation:

- kick/red cannot be cymbals;
- cymbal only on yellow/blue/green;
- no Expert+ kick target.

## Individual correction

```ts
export type NoteCorrection = {
  hitId: string;
  piece?: Exclude<DrumPiece, "unknown">;
  target?: CloneHeroTarget;
  accent?: boolean;
  ghost?: boolean;
  deleted?: boolean;
  updatedAt: string;
};
```

Rules:

- absent fields inherit;
- accent and ghost are mutually exclusive;
- deletion does not remove the imported hit;
- restore removes the deletion override;
- no tick, duration, velocity, or provenance mutation.

## Materialization

For each hit:

1. resolve interpretation;
2. skip if globally ignored;
3. resolve target;
4. derive accent/ghost defaults;
5. apply individual correction;
6. skip if individually deleted;
7. emit same tick with length 0.

```ts
export type EffectiveDrumNote = {
  id: string;
  tick: number;
  piece: Exclude<DrumPiece, "unknown">;
  target: CloneHeroTarget;
  accent: boolean;
  ghost: boolean;
  length: 0;
  sourceMappingKey: string;
  correctionState: "none" | "modified";
};
```

## Hi-hat

- open and closed remain distinct musical pieces;
- both default to Yellow Cymbal;
- open defaults to accent;
- target/accent may be overridden.

## Kicks

Every source kick remains a normal Expert kick. Rapid double-pedal passages are multiple normal kick notes. No Expert+ marker is inferred.

## Timing

Persist resolution, every tempo event, every time signature, and sections. Mappings/corrections never alter timing. Offset is global metadata and does not mutate ticks.

## Command history

Undo/Redo is an in-memory reversible command stack, cleared on close/open and not serialized.

Initial commands:

- SetNoteCorrection
- DeleteNote
- RestoreNote
- SetInterpretationOverride
- SetTargetOverride
- ResetMapping
- SetOffset
- UpdateMetadata
- ChangeCover
