# PRD Phase 08: Future Web UI

    ## Final result

    A web UI product/technical plan exists, but no frontend dependencies are added yet.

    ## Why this phase exists

    This phase creates a concrete, reviewable step toward the full MIDI-to-Clone-Hero drum chart pipeline. It must remain small enough to validate before the next phase begins.

    ## Scope

    - Plan upload screen
- Plan MIDI inspection screen
- Plan mapping editor
- Plan generation settings
- Plan validation report
- Plan export screen

    ## Non-goals

    - Building React/Vite app
- Design system implementation

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

    - UI plan references reusable packages
- No UI implementation is added
- No frontend dependency is added

    ## Definition of done

    - Final result is achieved.
    - Docs are updated.
    - `pnpm build` passes.
    - `pnpm typecheck` passes.
    - Manual validation is completed when applicable.
