# PRD Phase 16A: Project Mapping Overrides

## Goal

Allow project-level mapping overrides for source notes/articulations.

The user should be able to review unknown or incorrectly mapped source events, override their mapping to a `DrumPiece`, ignore them, and save those overrides in the `.chdg` project so normalization/generation can use them consistently.

## Roadmap context

```txt
Phase 14A — Audio + Waveform + Timeline Preview
Phase 14B — Clone Hero Highway Preview
Phase 15  — Offset Adjustment Loop
Phase 16A — Project Mapping Overrides
Phase 16B — Mapping Override Profiles
```

This phase is **16A only**.

## Why this exists

CHDG can inspect, normalize, generate, validate, preview, show a highway, and adjust offset. The next major source of wrong output is source-specific mapping ambiguity:

```txt
MIDI note numbers that represent different drum pieces depending on the file
GPIF articulations/source keys that need source-specific interpretation
sidestick that should sometimes be snare and sometimes ignored
unknown notes/articulations that should be ignored or mapped manually
```

Phase 16A lets the user fix those cases per project without editing individual notes.

## Existing docs path

Use the existing repo folder:

```txt
docs/phases/16a-project-mapping-overrides/
```

Do not create a second Phase 16A folder.

## Source of truth

`docs/desktop/decisions.md` defines the Phase 16A mapping scope:

```txt
MIDI note number -> DrumPiece
GPIF articulation/source key -> DrumPiece
ignore source note/articulation
sidestick -> snare or ignore
Do not edit individual notes in Phase 16A.
Mapping profiles are Phase 16B.
Songsterr profiles should be based on real repeated patterns, not invented too early.
```

## Visual references

```txt
docs/desktop/mockups/09-mapping-overrides.png
```

Also read:

```txt
docs/desktop/README.md
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
docs/desktop/feature-inventory.md
```

If mockup text conflicts with this PRD/OpenSpec, this PRD/OpenSpec is canonical.

## Scope

- Add project-level mapping override support.
- Show source notes/articulations found during inspection/normalization where data is available.
- Show current automatic mapping for each source key where data is available.
- Allow override actions:
  - map to a supported `DrumPiece`;
  - ignore source note/articulation;
  - reset to automatic/default mapping.
- Support MIDI note number overrides.
- Support GPIF articulation/source key overrides.
- Support sidestick override to snare or ignore.
- Persist overrides in `.chdg`.
- Apply overrides during normalization/generation.
- Re-run normalization preview when overrides change, or clearly mark preview/generation as stale and require refresh.
- Show warnings/limitations when available source data is incomplete.
- Keep the UI project-based, not global.
- Preserve existing CLI/backend behavior unless explicitly extended for project overrides.
- Preserve validation/generation/preview/offset behavior.
- Preserve Electron security boundaries.

## Non-goals

- No global mapping profiles. That is Phase 16B.
- No Songsterr-specific profile system yet.
- No individual note editing.
- No manual note add/remove/move.
- No automatic ML mapping.
- No community profile database.
- No cloud sync.
- No packaging/distribution.
- No full desktop UX polish pass.
- No external editor/Moonscraper dependency.

## Override concepts

Initial override keys should distinguish source kind:

```txt
midi:<noteNumber>
gpif:<sourceKey>
```

Exact persisted shape can follow repo style, but it must be explicit, serializable, and compatible with future profiles.

Recommended project shape:

```ts
type MappingOverrideTarget =
  | { kind: "piece"; piece: DrumPiece }
  | { kind: "ignore" };

type ProjectMappingOverride = {
  sourceKind: "midi" | "gpif";
  key: string;
  target: MappingOverrideTarget;
  label?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

A simpler object/map shape is acceptable if it is well documented and easy to migrate.

## Supported target pieces

Use the repo's existing `DrumPiece` union as source of truth.

Expected examples include:

```txt
kick
snare
sidestick
hihat_closed
hihat_open
tom_high
tom_mid
tom_floor
crash
ride
```

Do not invent Clone Hero lane/color names as persisted mapping targets. Persist musical pieces, not UI colors.

## UI requirements

Add a Mapping Overrides area to the desktop flow.

It can be a dedicated page, a card in Track Selection/Preview, or a clearly reachable section, but it must be discoverable after inspection/normalization.

Required UI:

```txt
source type
source key / note number / articulation
source label if available
current automatic mapping
override target
ignore toggle/action
reset to automatic/default
status indicating whether preview/generation is stale
```

Use clear copy:

```txt
Project mapping overrides affect normalization/generation for this project only.
They do not edit individual notes.
```

## Staleness behavior

Changing overrides should not silently leave the user believing old preview/output is current.

MVP behavior:

```txt
on override change, mark project dirty
mark output needs-regenerate if generated
clear normalization preview or show stale warning
```

If quick re-normalization is easy, it can be added, but it is not required.

## Backend behavior

Overrides must be applied during normalization/generation.

Expected behavior:

```txt
source hit/event -> lookup project override
if target is ignore -> skip hit
if target is piece -> emit hit with that DrumPiece
if no override -> use existing automatic mapping
```

Keep source trace where possible.

Unknown source notes/articulations should be candidates for override.

## Persistence

`.chdg` should save and reload overrides.

Existing projects without overrides should continue loading.

Do not break schema compatibility.

If schema version changes are needed, keep migration simple and documented.

## CLI behavior

Preserve existing CLI behavior unless the repo already has a clean project-file path for generation.

Phase 16A may extend project-based generation/normalization to use overrides, but it must not force all CLI commands to require project files.

If CLI support is added, document it clearly and keep JSON mode clean.

## Acceptance criteria

- Mapping override docs exist under `docs/phases/16a-project-mapping-overrides/`.
- UI exposes project mapping overrides.
- User can map MIDI note number to `DrumPiece`.
- User can map GPIF source/articulation key to `DrumPiece`.
- User can ignore a MIDI note or GPIF articulation/source key.
- User can reset an override to automatic/default.
- Sidestick can be overridden to snare or ignored.
- Overrides persist in `.chdg`.
- Reopening project restores overrides.
- Overrides affect normalization/generation.
- Changing overrides marks preview/output stale or needs-regenerate.
- Existing generation/validation/preview/offset behavior still works.
- No global profiles are implemented.
- No individual note editing is implemented.
