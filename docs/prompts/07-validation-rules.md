# Prompt Phase 07: Validation Rules

        Read:

        - `AGENTS.md`
        - `docs/implementation/implementation-plan.md`
        - `docs/phases/07-validation-rules/PRD.md`
        - `docs/phases/07-validation-rules/ADR.md`
        - `docs/phases/07-validation-rules/CHECKLIST.md`

        Implement Phase 07: Validation Rules.

        ## Goal

        The CLI reports chart conflicts and suspicious MIDI/mapping cases before or during generation.

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

        ## Architecture constraints

        - Keep CLI orchestration thin.
        - Put domain logic in the appropriate `packages/*` package.
        - Do not hardcode mappings in `apps/cli`.
        - Do not add frontend code unless this is the web planning phase.
        - Do not commit copyrighted MIDI/audio.
        - Update docs when behavior changes.

        ## Validation

        - Generate command prints warnings
- Warnings do not block output unless fatal
- Validation rules are unit-testable

        ## Finish by running

        ```bash
        pnpm build
        pnpm typecheck
        ```
