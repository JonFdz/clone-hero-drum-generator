# Technical and Product Design: CHDG Simplified V1

## 1. Sources of truth

```text
During project creation:
external GP/MIDI + original audio + optional cover
                      ↓
After successful creation:
complete CHDG project folder
                      ↓
Derived consumers:
Editor Preview and Clone Hero export
```

The external import files are not monitored or required after creation.

## 2. Project folder

```text
<project-root>/
└── <Artist - Song Name - Project Name>/
    ├── project.chdg
    ├── assets/
    │   ├── source.<gp|mid|midi>
    │   ├── song.ogg
    │   └── album.jpg                 # optional
    └── recovery/
        └── previous.chdg             # created after first replacement
```

Only the complete folder is portable. All managed paths inside the JSON are
relative and traversal-safe.

## 3. Project schema

Direct V1 replaces the provisional schema. No migration is required.

Main sections:

```text
schemaVersion
appVersion
project
import
assets
sourceDocument
mappings
corrections
editor
export
```

### Project

- stable `projectId`;
- mandatory `artist`, `songName`, `projectName`;
- derived display name;
- created/updated timestamps;
- optional album/year/genre/charter.

### Import

- source kind;
- original filename;
- archived relative path;
- source hash;
- imported timestamp;
- selected track(s);
- import diagnostics/provenance.

### Source document

- resolution;
- imported `DrumHit[]` with stable IDs;
- full tempo events;
- time signatures;
- sections.

### Mappings

Each source key resolves independently to:

- effective musical piece;
- Clone Hero target (`lane`, `cymbal`);
- ignore;
- provenance/default/override metadata.

### Corrections

Sparse per-hit overlays:

- replace piece;
- replace target;
- open/closed hi-hat;
- accent;
- ghost;
- delete;
- restore by removing/clearing overlay.

No tick or length override.

### Editor

- global offset;
- UI-persistent project preferences only when product-approved;
- no session command history persisted.

### Export

- target root/directory;
- last successful time;
- input fingerprints;
- managed file hash/size manifest;
- current/outdated/failed state.

No marker is written into the output directory.

## 4. Effective chart

```text
imported hit
  → resolve musical piece
  → resolve project Clone Hero target
  → apply individual correction
  → omit if deleted/ignored
  → produce effective CloneHeroDrumNote
```

Precedence:

```text
individual correction
> project mapping override
> automatic/default mapping
```

All V1 output notes use `length: 0`.

Accent and ghost are mutually exclusive. Open/closed hi-hat remains distinct
musically even when both target yellow cymbal.

## 5. Stable hit IDs

IDs must be deterministic and independent of absolute project paths.

Recommended components:

### MIDI

```text
midi:<track-index>:<channel>:<tick>:<midi-note>:<occurrence-index>
```

### GPIF

```text
gpif:<track-index>:<measure-index>:<voice-index>:<beat-index>:<note-index>:<normalized-articulation-key>
```

The implementation may use a canonical serialization + hash. Collision
detection is required. Repeated hits at the same musical position require an
occurrence discriminator.

## 6. Import pipeline

Split into:

### Analysis

- validate selections;
- inspect source;
- list/recommend tracks;
- normalize candidate hit data;
- build mapping candidates;
- report advisory/blocking issues.

No final project folder is committed.

### Creation

- preflight derived name and target;
- create temporary project directory;
- normalize selected track(s);
- archive source;
- convert audio to project-owned OGG;
- prepare cover;
- build source document/mappings;
- write and validate `project.chdg`;
- atomically rename temporary directory into final folder;
- add to local project catalog;
- open Editor.

Failure removes or quarantines temporary data and leaves no valid-looking
partial project.

## 7. Save and recovery

Project save:

1. serialize to temporary file in project directory;
2. parse and validate temporary file;
3. move previous valid `project.chdg` to `recovery/previous.chdg`;
4. atomically replace `project.chdg`;
5. update catalog after success.

Autosave is a coalescing queue. Mutations during a save trigger one subsequent
save. Closing/switching flushes with a bounded failure flow.

Undo/Redo is session-only command history for approved mutations.

