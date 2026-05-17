# ADR 0007: Prioritize GPIF as the Next Deterministic Input

## Status

Accepted

## Context

CHDG was initially designed as MIDI-first. That remains correct for the MVP because MIDI parsing, normalization and chart generation already work.

However, the intended source workflow is increasingly Songsterr/Guitar Pro oriented. Real `.gp` files inspected during research were modern Guitar Pro files containing:

```txt
Content/score.gpif
```

This GPIF content is XML and can be inspected deterministically.

The inspected files showed that GPIF may preserve information that MIDI exports can flatten or lose:

- clear track identity;
- `InstrumentSet.Type = drumKit`;
- drum articulations such as crash, ride, china, splash, hi-hat open/closed;
- explicit accents;
- grace notes / flams;
- sections;
- multiple drum/percussion tracks.

## Decision

CHDG remains MIDI-first for the current MVP, but GPIF-based `.gp` files become the next priority deterministic input after the current MIDI flow is stable.

The future GPIF pipeline must convert to the same intermediate model as MIDI:

```txt
GPIF
  -> GP source inspection
  -> GP drum event normalization
  -> DrumHit[]
  -> Clone Hero drum note model
  -> notes.chart / song.ini
```

No GPIF path should bypass `DrumHit[]`.

## Scope of initial GPIF support

Initial support should target modern `.gp` files that contain:

```txt
Content/score.gpif
```

Unsupported Guitar Pro formats should fail clearly with guidance:

```txt
This Guitar Pro file is not GPIF-based or is not supported yet.
Try exporting it to MIDI from Guitar Pro, MuseScore, TuxGuitar or Songsterr if available.
```

## Non-goals

- No Songsterr scraping.
- No PDF/OMR import.
- No automatic audio-to-chart transcription.
- No full support for every Guitar Pro historical format in the first GP phase.
- No direct GP-to-chart writer that bypasses shared models.

## Consequences

Positive:

- Better future fidelity for Songsterr/Guitar Pro sources.
- GPIF may preserve articulations and sections useful for Pro Drums.
- Works with deterministic user-provided files instead of audio inference.

Negative:

- GPIF parsing is more complex than MIDI.
- Multiple drumKit tracks may require user selection or merge rules.
- Different `.gp`/`.gp5`/`.gpx` formats may need separate handling.
