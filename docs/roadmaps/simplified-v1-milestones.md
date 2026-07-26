# Simplified V1 Milestones

## Milestone 1 — First Usable Release Candidate

Required:

- self-contained schema;
- GP/MIDI+audio project import;
- project-backed Preview/Highway;
- full tempo map;
- offset;
- mappings;
- individual change/delete corrections;
- session Undo/Redo;
- autosave and one-step recovery;
- Save a Copy;
- safe export/update;
- Home/Projects/Settings;
- no sidebar;
- 1440/1024 design;
- harness and gates.

Absent:

- Replace Audio;
- Import Updated Source;
- add/move/duration;
- tempo editing;
- Expert+ kick;
- batch editor;
- persistent history.

## Milestone 2 — Lifecycle Extensions

### Replace Project Audio

Transactionally convert/replace internal audio, preserve chart/mappings/corrections, require offset/duration review, update export state, rollback on failure.

### Import Updated Source as New Version

Create a separate project, reuse audio/cover/metadata/compatible mappings, preserve original, do not transfer individual corrections automatically, require new identity.

## Not approved

Full authoring/grid/snap/batch/difficulty/tempo/audio-beat-detection/persistent history.
