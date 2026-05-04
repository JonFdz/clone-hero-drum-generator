# Checklist Phase 07: Validation Rules

    ## Before implementation

    - [ ] Read `AGENTS.md`.
    - [ ] Read `docs/implementation/implementation-plan.md`.
    - [ ] Read this phase PRD.
    - [ ] Read this phase ADR.
    - [ ] Inspect relevant files.

    ## Implementation

    - [ ] Unknown MIDI notes
- [ ] Same-lane tom/cymbal conflicts
- [ ] Duplicate same tick/lane notes
- [ ] Dense/impossible chords
- [ ] Missing tempo/time signature
- [ ] Suspicious velocities

    ## Validation

    - [ ] Generate command prints warnings
- [ ] Warnings do not block output unless fatal
- [ ] Validation rules are unit-testable

    ## Completion

    - [ ] `pnpm build` passes.
    - [ ] `pnpm typecheck` passes.
    - [ ] Docs updated if behavior changed.
    - [ ] No copyrighted MIDI/audio committed.
