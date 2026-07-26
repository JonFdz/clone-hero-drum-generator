# CHDG Simplified V1 — Approved Product Decisions

**Status:** Approved Wave 0 contract  
**Prepared against:** `main@ac5ccefcd72b4c46be9e6d8e1e605a598fc0d856`  
**Supersedes:** visible Details → Source Review → Generate → Preview workflow

## Product statement

CHDG is a local deterministic converter and lightweight correction tool for real drum transcriptions. It imports GP/MIDI, packages audio, allows conversion-specific corrections, and exports an Expert Pro Drums Clone Hero song folder.

It is not a general-purpose chart editor or a replacement for Guitar Pro.

## Primary flow

```text
Home
  → Create Project
      → Project Details
      → Track & Mapping
      → real backend progress
  → Editor
      → Preview
      → Mappings
      → contextual Project Details
      → individual note corrections
  → Export / Update Song
      → real backend progress
      → success/failure
      → Done
```

## Source of truth

External GP/MIDI and original audio are import inputs only.

After import:

- `project.chdg` plus internal assets are authoritative;
- external originals may be moved/deleted;
- Preview, editing, and export still work;
- output files are derived;
- archived source is provenance only and is not monitored.

## Portable unit

```text
Artist - Song Name - Project Name/
├── project.chdg
├── assets/
│   ├── source.gp|mid|midi
│   ├── song.ogg
│   └── album.jpg        # optional
└── recovery/
    └── previous.chdg
```

The full folder is portable. The JSON alone is not.

## Format

- The new format is directly `schemaVersion: 1`.
- No public release exists, so provisional `.chdg` compatibility/migration is unnecessary.
- Imported `DrumHit[]`, full timing, mappings, corrections, metadata, relative assets, and export state are persisted.

## Identity and naming

Mandatory:

- Artist
- Song Name
- Project Name

Derived human name:

```text
Artist - Song Name - Project Name
```

Example:

```text
Paramore - Decode - Studio GP
```

Rules:

- internal filename is always `project.chdg`;
- project and default export folders use the derived name;
- no visible UUID or silent numeric suffix;
- collisions require a different Project Name;
- identity changes rename folders transactionally.

## Import

Required:

- GP/GPIF or MIDI source;
- audio;
- mandatory identity;
- one selected drum track.

Optional:

- cover;
- album/year/genre/charter;
- output-root override;
- advanced additional tracks.

CHDG selects the clearest drum track by default. Manual arbitrary track selection remains available as an exceptional path.

## Mapping

Preserve:

```text
source identity → musical piece → Clone Hero target
```

A Ride can target Green Cymbal while remaining a Ride.

Unknown mapping flow:

1. choose the musical piece;
2. CHDG proposes its standard target;
3. user may change the target.

Unknown mappings are advisory unless no usable drum notes can be produced.

## Individual corrections

Base imported hits are immutable. Corrections are overlays.

Priority:

```text
individual correction
> source-specific target override
> default target for effective musical piece
```

Allowed:

- piece;
- target/lane;
- tom/cymbal;
- open/closed hi-hat;
- accent;
- ghost;
- delete/restore;
- Undo/Redo in-session.

Excluded:

- add;
- move/retime;
- tick;
- duration/sustain;
- batch;
- tempo/time signature;
- Expert+ / special 2x kick.

All exported V1 hits have chart length 0.

## Tempo and offset

- Preserve the full source tempo map.
- A missing tempo event is a conversion defect, not a user BPM-edit task.
- A Decode-like two-tempo regression is mandatory.
- V1 has no tempo editor.
- Offset is a global chart/audio alignment value and does not rewrite all ticks.

## Save and recovery

- autosave;
- Saving / Saved / Save failed;
- atomic writes;
- one `recovery/previous.chdg`;
- session Undo/Redo;
- no visible Project History;
- Save a Copy duplicates the whole folder, assigns a new project ID, and clears export ownership.

## Export

Default output root may be the Clone Hero Songs folder.

Managed outputs:

- `notes.chart`;
- `song.ini`;
- `song.ogg`;
- `album.jpg` when present.

Only affected managed files should update. Unmanaged files are preserved. Export is staged and committed atomically.

Ownership/fingerprints live in `project.chdg`; no marker file is added to output.

Accepted limitation: arbitrary copied/renamed output ownership cannot be proven without a marker, so ambiguous destinations require confirmation.

## Navigation

No permanent sidebar.

Application level:

- Home
- Projects
- Settings

Project level:

- Preview
- Mappings

Contextual:

- Project Details
- Edit Note
- Export
- exceptional overflow actions

Removed as visible destinations:

- Inspect Source
- Source Review
- Normalize
- Generate
- Validate

## Milestones

### Milestone 1

Create, Preview, mappings, individual corrections, offset, autosave/recovery, Save a Copy, export/update, reopen.

### Milestone 2

Replace Project Audio and Import Updated Source as a new project version.
