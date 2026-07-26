# OpenSpec Tasks — Phase 17N — GPIF Articulation Resolver

## 1. Research current implementation

- [ ] Inspect `packages/guitarpro/src/inspectGpif.ts`.
- [ ] Inspect `packages/guitarpro/src/normalizeGpDrums.ts`.
- [ ] Inspect current GPIF tests.
- [ ] Inspect 17L MIDI atlas API.
- [ ] Inspect project normalization and mapping coverage types.
- [ ] Inspect Source Review mapping row model.

## 2. Model

- [ ] Add GPIF articulation resolver types.
- [ ] Add `resolvedVia` concept.
- [ ] Add optional `inputMidiNumbers` and `outputMidiNumber` row metadata where appropriate.
- [ ] Add versioning/fingerprint update if needed.

## 3. Resolver

- [ ] Implement output MIDI resolver.
- [ ] Implement name-pattern resolver.
- [ ] Implement input MIDI fallback resolver.
- [ ] Implement conflict detection.
- [ ] Implement reason/confidence output.
- [ ] Add stable GPIF articulation keys.

## 4. Normalization integration

- [ ] Use resolver in GPIF drum normalization.
- [ ] Preserve map/candidate/ignore/unknown semantics.
- [ ] Preserve overrides.
- [ ] Update mapping coverage rows for GPIF articulations.
- [ ] Ensure count and firstTick are maintained.

## 5. Tests

- [ ] Add `Hi-Hat (half)` input 92/output 46 test.
- [ ] Add Pedal Hi-Hat candidate test.
- [ ] Add Rimshot -> snare test.
- [ ] Add Ride Bell -> ride test.
- [ ] Add China/Splash -> crash tests.
- [ ] Add Tambourine -> ignore test.
- [ ] Add High Bongo -> candidate tom_high test.
- [ ] Add unknown custom articulation test.
- [ ] Add conflict tests.
- [ ] Add override tests.
- [ ] Add MIDI regression tests if shared code changes.

## 6. Documentation

- [ ] Update `EVIDENCE.md` with validation.
- [ ] Document any deferred GPIF cases.
- [ ] Update PR body with implementation summary.

## 7. Validation

- [ ] Run package tests.
- [ ] Run typechecks allowed by `AGENTS.md`.
- [ ] Run full tests if allowed.
- [ ] Manual validation if possible.
