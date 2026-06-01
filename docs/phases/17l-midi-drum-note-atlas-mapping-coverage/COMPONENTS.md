# Components — Phase 17L

## Backend/model components

### Drum Note Atlas

Package: `packages/mappings`

Responsibilities:

- Store rich MIDI note entries.
- Export atlas version `0.1.0`.
- Resolve MIDI note numbers into mapping decisions.
- Validate atlas entries.

Suggested types:

```ts
export type DrumMappingAction = "map" | "candidate" | "ignore" | "unknown";
export type DrumMappingConfidence = "high" | "medium" | "low";
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
  piece?: DrumPiece;
  confidence: DrumMappingConfidence;
  family: DrumMappingFamily;
  source: "gm" | "gm2" | "gs" | "profile";
  reason: string;
};

export type DrumNoteResolution =
  | { action: "map"; note: number; entry: DrumNoteAtlasEntry; piece: Exclude<DrumPiece, "unknown"> }
  | { action: "candidate"; note: number; entry: DrumNoteAtlasEntry; suggestedPiece?: Exclude<DrumPiece, "unknown"> }
  | { action: "ignore"; note: number; entry: DrumNoteAtlasEntry }
  | { action: "unknown"; note: number };
```

### MIDI normalization

Package: `packages/midi`

Responsibilities:

- Use atlas resolver instead of flat map.
- Generate `DrumHit` only for `map` and project-overridden candidate/ignored/unknown notes.
- Track skipped candidate/ignored/unknown events for coverage.
- Preserve note count / track candidate detection semantics carefully.

### Project normalization / coverage

Package: `packages/project`

Responsibilities:

- Carry coverage summary in `NormalizationPreview`.
- Extend mapping candidates/rows with atlas metadata.
- Add non-blocking issues for unresolved candidates and unknown notes.
- Avoid warning noise for ignored known percussion.
- Persist coverage in `.chdg` analysis.
- Include atlas version in analysis fingerprint/cache key.

Suggested coverage type:

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

### Source Review minimal UI

App: `apps/desktop`

Responsibilities:

- Show compact mapping coverage summary.
- Distinguish mapped/candidate/ignored/unknown.
- Keep existing override controls functional.
- Avoid full Mapping Review redesign.

Suggested compact copy:

```text
Mapped 94% · 3 candidates · 12 ignored · 1 unknown
```

or count-based if percentages are not reliable:

```text
Mapped 1,204 · Candidates 18 · Ignored 42 · Unknown 3
```

## Deferred components

### Full Mapping Coverage UI — Phase 17M

- Filters: All / Needs review / Auto-mapped / Ignored / Unknown / Overrides.
- Rich table columns.
- Better explanation copy.
- Improved override workflow.

### GPIF Articulation Mapping — Phase 17N

- Parse GPIF articulation metadata.
- Resolve InputMidiNumbers / OutputMidiNumber / Name / Element.
- Decode case: `InputMidiNumbers 92`, `Hi-Hat (half)`, `OutputMidiNumber 46` -> `hihat_open`.
