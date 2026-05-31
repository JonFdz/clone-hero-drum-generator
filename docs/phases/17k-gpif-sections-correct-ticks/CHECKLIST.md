# Checklist — Phase 17K

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read this phase docs.
- [ ] Read OpenSpec change package.
- [ ] Transfer accepted OpenSpec to Engram before implementation.
- [ ] Stop if any required file is missing.

## Implementation

- [ ] Locate current GPIF section extraction path.
- [ ] Confirm why sections currently default to tick `0`.
- [ ] Reuse GPIF timeline bar start ticks.
- [ ] Convert marker/section bar positions to ticks.
- [ ] Preserve section names.
- [ ] Do not change tempo-map behavior.
- [ ] Do not change note timing behavior.
- [ ] Do not change Preview behavior.

## Tests

- [ ] Add unit test for GPIF marker at bar `8` -> tick `30720`.
- [ ] Add unit test for GPIF marker at bar `48` -> tick `184320`.
- [ ] Add Decode-like section fixture/regression.
- [ ] Add generated chart assertion for `[Events]` with non-zero ticks.
- [ ] Ensure existing Phase 17I tempo-map tests still pass.

## Validation

- [ ] `pnpm test`
- [ ] `pnpm --filter @chdg/guitarpro build`
- [ ] `pnpm --filter @chdg/project build`
- [ ] `pnpm chdg --help`

## Manual validation

- [ ] Generate Decode-like chart.
- [ ] Confirm `[Events]` sections are not all at `0`.
- [ ] Confirm section ticks match expected bar positions.
- [ ] Confirm tempo map still contains expected events.
- [ ] Confirm notes still align as before.
