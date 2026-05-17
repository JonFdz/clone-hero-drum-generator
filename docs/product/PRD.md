# PRD: Clone Hero Drum Generator (CHDG)

## Product summary

CHDG generates Clone Hero-compatible drum charts from deterministic symbolic inputs.

Current primary input:

- MIDI (`.mid` / `.midi`)

Planned deterministic inputs:

- Guitar Pro / GPIF-based `.gp`
- Later: MusicXML / MXL, if it proves useful

CHDG is now desktop-first: the intended product is a local desktop application that runs on the user's PC, with a CLI kept for automation, testing and agent-driven implementation.

## Product direction

CHDG should remain deterministic.

The tool should not infer charts from audio. Instead, it should convert already-authored symbolic sources into Clone Hero/YARG-compatible outputs.

Primary flow:

```txt
MIDI or GPIF input
  -> source inspection
  -> normalized DrumHit[]
  -> Clone Hero drum note model
  -> notes.chart + song.ini
  -> audio packaging
  -> Moonscraper / Clone Hero validation
```

Target desktop flow:

```txt
User selects:
  - .mid or .gp
  - audio source (.mp3/.wav/.flac/.ogg)
  - drum track(s)
  - metadata

CHDG generates:
  - notes.chart
  - song.ini
  - song.ogg
  - optional ZIP/folder output
```

## Problem

Manual Clone Hero drum charting is slow. Many songs already have symbolic drum information available as MIDI exports or Guitar Pro/Songsterr-style files. These sources often contain timing, note identity, track structure and sometimes extra notation such as articulations, accents, sections or grace notes.

CHDG should turn those deterministic sources into a reviewable Clone Hero drum chart package.

## Target user

A chart creator who has or can obtain a deterministic symbolic transcription, especially:

- MIDI exported from Guitar Pro, Songsterr, MuseScore or similar tools;
- GPIF-based `.gp` files from Guitar Pro/Songsterr workflows;
- later, MusicXML/MXL exports where available.

## Goals

1. Inspect drum MIDI files.
2. Convert MIDI notes into an internal drum model.
3. Generate `notes.chart` with `[ExpertDrums]`.
4. Generate `song.ini`.
5. Package audio as `song.ogg` for local Moonscraper/Clone Hero validation.
6. Preserve enough information for future Pro/Elite-like features.
7. Keep mappings configurable.
8. Validate output in Moonscraper and Clone Hero.
9. Add GPIF-based `.gp` inspection/import as a first-class deterministic input after the MIDI flow is stable.
10. Build toward a desktop app where frontend and backend run locally on the user's PC.

## Non-goals for now

- No automatic audio-to-chart transcription.
- No STRUM/Demucs/PyTorch-style inference pipeline in the MVP.
- No scraping of Songsterr or other tab sites.
- No direct PDF/OMR pipeline until deterministic symbolic inputs are mature.
- No copyrighted MIDI/audio committed to the repository.
- No Moonscraper automation.
- No cloud processing requirement for the main product.

## Success criteria

CHDG is useful when a user can run, from CLI:

```bash
pnpm chdg -- inspect-midi samples/demo.mid
pnpm chdg -- normalize-drums samples/demo.mid --track 53
pnpm chdg -- generate samples/demo.mid --track 53 --out output/demo --audio song.ogg
```

and then open `output/demo/notes.chart` in Moonscraper as `ExpertDrums`.

The desktop target is useful when a user can select a `.mid` or `.gp`, select an audio file, choose drum track(s), edit metadata and generate a complete local song folder.
