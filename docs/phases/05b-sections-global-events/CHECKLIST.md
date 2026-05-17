# Checklist Phase 05B: Sections and Global Events

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/implementation/implementation-plan.md`.
- [x] Read `docs/research/sections-and-global-events.md`.
- [x] Read this phase PRD.
- [x] Read this phase ADR.
- [x] Inspect current core/chart/midi files.

## Implementation

- [x] Add `SongSection` to core types.
- [x] Add `sections` to the chart/domain model.
- [x] Update chart writer to emit `[Events]` section lines.
- [x] Ensure existing charts without sections still write valid `[Events]`.
- [x] Extract MIDI marker/text/cue meta-events.
- [x] Filter `MEASURE_*` markers.
- [x] Filter `END_OF_VOICE`.
- [x] Import semantic markers as sections.
- [x] Deduplicate sections by tick/name.
- [x] Add inspect output for sections or section candidates.
- [x] Keep GPIF section import out of scope.

Note: `@tonejs/midi` remains the high-level parser for notes, tempo, and time-signature data. `midi-file` is used only for focused raw marker/text/cue meta-event extraction.

## Tests

- [x] Chart writer outputs a section event.
- [x] Chart writer escapes/handles section names safely.
- [x] Empty sections preserve current behavior.
- [x] MIDI meta extractor reads marker/text/cue events.
- [x] Semantic markers become sections.
- [x] `MEASURE_*` markers do not become sections.
- [x] Current demo MIDI style marker list produces no semantic sections.
- [x] Duplicate section markers are deduplicated.

## Validation

- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes.
- [ ] Manual `.chart` output can be opened in Moonscraper if validated.

Local demo validation completed: `inspect-midi` reports `Sections: none`; `generate` writes valid empty `[Events]`, `song.ini` references `song.ogg`, and `song.ogg` exists.
- [x] No copyrighted MIDI/audio committed.

## Deferred

- [ ] GPIF section extraction.
- [ ] Desktop section editor.
- [ ] Automatic section detection from audio.
