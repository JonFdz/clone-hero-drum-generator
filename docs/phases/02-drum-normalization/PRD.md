# PRD Phase 02: Drum Normalization

    ## Final result

    MIDI note events are converted into normalized CHDG DrumHit objects.

    ## Why this phase exists

    This phase creates a concrete, reviewable step toward the full MIDI-to-Clone-Hero drum chart pipeline. It must remain small enough to validate before the next phase begins.

    ## Scope

    - Define or extend DrumHit types
- Map MIDI note numbers to DrumPiece
- Preserve tick, velocity, note number, channel and track
- Report unknown notes
- Keep pure functions testable

    ## Non-goals

    - Write Clone Hero files
- Tempo map export
- Frontend

    ## Where to apply changes

    - CLI orchestration: `apps/cli`
    - Shared model/timing: `packages/core`
    - MIDI behavior: `packages/midi`
    - Mapping behavior/data: `packages/mappings`
    - Chart writing: `packages/chart`
    - Validation: `packages/validation`
    - Documentation: `docs/`

    Only modify the folders relevant to this phase.

    ## Validation checklist

    - A debug command or inspection mode prints normalized hits
- Unknown notes are not silently dropped
- Mapping changes require only data/config updates

## Notes

Normalization operates on a **selected strong drum track**, not the whole MIDI file. If multiple strong tracks are detected, the user must pass `--track <index>` to select one explicitly.

## Definition of done

- Final result is achieved.
- Docs are updated.
- `pnpm build` passes.
- `pnpm typecheck` passes.
- Manual validation is completed when applicable.
