# PRD Phase 06: Tempo Map and Sync

    ## Final result

    MIDI tempo and time-signature events are preserved in notes.chart SyncTrack.

    ## Why this phase exists

    This phase creates a concrete, reviewable step toward the full MIDI-to-Clone-Hero drum chart pipeline. It must remain small enough to validate before the next phase begins.

    ## Scope

    - Read all tempo events
- Read time signatures
- Write multiple BPM events
- Preserve tick positions
- Warn if no tempo exists

    ## Non-goals

    - Audio beat detection
- Manual tempo editing UI

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

    - MIDI with tempo changes generates multiple B events
- Moonscraper shows tempo changes
- Notes remain aligned to MIDI ticks

    ## Definition of done

    - Final result is achieved.
    - Docs are updated.
    - `pnpm build` passes.
    - `pnpm typecheck` passes.
    - Manual validation is completed when applicable.
