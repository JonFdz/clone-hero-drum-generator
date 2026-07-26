# CHDG Simplified V1 Requirements

## 1. Product navigation

### Requirement 1.1 — Minimal visible flow

The application SHALL expose the primary flow:

```text
Home → Create Project → Editor → Export
```

#### Scenario — Normal first project

- **GIVEN** no active project
- **WHEN** the user creates a valid project
- **THEN** the application opens the Editor Preview
- **AND** the user is not required to visit Source Review, Generate, or
  Validation.

### Requirement 1.2 — No permanent sidebar

The application SHALL NOT reserve a permanent sidebar for the Simplified V1
navigation.

#### Scenario — Editor at 1024 × 768

- **GIVEN** an active project at 1024 × 768
- **WHEN** Editor Preview renders
- **THEN** project navigation is provided through compact contextual chrome
- **AND** the Highway is not narrowed by a permanent sidebar.

### Requirement 1.3 — Editor destinations

The active Editor SHALL expose only `Preview` and `Mappings` as permanent
destinations. Project Details and Export SHALL be contextual surfaces.

### Requirement 1.4 — Canonical routes

The renderer SHALL implement or preserve these public route contracts:

```text
/home
/projects
/projects/new/details
/projects/new/mapping
/projects/new/creating
/projects/:projectId/editor/preview
/projects/:projectId/editor/mappings
/settings
```

Old routes MAY redirect temporarily but SHALL NOT remain primary navigation.

## 2. Creation details

### Requirement 2.1 — Mandatory identity and inputs

Project creation SHALL require:

- valid GP/MIDI source;
- valid audio;
- non-empty Artist;
- non-empty Song Name;
- non-empty Project Name.

#### Scenario — Missing Project Name

- **GIVEN** valid source/audio and Artist/Song Name
- **WHEN** Project Name is empty
- **THEN** Next/Create is unavailable
- **AND** a field-level explanation is shown.

### Requirement 2.2 — Derived name

The canonical display and folder stem SHALL be:

```text
Artist - Song Name - Project Name
```

The UI SHALL preview the sanitized folder result before creation.

### Requirement 2.3 — Optional details

Cover, album, year, genre, charter, and output-root override SHALL remain
optional unless an existing format constraint requires otherwise.

## 3. Track and mappings

### Requirement 3.1 — Track recommendation

CHDG SHALL recommend one highest-confidence drum track when possible and SHALL
allow manual selection of any source track.

#### Scenario — Unrecognized drum track

- **GIVEN** no source track is confidently identified as drums
- **WHEN** analysis completes
- **THEN** the user can choose any track manually
- **AND** the state is explained as exceptional, not fatal.

### Requirement 3.2 — Multiple tracks

Multiple-track selection MAY remain advanced and SHALL NOT be the default
visible interaction.

### Requirement 3.3 — Two-level mapping

CHDG SHALL preserve:

1. effective musical piece;
2. effective Clone Hero target.

Changing a target SHALL NOT erase or falsify the musical piece.

#### Scenario — Ride mapped to green cymbal

- **GIVEN** a hit detected as Ride
- **WHEN** the project target is changed to Green Cymbal
- **THEN** the hit remains musically identified as Ride
- **AND** its effective Clone Hero target is green cymbal.

### Requirement 3.4 — Unknown mapping

For an unknown source key, the UI SHALL let the user select a musical piece,
SHALL propose a corresponding Clone Hero target, and SHALL allow changing that
target.

Unknown mappings SHALL be advisory unless no usable notes can be produced.

## 4. Real project creation

### Requirement 4.1 — Real progress events

The backend SHALL emit typed, ordered creation steps. The UI SHALL NOT display a
fabricated percentage.

### Requirement 4.2 — Transactional creation

The final project folder SHALL become visible as a valid project only after:

- source document is materialized;
- source is archived;
- audio conversion succeeds;
- optional cover processing completes or produces an approved advisory;
- `project.chdg` validates.

#### Scenario — Audio conversion fails

- **GIVEN** source analysis succeeded
- **WHEN** audio conversion fails
- **THEN** creation reports the failed real step
- **AND** no valid-looking final project folder is committed
- **AND** retry/correction is actionable.

## 5. Self-contained project

### Requirement 5.1 — Portable unit

The complete project folder SHALL be the portable unit. Copying only
`project.chdg` is unsupported.

### Requirement 5.2 — Fixed internal file

The project file SHALL be named:

```text
project.chdg
```

### Requirement 5.3 — Managed assets

The project SHALL archive the source and own converted audio and optional cover
under relative paths.

### Requirement 5.4 — No external dependency

After successful creation, opening, previewing, editing, saving, and exporting
SHALL NOT require the original external GP/MIDI, audio, or cover paths.

