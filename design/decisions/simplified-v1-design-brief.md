# CHDG Simplified V1 Design Brief

**Status:** User-approved product direction; detailed Pencil work pending.

## 1. Why the previous workflow is superseded

The previous Design V1 improved a technical pipeline but preserved too much of
that pipeline as product navigation:

```text
Project Details → Source Review → Generate → Preview
```

The maintainer has now clarified the actual user goal:

1. import a deterministic drum source and audio;
2. choose the drum track and review mappings;
3. correct conversion-specific exceptions in the Preview;
4. export or update the Clone Hero song.

Inspection, normalization, generation, and validation remain backend
responsibilities. They are visible only as concise progress, actionable
warnings, and advanced diagnostics.

## 2. Selected information architecture

```text
Application
├── Home
├── Projects
├── Settings
└── Active Project
    ├── Preview
    ├── Mappings
    ├── Project Details        contextual
    ├── Export                contextual
    └── More actions          overflow
```

No permanent sidebar is used.

### Global chrome

Home and Projects use a minimal application header with brand, Settings, and
contextual action.

### Creation chrome

Creation uses a task header with back navigation and two selectable steps:

```text
1. Project Details
2. Track & Mapping
```

`Creating Project` is a processing state, not a navigable third step.

### Editor chrome

The Editor header owns:

- back to Projects;
- cover;
- derived project display name;
- save state;
- Undo/Redo;
- Project Details;
- Export/Update Song;
- overflow actions.

The only persistent project tabs are:

```text
Preview
Mappings
```

## 3. Home

Hierarchy:

1. Create Project.
2. Open Project.
3. Recent projects.
4. View all.
5. Settings.

Do not show global pipeline destinations.

## 4. Create Project — Details

Required fields:

- source GP/MIDI;
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

Show the derived project/export folder preview:

```text
Artist - Song Name - Project Name
```

The user should understand that the complete project folder is managed by CHDG
and the external source/audio are import materials.

## 5. Track & Mapping

- Preselect one high-confidence drum track.
- Display a compact selected-track row.
- Allow `Change…`.
- Keep `Add another track` advanced and visually subordinate.
- Show mappings compactly because defaults are usually accepted.
- Use musical names as primary labels.
- Use Clone Hero colors as secondary visual references.
- Unknown mapping flow:
  1. select musical piece;
  2. receive proposed Clone Hero target;
  3. optionally change target.
- Unknown mappings are advisory unless no usable chart can be produced.

## 6. Creating Project

Display real backend steps. Each row has pending, active, completed, or failed
state. Do not display a fabricated percent.

Example user-facing labels may aggregate backend steps:

- Reading source.
- Selecting and extracting drums.
- Applying mappings.
- Converting audio.
- Preparing project.
- Opening Editor.

The detailed progress contract remains authoritative.

## 7. Editor Preview

The existing approved Highway visual direction is retained.

Priority:

1. project identity and Export;
2. transport and offset;
3. waveform;
4. Highway;
5. current selection/context;
6. warnings and secondary diagnostics.

The Highway receives most of the available vertical and horizontal workspace.

Sections may be visible as a compact list or timeline aid. Technical timing
tables must be behind disclosure.

## 8. Note selection and correction

Selecting a note opens a contextual panel or dialog. It shows:

- timestamp and source context;
- detected musical piece;
- effective Clone Hero target;
- piece control;
- target/lane control;
- tom/cymbal where valid;
- open/closed hi-hat where valid;
- accent;
- ghost;
- Delete;
- Restore when corrected/deleted;
- Apply/Cancel if the chosen interaction model is staged.

No timing controls are shown.

Accent and ghost are mutually exclusive. Invalid combinations must be prevented
or explained.

## 9. Mappings

Mappings is a full Editor tab.

Each row shows:

- source key/instrument/articulation;
- detected or selected musical piece;
- effective Clone Hero target;
- color/lane reference;
- affected hit count;
- confidence/advisory state.

Copy:

> Mapping changes affect all matching source notes. Individual note corrections
> remain unchanged.

Reset to defaults requires confirmation if it changes effective output.

## 10. Project Details

Project Details is contextual, not permanent navigation.

It contains:

- Artist;
- Song Name;
- Project Name;
- optional metadata;
- cover;
- export root/folder;
- derived folder preview;
- Apply/Cancel.

Applying identity changes may rename the project folder and associated export
folder after collision preflight. The UI must not imply the rename succeeded
until the backend confirms it.

## 11. Autosave

Normal state:

```text
Saving…
Saved
Save failed
```

Do not show a normal Save button. `Save a Copy…` lives in overflow or Project
Details actions.

Undo/Redo are session controls, not project history.

## 12. Export

Export is launched from the Editor.

States:

- first Export;
- Update Song;
- target collision/ambiguity;
- managed file external modification;
- real-step progress;
- success;
- failure.

The confirmation clearly names managed files:

```text
notes.chart
song.ini
song.ogg
album.jpg (when present)
```

It states that unmanaged files remain untouched.

Success uses `Done`, returning to the Editor.

## 13. Responsive strategy

### 1440 × 900

- full contextual header;
- Highway and waveform dominate;
- note details can use a right-side panel when selected;
- mappings may use a wide table/list.

### 1024 × 768

- compact header;
- no sidebar;
- avoid a permanent wide right panel;
- note editing may become a modal or overlay drawer;
- project details may become a modal;
- mappings use one primary column/stacked row details;
- diagnostics collapse;
- persistent actions must not obscure content.

Structural adaptation is required; do not shrink all typography globally.

## 14. State semantics

Always distinguish through label, icon/shape, and color:

- ready;
- saved/saving/save failed;
- advisory;
- blocking;
- processing;
- failed;
- corrected;
- deleted;
- export current;
- export outdated;
- unavailable.

## 15. Approved exploratory references

See `design/references/simplified-v1-mockups/`. The approved visual qualities are:

- dark modern desktop application;
- compact top navigation;
- clear blue primary actions;
- strong spacing and grouping;
- readable project context;
- Preview dominated by waveform and Highway;
- compact note editor;
- compact mappings;
- simple export result.

The mockups are not final Pencil screens and may contain inaccurate copy or
implementation assumptions.
