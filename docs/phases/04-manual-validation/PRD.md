# PRD Phase 04: Manual Validation

    ## Final result

    A repeatable manual checklist exists for validating generated charts in Moonscraper and Clone Hero.

    ## Why this phase exists

    This phase creates a concrete, reviewable step toward the full MIDI-to-Clone-Hero drum chart pipeline. It must remain small enough to validate before the next phase begins.

    ## Scope

    - Create manual validation checklist
- Define expected lane checks
- Define tempo/sync checks
- Define mismatch recording template
- Define accepted/rejected criteria

    ## Non-goals

    - Automated validation implementation
- Chart generation changes

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

    - Checklist can be followed by a human
- Mismatches can be recorded and turned into mapping/code tasks

    ## Definition of done

    - Final result is achieved.
    - Docs are updated.
    - `pnpm build` passes.
    - `pnpm typecheck` passes.
    - Manual validation is completed when applicable.