#### Scenario — Originals deleted

- **GIVEN** a valid created project
- **AND** all original import files are deleted or moved
- **WHEN** the project is reopened
- **THEN** Preview and Export continue from internal assets
- **AND** no missing-original warning is shown.

### Requirement 5.5 — Direct schema V1

The implementation MAY replace provisional schema V1 without migration because
no release compatibility is required.

## 6. Persisted musical source

### Requirement 6.1 — Imported base

`project.chdg` SHALL persist imported `DrumHit[]` or an equivalent validated
serialization retaining stable hit identity and provenance.

### Requirement 6.2 — Timing

The project SHALL persist full resolution, tempo events, time signatures, and
sections required to reconstruct the effective chart.

### Requirement 6.3 — Stable identities

Each imported hit SHALL have a deterministic stable ID independent of absolute
filesystem paths.

Collision handling SHALL fail validation rather than silently overwrite an
overlay target.

## 7. Effective chart and note correction

### Requirement 7.1 — Precedence

Effective output SHALL use:

```text
individual correction
> project mapping override
> automatic/default mapping
```

### Requirement 7.2 — Allowed individual corrections

The Editor SHALL allow a single source hit to:

- change musical piece;
- change Clone Hero target/lane;
- change tom/cymbal where valid;
- change open/closed hi-hat;
- toggle accent;
- toggle ghost;
- delete;
- restore.

### Requirement 7.3 — Mutual exclusion

Accent and ghost SHALL NOT both be effective on one note.

### Requirement 7.4 — Bounded editor

Simplified V1 SHALL NOT expose:

- add note;
- move note;
- edit tick;
- edit duration;
- copy/paste;
- batch transforms;
- tempo editing;
- time-signature editing;
- section editing;
- Expert+ kick authoring.

### Requirement 7.5 — Zero length

Every generated Simplified V1 drum note SHALL have exported length zero.

### Requirement 7.6 — Mapping changes preserve corrections

#### Scenario — Mapping changed after one correction

- **GIVEN** a source key mapped globally to Blue Tom
- **AND** one hit is individually corrected to Green Tom
- **WHEN** the global mapping changes to Yellow Tom
- **THEN** uncorrected matching hits become Yellow Tom
- **AND** the individually corrected hit remains Green Tom.

## 8. Editor Preview

### Requirement 8.1 — Preview before export

Preview SHALL render from internal project data and internal `song.ogg` before a
Clone Hero export exists.

### Requirement 8.2 — Existing visual assets

The implementation SHOULD reuse the existing waveform and Highway components
where behavior remains valid.

### Requirement 8.3 — Selectable notes

Preview data SHALL expose stable note IDs and enough effective/source metadata
to select and correct one note.

### Requirement 8.4 — Large chart rendering

The renderer SHALL avoid creating one persistent Angular DOM element per note
for the complete song and SHALL use visible-window/canvas/indexed techniques.

### Requirement 8.5 — Audio unavailable

If the internal project audio is missing or corrupt, visual note inspection MAY
remain available, while playback, synchronization, and export SHALL be
unavailable with an actionable error.

## 9. Offset and tempo

### Requirement 9.1 — Global offset

Offset SHALL remain a global chart/audio alignment value and SHALL NOT rewrite
all note/event ticks.

### Requirement 9.2 — Full tempo map

The complete source tempo map and time signatures SHALL survive import,
Preview, and export.

### Requirement 9.3 — No tempo editor

Simplified V1 SHALL NOT expose manual BPM/tempo-map editing.

### Requirement 9.4 — Proven timing mismatch

A proven loss or mismatch of timing events between internal project and desired
export SHALL block export.

### Requirement 9.5 — Multi-tempo regression

A synthetic fixture with a later tempo change SHALL verify synchronization
before and after the change.

### Requirement 9.6 — Notes after audio

Notes whose effective time exceeds internal audio duration SHALL produce a
warning containing count and maximum overrun. They SHALL NOT be silently
truncated.

## 10. Autosave and recovery

### Requirement 10.1 — Autosave default

Project mutations SHALL enqueue autosave. The UI SHALL expose `Saving…`,
`Saved`, and `Save failed`.

### Requirement 10.2 — Atomic save

A save SHALL validate a temporary serialization before atomically replacing
`project.chdg`.

### Requirement 10.3 — Previous valid copy

Before replacement, the previous valid project SHALL be retained at:

```text
recovery/previous.chdg
```

Only one previous valid copy is required.

### Requirement 10.4 — Session Undo/Redo

Approved editing/mapping/metadata/offset mutations SHALL support session
Undo/Redo. Command history SHALL NOT be presented as persistent Project History.

