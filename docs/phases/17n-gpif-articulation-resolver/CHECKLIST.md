# Checklist — Phase 17N — GPIF Articulation Resolver

## Preparation

- [x] Read `AGENTS.md`.
- [x] Read Phase 17N docs.
- [x] Read Phase 17N OpenSpec.
- [x] Transfer accepted OpenSpec decisions into Engram before implementation.
- [x] Confirm Engram is the source of truth.
- [x] Inspect current GPIF parsing/normalization code.
- [x] Inspect Phase 17L atlas APIs.
- [x] Inspect Phase 17M Source Review mapping row UI/model.

## Implementation

- [x] Add GPIF articulation resolver.
- [x] Define resolver result fields.
- [x] Prefer project overrides.
- [x] Resolve by `OutputMidiNumber` through 17L atlas.
- [x] Add controlled `Name` pattern fallback.
- [x] Add `InputMidiNumbers` fallback only when output/name are unavailable.
- [x] Add conflict detection.
- [x] Preserve 17L `map/candidate/ignore/unknown` semantics.
- [x] Preserve project overrides.
- [x] Emit enriched GPIF mapping rows.
- [x] Include useful `reason`, `confidence`, `sourceValue`, `noteName`, count, and first tick.
- [x] Keep MIDI behavior unchanged.
- [x] Avoid full UI redesign.

## Required decisions

- [x] Hi-Hat half input 92 output 46 maps to `hihat_open`.
- [x] Pedal Hi-Hat remains candidate `hihat_closed`.
- [x] Rimshot maps to `snare`.
- [x] Ride Bell maps to `ride`.
- [x] China/Splash map to `crash`.
- [x] Tambourine and other known auxiliary percussion are ignored known.
- [x] Candidate auxiliary percussion does not generate by default.
- [x] Conflict cases become candidate/review, not silent map.

## Tests

- [x] Unit tests for resolver output MIDI priority.
- [x] Unit tests for name-pattern fallback.
- [x] Unit tests for input MIDI fallback.
- [x] Unit tests for conflict handling.
- [x] Integration tests for GPIF normalization.
- [x] Source Review mapping row tests if model fields change.
- [x] Regression tests for existing MIDI behavior.
- [x] Override tests for GPIF articulation rows.

## Validation

- [x] Run package tests for `@chdg/guitarpro`.
- [x] Run package tests for `@chdg/project` if touched.
- [x] Run desktop model tests if touched.
- [x] Run TypeScript checks allowed by `AGENTS.md`.
- [x] Run `pnpm test` if allowed.
- [x] Record all command outputs in `EVIDENCE.md`.
- [x] Manually validate Decode-like case if possible.

## Out of scope guard

- [x] No Preview changes.
- [x] No Generate screen redesign.
- [x] No tempo-map changes.
- [x] No aggressive profile.
- [x] No automatic candidate generation.
- [x] No UI polish pass beyond necessary row data.
