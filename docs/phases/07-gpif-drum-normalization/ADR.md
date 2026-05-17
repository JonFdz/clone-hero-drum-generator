# ADR Phase 07: GPIF Drum Normalization

## Status

Implemented for first conservative normalization.

## Context

Phase 06 added inspection-only GPIF support. Phase 07 needs the first `.gp -> GPIF -> selected drum track -> DrumHit[]` path while preserving the architecture boundary that `apps/cli` orchestrates and `packages/guitarpro` owns GPIF parsing/normalization.

## Decision

Add `normalizeGpDrums` / `normalizeGpDrumsXml` in `packages/guitarpro` and a thin CLI command:

```bash
pnpm chdg normalize-gp-drums <file.gp> --track <index>
```

The command requires explicit `--track`. Invalid indexes fail clearly. Non-drum selected tracks warn but still attempt normalization because real GPIF metadata may be incomplete.

## Mapping heuristics

Mapping is intentionally conservative. It first uses GPIF note fields such as `Name`, `Type`, `Element`, `Articulation`, `Instrument`, and related display/sound names. When GPIF notes only expose percussion MIDI numbers, it falls back to standard MIDI drum-number heuristics for the same target pieces.

Supported heuristics:

- `kick`, `bass drum`, `bd` -> `kick`
- `snare` -> `snare`
- `side stick`, `sidestick`, `rimshot`, `cross stick` -> `snare` with warning
- `open hi-hat`, `open hihat`, `hihat open` -> `hihat_open`
- `closed hi-hat`, `closed hihat`, bare `hi-hat`/`hihat` -> `hihat_closed`
- `crash` -> `crash`
- `ride` -> `ride`
- high/rack tom variants -> `tom_high`
- mid/middle tom variants -> `tom_mid`
- floor/low tom variants -> `tom_floor`
- MIDI drum numbers: `35/36` kick, `37/38/40` snare, `42/44` closed hi-hat, `46` open hi-hat, `49/52/55/57` crash, `51/53/59` ride, `48/50` high tom, `45/47` mid tom, `41/43` floor tom

Unknown articulations are aggregated in the normalization result and CLI report. They do not crash normalization.

## Timing behavior and limitations

Normalization uses GPIF PPQ/resolution when recognizable and defaults to `960` PPQ otherwise. It computes deterministic ticks for supported linear `Bar -> Voice -> Beat -> Note` structures using explicit tick/position fields when available, otherwise sequential beat durations.

Unsupported timing structures such as repeat expansion and alternate endings are not expanded in this phase. The implementation reports repeat/alternate-ending-like structures as unhandled. It also reports missing/unrecognized measure or beat durations when it falls back to deterministic defaults (`4/4` measures and quarter-note beats) instead of pretending exact timing was available.

## Velocity and dynamics

Default velocity is stable at `95`.

Explicit numeric velocity is clamped to MIDI-style `1..127`. Recognized dynamics map as:

| GPIF dynamic | Velocity |
|---|---:|
| `pp` | 35 |
| `p` | 50 |
| `mp` | 65 |
| `mf` | 80 |
| `f` | 100 |
| `ff` | 115 |

## Consequences

Positive:

- GPIF can now feed CHDG's shared `DrumHit[]` model.
- The CLI can validate real local `.gp` samples without generating output files.
- Unknowns remain visible for future mapping refinement.

Negative:

- GPIF schema coverage is intentionally incomplete.
- Real files with reference-heavy or repeat-heavy timing may need later expansion work.
