# Checklist Phase 10B: Multi-track Normalization / Generation

## Before implementation

- [x] Read `docs/desktop/README.md`.
- [x] Read `docs/desktop/decisions.md`.
- [x] Read `docs/desktop/mockup-corrections.md`.
- [x] Read this phase PRD.
- [x] Read this phase ADR.
- [x] Review visual references.
- [x] Read OpenSpec transfer artifacts for `phase-10b-multi-track-normalization-generation`.
- [x] Transfer accepted context, decisions, branch, validation, non-goals, and review policy to Engram.

## Implementation

- [x] Implement only this phase scope.
- [x] Preserve existing tests.
- [x] Add/update tests for new behavior.
- [x] Add `--tracks <csv>` while preserving `--track <index>`.
- [x] Reject `--track` and `--tracks` together.
- [x] Reject empty, duplicate, and non-integer `--tracks` values.
- [x] Support selected track arrays in `packages/project`.
- [x] Support MIDI and GPIF multi-track normalization through existing source normalizers.
- [x] Merge selected tracks into one `DrumHit[]` stream.
- [x] Deduplicate same tick + same piece and keep highest velocity.
- [x] Preserve source timing and velocity without averaging.
- [x] Resolve same-tick open/closed hi-hat conflicts with open hi-hat priority.
- [x] Warn on likely impossible hand chords without deleting notes.
- [x] Include structured `mergeSummary` for multi-track normalization/generation.
- [x] Keep JSON mode clean and parseable.
- [x] Keep human CLI output useful for multi-track generation/normalization.
- [x] Update docs if implementation differs.

## Validation

- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes after `pnpm build` refreshes workspace declaration output.
- [x] `pnpm test` passes.
- [x] Manual validation recorded: `pnpm --silent chdg generate samples/demo.gp --tracks 3,4 --audio-source samples/demo.mp3 --out output/demo-multitrack --json` produced parseable JSON with `selectedTracks: [3, 4]` and `mergeSummary`. The prompt's example `--tracks 3,10` is not valid for the local `samples/demo.gp` because only track indexes `0..4` exist, so complementary-track validation remains primarily synthetic.

## Notes

- Accent/normal/ghost merge priority is deferred to the current data model: pre-mapping `DrumHit` does not expose explicit accent/ghost flags, so duplicate strength is currently determined by velocity/duration/source tie-breakers.
- `mergeSummary` is emitted for multi-track selections; single-track compatibility fields (`selectedTrack`, hit counts, existing human output shape) remain available.
- For machine-readable CLI output through pnpm, use `pnpm --silent chdg ... --json` so pnpm wrapper output does not pollute stdout.

## Deferred

- [x] Do not implement future phases unless explicitly approved.
- [x] No Desktop Generate MVP.
- [x] No project persistence or `.chdg` read/write.
- [x] No mapping override UI.
- [x] No preview player.
- [x] No validation checklist UI.
- [x] No automatic simplifier.
