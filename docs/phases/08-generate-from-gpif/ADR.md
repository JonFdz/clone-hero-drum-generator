# ADR Phase 08: Generate from GPIF

## Status

Proposed.

## Context

CHDG now has two source normalization paths:

```txt
MIDI -> DrumHit[]
GPIF -> DrumHit[]
```

The chart writer and audio packaging pipeline already operate downstream of `DrumHit[]` / `CloneHeroDrumNote[]`.

To avoid duplicating generation logic, `.gp` generation should reuse the same downstream pipeline as MIDI.

## Decision

Extend the existing `generate` command to accept `.gp` input.

The command will detect source type:

```txt
.mid / .midi -> MIDI normalization path
.gp          -> GPIF normalization path
```

Then both paths converge on:

```txt
DrumHit[]
  -> Clone Hero Pro Drums mapping
  -> notes.chart
  -> song.ini
  -> song.ogg
```

## Rationale

Keeping one `generate` command is simpler for users and aligns with the product goal:

```txt
user provides symbolic source + audio -> CHDG generates song package
```

Adding a separate `generate-gp` command would create unnecessary duplication unless `.gp` generation diverges heavily later.

## Consequences

Positive:

- Users can generate from `.mid` or `.gp` with the same command.
- Downstream mapping/chart/audio code remains shared.
- Future desktop UI can call one generation workflow.
- MIDI behavior remains the baseline and regression target.

Negative:

- `generate` command needs source-type dispatch.
- Error messages must clearly distinguish MIDI vs GPIF failures.
- GPIF limitations from Phase 07 remain visible in generated output.

## Important decisions

- `--track` remains explicit and required for `.gp`.
- No automatic track selection in this phase.
- No GPIF chart generation path should bypass the shared `DrumHit[]` pipeline.
- No old binary GP3/GP4/GP5 support guarantee.
- No Songsterr scraping/downloading.
