# CHDG Implementation Plan

## Main pipeline

Current implemented MIDI-first pipeline:

```txt
MIDI file
  -> MIDI inspection
  -> drum track selection
  -> normalized DrumHit[]
  -> Clone Hero Pro Drums note model
  -> notes.chart + song.ini
  -> song.ogg audio packaging
  -> Pro Drums cymbals/dynamics/open hi-hat encoding
  -> sections/global events when present
  -> Moonscraper/Clone Hero validation
```

Target multi-source pipeline:

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
| 03 | First chart generation | Complete | CLI writes `notes.chart` and `song.ini` |
| 04 | Manual validation setup | Complete / deferred checks captured | Repeatable validation process exists |
| 04A | Audio packaging | Complete | CLI can package audio into `song.ogg` using system ffmpeg |
| 04B | Demo and track-detection hardening | Effectively covered by later work | Eat My Dust demo and explicit track validation are used locally |
| 05 | Pro Drums cymbal flags | Complete | Yellow/blue/green cymbals are encoded as `N 66`/`N 67`/`N 68` |
| 05A | Pro Drums dynamics and open hi-hat | Complete | Accent/ghost modifiers are encoded and open hi-hat uses yellow-accent convention |
| 05B | Sections and global events | Complete / PR reviewed | `SongSection[]`, `[Events]` section writing, and MIDI marker filtering exist |
| 06 | GPIF / `.gp` inspection | Next recommended | `.gp` files can be inspected deterministically without generating charts |
| 07 | GPIF drum normalization | Pending | GPIF drum tracks become `DrumHit[]` |
| 08 | Generate from GPIF | Pending | `.gp` input can produce `notes.chart`, `song.ini`, and packaged audio |
| 09 | Metadata and offset controls | Pending | CLI supports user metadata and manual audio/chart offset |
| 10 | Desktop app shell | Pending | Electron + Angular shell can call local inspection/generation |
| 11 | Desktop full song package flow | Pending | Desktop UI can generate a full local Clone Hero song folder |
| 12 | Future symbolic inputs | Pending | MusicXML/MXL research/import if useful |

## Validated MIDI-first baseline

The current validated baseline uses the Eat My Dust demo.

Known local paths:

```txt
MIDI:  /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mid
Audio: /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mp3
Output: /Users/jonfdz/Projects/clone-hero-drum-generator/output/demo
```

Known generation command:

```bash
pnpm chdg generate /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mid --track 53 --audio-source /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mp3 --out /Users/jonfdz/Projects/clone-hero-drum-generator/output/demo
```

Confirmed behavior:

```txt
notes.chart opens in Moonscraper
song.ogg loads
ExpertDrums exists
yellow hihats display as cymbals
green crashes display as cymbals
open hi-hat is represented as yellow cymbal + yellow accent
ghost/accent modifiers are encoded
no N 5/orange lane issue is expected
```

Known manual adjustment:

```txt
The demo needed manual start/offset adjustment in Moonscraper.
Offset support is deferred to a future phase.
```

## Demo source policy

The original Stairway to Heaven demo exposed useful edge cases but is not a good main validation sample because drums enter very late.

The main local validation demo is:

```txt
Eat My Dust — Dead Pony
MIDI drum track: 53
Tempo: 147 BPM
Time signature: 4/4
Drum hits: 1039
Unknown notes: none
```

Do not commit copyrighted MIDI/audio/GP files unless licensing is explicitly safe. Local samples can remain ignored while documented as validation fixtures.

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
- `packages/midi`: MIDI reading, inspection, normalization and MIDI section extraction.
- `packages/guitarpro`: GPIF reading, inspection and future normalization.
- `packages/mappings`: mapping data and functions.
- `packages/chart`: `notes.chart` and `song.ini` writers.
- `packages/audio`: audio preparation via system ffmpeg.
- `packages/validation`: validation rules and reports.
- `packages/project`: future orchestration for full song package generation.
