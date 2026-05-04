# PRD Phase 03: First Chart Generation

    ## Final result

    The CLI generates notes.chart and song.ini with ExpertDrums from a MIDI file.

    ## Why this phase exists

    This phase creates a concrete, reviewable step toward the full MIDI-to-Clone-Hero drum chart pipeline. It must remain small enough to validate before the next phase begins.

    ## Scope

    - Implement generate command
- Read MIDI
- Normalize DrumHit objects
- Map hits to Clone Hero lanes
- Write notes.chart
- Write song.ini
- Create output directory

    ## Non-goals

    - Lower difficulties
- Advanced Pro Drums flags if not ready
- Web UI

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

    - `pnpm chdg -- generate samples/demo.mid --out output/demo`
- output/demo/notes.chart exists
- output/demo/song.ini exists
- Moonscraper opens chart
- Clone Hero detects ExpertDrums

    ## Definition of done

    - Final result is achieved.
    - Docs are updated.
    - `pnpm build` passes.
    - `pnpm typecheck` passes.
    - Manual validation is completed when applicable.
