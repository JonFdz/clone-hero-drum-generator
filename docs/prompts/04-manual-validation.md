# Prompt Phase 04: Manual Validation

        Read:

        - `AGENTS.md`
        - `docs/implementation/implementation-plan.md`
        - `docs/phases/04-manual-validation/PRD.md`
        - `docs/phases/04-manual-validation/ADR.md`
        - `docs/phases/04-manual-validation/CHECKLIST.md`

        Implement Phase 04: Manual Validation.

        ## Goal

        A repeatable manual checklist exists for validating generated charts in Moonscraper and Clone Hero.

        ## Scope

        - Create manual validation checklist
- Define expected lane checks
- Define tempo/sync checks
- Define mismatch recording template
- Define accepted/rejected criteria

        ## Non-goals

        - Automated validation implementation
- Chart generation changes

        ## Architecture constraints

        - Keep CLI orchestration thin.
        - Put domain logic in the appropriate `packages/*` package.
        - Do not hardcode mappings in `apps/cli`.
        - Do not add frontend code unless this is the web planning phase.
        - Do not commit copyrighted MIDI/audio.
        - Update docs when behavior changes.

        ## Validation

        - Checklist can be followed by a human
- Mismatches can be recorded and turned into mapping/code tasks

        ## Finish by running

        ```bash
        pnpm build
        pnpm typecheck
        ```
