# CHDG Implementation Plan

## Main pipeline

Current implemented MIDI pipeline:

```txt
MIDI file
  -> MIDI inspection
  -> normalized DrumHit[]
  -> Clone Hero Pro Drums note model
  -> notes.chart + song.ini
  -> Moonscraper/Clone Hero validation
```

Updated target pipeline:

```txt
MIDI or GPIF input
  -> source inspection
  -> normalized DrumHit[]
  -> Clone Hero Pro Drums note model
  -> notes.chart + song.ini
  -> audio packaging
  -> local song folder / ZIP
  -> Moonscraper/Clone Hero validation
```

Desktop target:

```txt
Electron + Angular desktop app
  -> local file selection
  -> local source inspection
  -> local generation
  -> local ffmpeg audio conversion
  -> local output folder/ZIP
```

The CLI remains important for automation, tests, agent tasks and debugging.

## Current status

| Phase | Name | Status | Final result |
|---|---|---|---|
| 00 | Project foundation | Complete | Repo builds and CLI placeholder works |
| 01 | MIDI inspection | Complete | CLI prints MIDI structure, notes and guessed drum pieces |
| 02 | Drum normalization | Complete | MIDI notes become typed `DrumHit[]` |
| 03 | First chart generation | Implementation complete | CLI writes `notes.chart` and `song.ini` |
| 04 | Manual validation setup | Created / partial validation | Repeatable validation process exists; full validation deferred |
| 04A | Audio packaging | Next recommended | CLI can package audio into `song.ogg` |
| 04B | Demo and track-detection hardening | Next recommended | Official demo uses a better drum sample and auto-detection avoids false strong tracks |
| 05 | Pro Drums flags | Pending | Cymbals, ghost notes and accents are encoded |
| 06 | Tempo map and sync | Pending / partly implemented | Tempo/time signature behavior is reliable and validated |
| 07 | Validation rules | Pending | CLI reports conflicts and suspicious mappings |
| 08 | Guitar Pro / GPIF inspection | Pending | `.gp` files can be inspected deterministically |
| 09 | GPIF drum normalization | Pending | GPIF drum tracks become `DrumHit[]` |
| 10 | Desktop app shell | Pending | Electron + Angular shell can call local generation pipeline |
| 11 | Future symbolic inputs | Pending | MusicXML/MXL research/import if useful |

## Demo source policy

The original Stairway to Heaven demo exposed useful edge cases but is not a good main validation sample because drums enter very late.

The main demo should move to a song with:

- drums near the beginning;
- one clear drum track;
- no unknown notes;
- simple enough structure for visual validation;
- enough cymbals/toms to validate later Pro Drums flags.

Current preferred demo candidate:

```txt
Eat My Dust — Dead Pony
MIDI drum track: 53
Tempo: 147 BPM
Time signature: 4/4
Drum hits: 1039
Unknown notes: none
```

Do not commit copyrighted MIDI/audio unless licensing is explicitly safe. Local samples can remain ignored while documented as validation fixtures.

## Definition of done

Every implementation phase requires:

- implementation scoped to that phase only;
- documentation updated;
- `pnpm build` passing;
- `pnpm typecheck` passing;
- `pnpm test` passing when tests are present;
- manual review/validation when chart output is involved.

Manual Moonscraper/Clone Hero validation can be deferred explicitly when the phase is intentionally only implementation-complete or setup-complete.

## Architecture boundaries

- `apps/cli`: command orchestration only.
- `apps/desktop`: future Electron + Angular desktop app.
- `apps/web`: optional future web surface, not the main product target.
- `packages/core`: shared types, timing, pipeline primitives.
- `packages/midi`: MIDI reading, inspection and normalization.
- `packages/guitarpro`: future GPIF reading, inspection and normalization.
- `packages/mappings`: mapping data and functions.
- `packages/chart`: `notes.chart` and `song.ini` writers.
- `packages/audio`: future audio preparation via ffmpeg.
- `packages/validation`: validation rules and reports.
- `packages/project`: future orchestration for full song package generation.
