# PRD Phase 05: Pro Drums Flags

    ## Final result

    Generated charts encode cymbal/tom distinction and velocity-based ghost/accent behavior.

    ## Why this phase exists

    This phase creates a concrete, reviewable step toward the full MIDI-to-Clone-Hero drum chart pipeline. It must remain small enough to validate before the next phase begins.

    ## Scope

    - Encode cymbal flags for yellow/blue/green
- Encode ghost notes
- Encode accent notes
- Make velocity thresholds configurable
- Prevent ghost and accent conflicts
- Document exact chart encoding

    ## Non-goals

    - Elite mode export
- Lower difficulties
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

    - Moonscraper displays cymbals as cymbals
- Ghost/accent notes display correctly
- Generated chart remains loadable
- Threshold behavior can be adjusted

    ## Definition of done

    - Final result is achieved.
    - Docs are updated.
    - `pnpm build` passes.
    - `pnpm typecheck` passes.
    - Manual validation is completed when applicable.