### Requirement 10.5 — Close/switch

Closing or switching projects SHALL flush pending saves or present a blocking
save failure choice. Changes SHALL NOT be silently abandoned.

## 11. Save a Copy

### Requirement 11.1 — Complete copy

Save a Copy SHALL duplicate the complete project folder, including assets.

### Requirement 11.2 — Independent identity

The copy SHALL receive:

- a new project ID;
- unique mandatory identity;
- reset export ownership/fingerprints;
- independent catalog entry.

The original SHALL remain unchanged.

## 12. Project identity rename

### Requirement 12.1 — Apply-time rename

Changing Artist, Song Name, or Project Name SHALL preflight and transactionally
rename the managed project folder when Project Details is applied, not on every
keystroke.

### Requirement 12.2 — Collision

If the target exists, the operation SHALL preserve the old folder and identity
and SHALL report the collision.

### Requirement 12.3 — Export association

If a known managed export folder is renamed as part of the approved behavior,
the operation SHALL preflight it and SHALL not overwrite another folder.

## 13. Export

### Requirement 13.1 — Internal source

Export SHALL use only project-owned musical data and assets.

### Requirement 13.2 — Managed files

CHDG SHALL manage:

```text
notes.chart
song.ini
song.ogg
album.jpg (when present)
```

### Requirement 13.3 — Preserve unmanaged files

Export SHALL NOT delete or replace files not identified as managed.

### Requirement 13.4 — Internal manifest

Export target and managed file fingerprints SHALL live inside `project.chdg`.
CHDG SHALL NOT require `.chdg-project.json` or another output marker.

### Requirement 13.5 — Incremental work

The exporter SHOULD avoid replacing a managed file whose desired content and
validated target content are unchanged.

### Requirement 13.6 — Ambiguous destination

A first-use existing destination or externally modified managed file SHALL
require explicit confirmation before replacement.

Confirmation SHALL list affected managed files and state that unmanaged files
remain untouched.

### Requirement 13.7 — Atomic/staged update

Changed managed artifacts SHALL be staged and validated before final
replacement. A failed operation SHALL not leave a mixed partially updated set
without recovery information.

### Requirement 13.8 — Real progress

Export SHALL emit authoritative ordered steps without fabricated percentage.

### Requirement 13.9 — Result

Success SHALL report updated, unchanged, and removed managed files. `Done`
SHALL return the user to the Editor.

## 14. Local catalog and Settings

### Requirement 14.1 — Project catalog

Recent/all projects SHALL use Electron-owned local catalog metadata rather than
scanning arbitrary folders on every Home render.

### Requirement 14.2 — Settings

Settings SHALL include:

- project root;
- default Clone Hero output root;
- default charter;
- FFmpeg configuration/diagnostic;
- retained approved appearance settings.

## 15. Security and architecture

### Requirement 15.1 — Package ownership

Reusable domain/import/persistence/preview/export logic SHALL live in
`packages/*`. Electron and Angular SHALL not duplicate it.

### Requirement 15.2 — Renderer isolation

The Angular renderer SHALL NOT receive unrestricted filesystem access.

### Requirement 15.3 — IPC validation

Electron SHALL validate typed payloads, project IDs, job IDs, and filesystem
targets before invoking package services.

### Requirement 15.4 — Local-only

Simplified V1 SHALL not upload project content.

## 16. Design and accessibility

### Requirement 16.1 — Mockup references

Pencil SHALL use the exact approved mockup PNGs as references and SHALL NOT
regenerate them during this design phase.

### Requirement 16.2 — Responsive desktop

Required main states SHALL be designed and validated at 1440 × 900 and
1024 × 768.

### Requirement 16.3 — Highway priority

The Editor composition SHALL preserve the Highway as the primary content region.

### Requirement 16.4 — Accessible semantics

- no status depends only on color;
- keyboard focus is visible;
- dialogs/drawers manage and restore focus;
- disabled actions explain blocking reason;
- essential actions remain reachable at 1024 × 768.

## 17. Browser harness and quality

### Requirement 17.1 — Deterministic states

The browser harness SHALL provide deterministic scenarios for creation,
Editor, mappings, save, and export states defined by the validation plan.

### Requirement 17.2 — Quality gates

Every implementation PR SHALL run applicable focused tests and the final
integration SHALL pass:

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test
```

## 18. Milestone 2

### Requirement 18.1 — Replace Audio deferred

Replace Project Audio SHALL not block the first usable Simplified V1 milestone.

### Requirement 18.2 — Updated source deferred

Import Updated Source SHALL create a new project version and SHALL not modify
the current project. It is deferred from Milestone 1.

Individual corrections SHALL not be transferred automatically without a future
approved reconciliation specification.
