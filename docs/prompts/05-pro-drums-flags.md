# Prompt Phase 05: Pro Drums Flags

        Read:

        - `AGENTS.md`
        - `docs/implementation/implementation-plan.md`
        - `docs/phases/05-pro-drums-flags/PRD.md`
        - `docs/phases/05-pro-drums-flags/ADR.md`
        - `docs/phases/05-pro-drums-flags/CHECKLIST.md`

        Implement Phase 05: Pro Drums Flags.

        ## Goal

        Generated charts encode cymbal/tom distinction and velocity-based ghost/accent behavior.

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

        ## Architecture constraints

        - Keep CLI orchestration thin.
        - Put domain logic in the appropriate `packages/*` package.
        - Do not hardcode mappings in `apps/cli`.
        - Do not add frontend code unless this is the web planning phase.
        - Do not commit copyrighted MIDI/audio.
        - Update docs when behavior changes.

        ## Validation

        - Moonscraper displays cymbals as cymbals
- Ghost/accent notes display correctly
- Generated chart remains loadable
- Threshold behavior can be adjusted

        ## Finish by running

        ```bash
        pnpm build
        pnpm typecheck
        ```
