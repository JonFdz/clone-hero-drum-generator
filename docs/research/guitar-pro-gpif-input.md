# Guitar Pro / GPIF Input Research

## Summary

Guitar Pro / GPIF is a strong future deterministic input candidate for CHDG, especially when songs are sourced from Songsterr/Guitar Pro workflows.

Modern `.gp` files inspected during research were ZIP-like containers with:

```txt
Content/score.gpif
```

The `score.gpif` file is XML and contains useful symbolic chart data.

## Why GPIF matters

Compared with exported MIDI, GPIF may preserve more musical/charting semantics:

- track identity;
- `InstrumentSet.Type = drumKit`;
- drum articulations;
- sections;
- accents;
- grace notes / flams;
- multiple percussion tracks;
- clearer cymbal/tom intent.

This makes GPIF potentially better than MIDI as a future source of truth, while remaining deterministic.

## Observed examples

### Stairway-style file

Observed characteristics:

- one clear drumKit track;
- explicit drum articulations;
- accents;
- grace notes / flam information;
- sections;
- GPIF data that could be normalized into `DrumHit[]`.

### Granite-style file

Observed characteristics:

- multiple drumKit/percussion tracks;
- primary drums plus synth drums plus claps/snaps;
- percussion articulations such as china, splash, ride bell, hand clap;
- highlights the need for future multi-track drum merge rules.

### Eat My Dust demo

Observed characteristics:

- GP and MIDI align well;
- one clear drums track;
- good future GPIF import fixture;
- current MIDI export is sufficient for the MVP.

## Recommended future GPIF phases

### GPIF-01 — Inspect GPIF

Add:

```bash
pnpm chdg -- inspect-gp song.gp
```

Output should include:

- GP version;
- title/artist metadata;
- tracks;
- drumKit tracks;
- sections;
- tempo/time signatures;
- drum articulation counts;
- possible warnings.

### GPIF-02 — Normalize selected GP drum track

Add:

```bash
pnpm chdg -- normalize-gp-drums song.gp --track <index>
```

Output should become `DrumHit[]`, just like MIDI normalization.

### GPIF-03 — Generate from GPIF

Add either extension-aware `generate` or a separate command:

```bash
pnpm chdg -- generate song.gp --track <index> --out output/song
```

### GPIF-04 — Multi-track drum merge

Support cases like modern songs with:

- primary drums;
- synth drums;
- claps/snaps;
- auxiliary percussion.

Example future API:

```bash
pnpm chdg -- generate song.gp --tracks 5,6,7 --out output/song
```

## Mapping concerns

Future GPIF import must decide how to map non-standard or auxiliary articulations:

- sidestick;
- hand clap;
- china;
- splash;
- ride bell;
- synth drums;
- layered snare/clap events.

Do not solve all of these in the first GPIF phase. Start with inspection and selected-track normalization.

## Non-goals

- No Songsterr scraping.
- No direct PDF/OMR import.
- No audio transcription.
- No bypassing `DrumHit[]`.
- No direct dependence on Guitar Pro desktop software.
