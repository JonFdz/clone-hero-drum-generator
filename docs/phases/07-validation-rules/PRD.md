# PRD Phase 07: Validation Rules

    ## Final result

    The CLI reports chart conflicts and suspicious MIDI/mapping cases before or during generation.

    ## Why this phase exists

    This phase creates a concrete, reviewable step toward the full MIDI-to-Clone-Hero drum chart pipeline. It must remain small enough to validate before the next phase begins.

    ## Scope

    - Unknown MIDI notes
- Same-lane tom/cymbal conflicts
- Duplicate same tick/lane notes
- Dense/impossible chords
- Missing tempo/time signature
- Suspicious velocities

    ## Non-goals

    - Automatic correction of every issue
- Human-quality chart scoring

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

    - Generate command prints warnings
- Warnings do not block output unless fatal
- Validation rules are unit-testable

    ## Definition of done

    - Final result is achieved.
    - Docs are updated.
    - `pnpm build` passes.
    - `pnpm typecheck` passes.
    - Manual validation is completed when applicable.
