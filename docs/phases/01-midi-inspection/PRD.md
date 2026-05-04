# PRD Phase 01: MIDI Inspection

    ## Final result

    The CLI can inspect a MIDI file and print useful information for mapping and validation.

    ## Why this phase exists

    This phase creates a concrete, reviewable step toward the full MIDI-to-Clone-Hero drum chart pipeline. It must remain small enough to validate before the next phase begins.

    ## Scope

    - Add MIDI parser dependency
- Read MIDI PPQ/resolution
- Read tracks and names
- Read channels
- Read tempo events
- Read time signatures
- Aggregate note numbers and velocities
- Guess drum pieces using mapping JSON

    ## Non-goals

    - Generate notes.chart
- Normalize to final chart model
- UI

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

    - `pnpm chdg -- inspect-midi samples/demo.mid`
- Output shows note counts and velocity stats
- Unknown notes are visible
- No chart files are generated

    ## Definition of done

    - Final result is achieved.
    - Docs are updated.
    - `pnpm build` passes.
    - `pnpm typecheck` passes.
    - Manual validation is completed when applicable.
