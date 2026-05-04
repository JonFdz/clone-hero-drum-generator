# Checklist Phase 05: Pro Drums Flags

    ## Before implementation

    - [ ] Read `AGENTS.md`.
    - [ ] Read `docs/implementation/implementation-plan.md`.
    - [ ] Read this phase PRD.
    - [ ] Read this phase ADR.
    - [ ] Inspect relevant files.

    ## Implementation

    - [ ] Encode cymbal flags for yellow/blue/green
- [ ] Encode ghost notes
- [ ] Encode accent notes
- [ ] Make velocity thresholds configurable
- [ ] Prevent ghost and accent conflicts
- [ ] Document exact chart encoding

    ## Validation

    - [ ] Moonscraper displays cymbals as cymbals
- [ ] Ghost/accent notes display correctly
- [ ] Generated chart remains loadable
- [ ] Threshold behavior can be adjusted

    ## Completion

    - [ ] `pnpm build` passes.
    - [ ] `pnpm typecheck` passes.
    - [ ] Docs updated if behavior changed.
    - [ ] No copyrighted MIDI/audio committed.
