# PRD Phase 00: Project Foundation

    ## Final result

    The repository has a clean pnpm TypeScript monorepo structure, package boundaries, CLI placeholder, AGENTS.md and documentation base.

    ## Why this phase exists

    This phase creates a concrete, reviewable step toward the full MIDI-to-Clone-Hero drum chart pipeline. It must remain small enough to validate before the next phase begins.

    ## Scope

    - Root package and workspace config
- apps/cli placeholder
- packages for core/midi/mappings/chart/validation
- AGENTS.md
- gitignore for samples/output

    ## Non-goals

    - MIDI parsing
- Chart generation
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

    - `pnpm install`
- `pnpm build`
- `pnpm typecheck`
- `pnpm chdg -- --help`

    ## Definition of done

    - Final result is achieved.
    - Docs are updated.
    - `pnpm build` passes.
    - `pnpm typecheck` passes.
    - Manual validation is completed when applicable.