## 8. Naming and rename

Mandatory identity:

```text
Artist
Song Name
Project Name
```

Derived sanitized folder/display:

```text
Artist - Song Name - Project Name
```

Sanitization must be deterministic across supported desktop OS constraints.
Display values remain unsanitized in metadata.

Applying identity changes:

- preflight project and known export targets;
- detect collisions;
- pause/flush autosave;
- transactionally rename;
- rewrite relative/absolute catalog/export references;
- rollback on failure;
- report final confirmed identity only after success.

## 9. Save a Copy

- copies complete folder through temporary target;
- requires unique mandatory identity;
- assigns new `projectId`;
- retains imported assets/source document/mappings/corrections;
- clears export path, ownership/fingerprints, and last successful export;
- resets timestamps appropriately;
- preserves original project unchanged.

## 10. Preview

Preview reads:

- `sourceDocument`;
- effective mappings/corrections;
- `assets/song.ogg`;
- offset.

It does not require exported `notes.chart`.

Backend/facade data includes:

- note ID;
- tick/time/end time;
- musical piece;
- effective target/lane/cymbal;
- accent/ghost;
- correction state;
- source/provenance summary;
- tempo, time signatures, sections;
- duration diagnostics.

The renderer retains canvas/visible-window rendering and indexed hit testing.

## 11. Offset and timing

Offset is global metadata; it does not rewrite every tick.

Full source tempo map is retained. There is no tempo editor. Source/internal or
internal/export timing mismatch proven by validation is blocking.

Required regression:

```text
tempo at tick 0
tempo change at a later measure
notes before and after change remain synchronized
```

No copyrighted test material is committed.

## 12. Export

Input is the self-contained project.

Managed files:

```text
notes.chart
song.ini
song.ogg
album.jpg (when project cover exists)
```

Algorithm:

1. validate project and internal assets;
2. materialize effective chart;
3. compute desired managed contents/fingerprints;
4. inspect target and prior manifest;
5. classify unchanged/update/create/ambiguous/external-modified;
6. request confirmation where required;
7. stage every changed managed artifact;
8. validate staged artifacts;
9. commit replacements with rollback strategy;
10. update internal export manifest through project save;
11. return updated/unchanged/removed/failed summary.

Unmanaged files are never deleted or replaced.

If the cover was removed, product behavior must explicitly confirm whether a
previously managed `album.jpg` is removed. Default planned behavior: remove it
only if the internal manifest proves CHDG previously managed that exact file,
and include the removal in confirmation/summary.

## 13. Progress

Use typed job IDs and events, not fake percentages.

```text
queued | running | completed | failed | cancelled
```

Creation and export have authoritative ordered step IDs in the progress contract.
The renderer aggregates labels but cannot invent steps.

## 14. Electron/IPC

Reusable logic remains in packages. Electron:

- validates inputs and identifiers;
- invokes package services;
- emits progress subscriptions;
- mediates file pickers and shell actions;
- enforces path permissions/allowlist;
- returns typed envelopes/errors.

Renderer never receives unrestricted filesystem access.

One integration owner controls `main.ts`, `preload.cts`, bridge types, and
global declaration hotspots.

## 15. Routes and UI ownership

Canonical routes are defined in the route contract. Contextual dialogs/panels do
not receive permanent routes.

The renderer may begin against fixtures after B1 and D1 contracts stabilize.
Real IPC integration occurs in B7/I1.

## 16. Parallel worktree design

See `docs/roadmaps/simplified-v1-worktree-plan.md`.

Principles:

- contract-first;
- domain producers before consumers;
- designs parallel to backend;
- frontend against stable fixtures;
- exclusive hotspots;
- single final integration owner;
- no stacked PR merged before dependencies.

## 17. Milestone 2

### Replace Audio

Convert new source into staged internal OGG, validate, replace asset atomically,
mark offset/export for review, keep chart/corrections.

### Import Updated Source

Create a new project version. Reuse audio, cover, metadata, and compatible
mappings. Do not modify original. Do not automatically transfer individual
corrections unless a future separately approved reconciliation contract exists.
