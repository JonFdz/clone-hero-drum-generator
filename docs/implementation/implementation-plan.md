# CHDG Implementation Plan

## Main pipeline

```txt
MIDI file
  -> MIDI inspection
  -> normalized DrumHit[]
  -> Clone Hero Pro Drums notes
  -> notes.chart + song.ini
  -> Moonscraper/Clone Hero validation
```

## Phase map

| Phase | Name | Final result |
|---|---|---|
| 00 | Project foundation | Repo builds and CLI placeholder works |
| 01 | MIDI inspection | CLI prints MIDI structure, notes and guessed drum pieces |
| 02 | Drum normalization | MIDI notes become typed `DrumHit[]` |
| 03 | First chart generation | CLI writes `notes.chart` and `song.ini` |
| 04 | Manual validation | Repeatable Moonscraper/Clone Hero checklist exists |
| 05 | Pro Drums flags | Cymbals, ghost notes and accents are encoded |
| 06 | Tempo map and sync | MIDI tempo/time signature map is written to `[SyncTrack]` |
| 07 | Validation rules | CLI reports conflicts and suspicious mappings |
| 08 | Future web UI | Web UI plan exists without implementation |

## Definition of done

Every phase requires:

- implementation scoped to that phase only;
- documentation updated;
- `pnpm build` passing;
- `pnpm typecheck` passing;
- manual review/validation when chart output is involved.

## Architecture boundaries

- `apps/cli`: command orchestration only.
- `apps/web`: reserved for later.
- `packages/core`: shared types, timing, pipeline primitives.
- `packages/midi`: MIDI reading and inspection.
- `packages/mappings`: mapping data and functions.
- `packages/chart`: `notes.chart` and `song.ini` writers.
- `packages/validation`: validation rules and reports.
