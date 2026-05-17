# Checklist Phase 07: GPIF Drum Normalization

## Implementation

- [x] Added `packages/guitarpro` GPIF drum normalization API.
- [x] Added conservative GPIF articulation mapping.
- [x] Supports `kick`, `snare`, `hihat_closed`, `hihat_open`, `crash`, `ride`, `tom_high`, `tom_mid`, `tom_floor`.
- [x] Reports unknown articulations without crashing.
- [x] Uses stable default velocity `95`.
- [x] Maps documented dynamics `pp p mp mf f ff` to deterministic velocities.
- [x] Extends `DrumHit.source` backwards-compatibly for GPIF traces.
- [x] Adds `normalize-gp-drums <file.gp> --track <index>` CLI command.
- [x] Requires explicit `--track`.
- [x] Invalid track indexes fail clearly.
- [x] Non-drum selected tracks warn but attempt normalization.
- [x] Does not write chart/audio/output files.

## Tests

- [x] Synthetic GPIF fixture normalizes supported drum hits.
- [x] Open hi-hat maps to `hihat_open`.
- [x] Closed hi-hat maps to `hihat_closed`.
- [x] Unknown articulations are reported.
- [x] Default velocity is stable.
- [x] Dynamic velocity mapping is covered.
- [x] Invalid track index fails clearly.
- [x] Non-drum selected track warning is covered.
- [x] Deterministic hit ordering is covered.
- [x] No copyrighted `.gp`, MIDI, or audio fixtures added.

## Validation

- [x] `pnpm build`
- [x] `pnpm typecheck`
- [x] `pnpm test`
- [x] Optional local `inspect-gp` sample validation
- [x] Optional local `normalize-gp-drums` sample validation

## Review policy

- [x] Scope remains normalization-only.
- [x] GPIF chart generation is not marked complete.
- [x] Final PR review remains external by Jon/ChatGPT.
- [x] PR must not be merged without Jon's approval.
