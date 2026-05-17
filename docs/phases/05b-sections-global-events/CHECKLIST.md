# Checklist Phase 05B: Sections and Global Events

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/implementation/implementation-plan.md`.
- [ ] Read `docs/research/sections-and-global-events.md`.
- [ ] Read this phase PRD.
- [ ] Read this phase ADR.
- [ ] Inspect current core/chart/midi files.

## Implementation

- [ ] Add `SongSection` to core types.
- [ ] Add `sections` to the chart/domain model.
- [ ] Update chart writer to emit `[Events]` section lines.
- [ ] Ensure existing charts without sections still write valid `[Events]`.
- [ ] Extract MIDI marker/text/cue meta-events.
- [ ] Filter `MEASURE_*` markers.
- [ ] Filter `END_OF_VOICE`.
- [ ] Import semantic markers as sections.
- [ ] Deduplicate sections by tick/name.
- [ ] Add inspect output for sections or section candidates.
- [ ] Keep GPIF section import out of scope.

## Tests

- [ ] Chart writer outputs a section event.
- [ ] Chart writer escapes/handles section names safely.
- [ ] Empty sections preserve current behavior.
- [ ] MIDI meta extractor reads marker/text/cue events.
- [ ] Semantic markers become sections.
- [ ] `MEASURE_*` markers do not become sections.
- [ ] Current demo MIDI style marker list produces no semantic sections.
- [ ] Duplicate section markers are deduplicated.

## Validation

- [ ] `pnpm build` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] Manual `.chart` output can be opened in Moonscraper if validated.
- [ ] No copyrighted MIDI/audio committed.

## Deferred

- [ ] GPIF section extraction.
- [ ] Desktop section editor.
- [ ] Automatic section detection from audio.
