# PRD: Clone Hero Drum Generator (CHDG)

## Product summary

CHDG generates Clone Hero-compatible drum charts from MIDI and, later, other transcription sources.

## Problem

Manual Clone Hero drum charting is slow. Drum MIDI often already contains timing, note identity and velocity, but it still needs mapping, conversion and validation before it becomes a playable Clone Hero chart.

## Target user

A chart creator who has a drum MIDI/transcription and wants a fast, reviewable first pass for Clone Hero Pro Drums.

## Goals

1. Inspect drum MIDI files.
2. Convert MIDI notes into an internal drum model.
3. Generate `notes.chart` with `[ExpertDrums]`.
4. Generate a minimal `song.ini`.
5. Preserve enough information for future Pro/Elite-like features.
6. Keep mappings configurable.
7. Validate output in Moonscraper and Clone Hero.

## Non-goals for now

- No frontend until CLI generation works.
- No lower difficulties.
- No automatic audio transcription.
- No copyrighted MIDI/audio committed.
- No Moonscraper automation.

## Success criteria

CHDG is useful when a user can run:

```bash
pnpm chdg -- inspect-midi samples/demo.mid
pnpm chdg -- generate samples/demo.mid --out output/demo
```

and then open `output/demo/notes.chart` in Moonscraper and Clone Hero as `ExpertDrums`.
