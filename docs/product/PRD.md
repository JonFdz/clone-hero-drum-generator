# Product Requirements Document: CHDG Simplified V1

## 1. Summary

CHDG is a desktop-first local application that imports deterministic Guitar Pro/GPIF or MIDI drum transcriptions, packages user audio, allows limited conversion-specific corrections, and exports an Expert Pro Drums song folder for Clone Hero.

CHDG does not infer charts from audio and is not a general-purpose chart editor.

## 2. User problem

Converting real drum notation to Clone Hero requires repetitive technical work: track selection, articulation interpretation, lane mapping, tempo preservation, audio packaging, metadata, isolated corrections, and safe re-export. Simplified V1 hides routine pipeline mechanics and presents one creation task, one editor, and one export action.

## 3. Product principles

1. Self-contained after import.
2. Deterministic conversion.
3. Minimal visible workflow.
4. Preserve musical meaning separately from Clone Hero placement.
5. Non-destructive correction overlays.
6. Strictly bounded editor.
7. Atomic save/export.
8. One primary action per context.

## 4. Primary flow

```text
Home
  → Create Project
      1. Details
      2. Track & Mapping
      3. Real progress state
  → Editor
      Preview
      Mappings
      contextual Project Details
      individual corrections
  → Export / Update Song
      real progress
      result
      Done
```

## 5. Functional requirements

### Home

Home shall provide Create Project as the dominant action, Open Project, recent projects, View All, and Settings. It shall not expose Source Review, Generate, or Preview globally.

### Create Project — Details

Required:

- `.gp`, `.mid`, or `.midi` source;
- audio;
- Artist;
- Song Name;
- Project Name.

Optional:

- cover;
- album;
- year;
- genre;
- charter;
- output-root override.

The derived folder name must be visible:

```text
Artist - Song Name - Project Name
```

### Create Project — Track & Mapping

CHDG shall:

- inspect the source;
- recommend one drum track;
- allow a different/manual track;
- keep multiple-track selection advanced;
- show compact mappings;
- identify unknown/low-confidence mappings;
- let unknown mappings choose a musical piece and accept/change a proposed Clone Hero target.

Unknown mappings are advisory unless no usable notes exist.

### Creation processing

The backend emits real ordered steps; the UI displays pending/current/completed/failed state and no invented percentage.

Creation uses a temporary target and commits the final folder only after required assets and `project.chdg` validate.

### Self-contained project

Successful creation produces:

```text
<derived-name>/
├── project.chdg
├── assets/
│   ├── source.<ext>
│   ├── song.ogg
│   └── album.jpg        # optional
└── recovery/
```

External originals are no longer required or monitored.

### Editor

The Editor opens immediately after import, before any Clone Hero export exists.

Permanent project navigation contains only Preview and Mappings. Project Details and Export are contextual.

### Preview

Preview uses internal project data and `assets/song.ogg`, not exported output. It provides:

- audio playback;
- waveform;
- existing Highway;
- synchronized time;
- section navigation;
- offset;
- note selection/details;
- relevant warnings;
- secondary timing diagnostics.

### Offset

Offset remains a global chart/audio alignment value. It does not permanently move all ticks. UI copy should express relative alignment clearly and provide coarse/fine adjustment.

### Individual note corrections

Allowed:

- piece;
- Clone Hero target/lane;
- tom/cymbal;
- open/closed hi-hat;
- accent;
- ghost;
- delete;
- restore.

Accent and ghost are mutually exclusive.

Not exposed:

- add;
- move;
- tick;
- duration;
- copy/paste;
- batch;
- tempo;
- Expert+ kick.

### Mappings

Mappings apply to every hit with the same source key. Rows show:

- source instrument/articulation;
- effective musical piece;
- Clone Hero target and color reference;
- affected count;
- confidence/attention when needed.

Individual corrections stay authoritative after mapping changes.

### Project Details

Contextual Project Details edits mandatory identity, optional metadata, cover, and export destination. Applying identity changes preflights and transactionally renames folders. Collision preserves old state.

### Autosave and recovery

- autosave after mutations;
- Saving, Saved, Save failed;
- atomic `project.chdg` replacement;
- one previous valid copy at `recovery/previous.chdg`;
- session-only Undo/Redo;
- no Project History UI.

### Save a Copy

Save a Copy duplicates the full project folder, requires non-conflicting identity, assigns a new project ID, clears export ownership/fingerprints, and leaves the source project unchanged.

### Export and update

Export occurs inside the Editor and manages:

- `notes.chart`;
- `song.ini`;
- `song.ogg`;
- `album.jpg` when present.

Only affected managed files update where practical. Unmanaged files remain. All required work is staged before atomic commit.

### Export ownership

Target path, input fingerprints, and managed output hashes live in `project.chdg`. No output marker is created.

An existing or externally modified ambiguous destination requires confirmation that names the managed files to replace and states that unmanaged files remain.

### Tempo map

The full source tempo map and time signatures are retained. V1 has no tempo editor. A confirmed source/export timing mismatch blocks export. A synthetic two-tempo Decode-style regression is mandatory.

### Duration warning

Notes after internal audio end produce a warning with count and maximum overrun. Notes are not silently truncated.

### Settings

Settings include project root, default Clone Hero output root, default charter, FFmpeg configuration/diagnostic, and existing appearance settings.

### Projects list

Recent/all projects use Electron-owned local catalog metadata including project ID, path, display name, last opened, optional cover, and duration where available.

### Milestone 2

Replace Audio and Import Updated Source are deferred. Updated source creates a new project version and does not modify the original.

## 6. Non-functional requirements

### Portability

Moving the complete project folder preserves operation. Moving only the JSON is unsupported.

### Performance

Preview must avoid one Angular element per song note. Use canvas/visible-window rendering and indexed hit testing suitable for large charts.

### Accessibility

- visible focus;
- no color-only status;
- correct dialog focus management;
- keyboard note-correction actions;
- reachable actions at 1024×768;
- usable zoom/wrapping.

### Security

- Electron context isolation stays enabled;
- renderer has no unrestricted filesystem access;
- IPC validates IDs, payloads, and paths;
- no uploads.

### Quality gates

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test
```

## 7. Canonical routes

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

Project Details, note editing, and export are contextual states rather than permanent top-level routes.

## 8. Success criteria

A user can:

1. create from GP/MIDI and audio;
2. delete external originals;
3. reopen and Preview with audio;
4. adjust mappings and individual notes;
5. change offset;
6. close/reopen without data loss;
7. export a complete song folder;
8. update only affected managed files;
9. preserve unrelated destination files;
10. survive save/export failures without corrupting valid project/output state.
