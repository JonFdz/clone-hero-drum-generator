# OpenSpec Verify — 17O Preview Timing Diagnostics

## Automated verification

The implementation agent must discover exact project commands. Expected command categories:

```bash
pnpm test
pnpm typecheck
pnpm lint
```

If commands differ, record actual commands in `EVIDENCE.md`.

## Required unit scenarios

### Generated chart parser

- [ ] Parses resolution.
- [ ] Parses offset.
- [ ] Parses BPM events.
- [ ] Parses TS events.
- [ ] Decodes `TS 4 2` as `4/4`.
- [ ] Decodes `TS 6 3` as `6/8`.
- [ ] Parses section events.
- [ ] Computes note summary.
- [ ] Computes seconds across multiple tempo segments.

### Diagnostics

- [ ] No BPM events => `TIMING_NO_TEMPO_EVENTS`.
- [ ] Missing BPM at tick 0 => `TIMING_NO_INITIAL_TEMPO`.
- [ ] No TS => `TIMING_NO_TIME_SIGNATURES`.
- [ ] Missing TS at tick 0 => `TIMING_NO_INITIAL_TIME_SIGNATURE`.
- [ ] Duplicate BPM tick => `TIMING_DUPLICATE_TEMPO_TICK`.
- [ ] Duplicate TS tick => `TIMING_DUPLICATE_TS_TICK`.
- [ ] Unsorted SyncTrack => `TIMING_UNSORTED_SYNCTRACK`.
- [ ] Invalid BPM => `TIMING_INVALID_BPM`.
- [ ] BPM delta > 30 => info.
- [ ] BPM delta > 50 => warning.
- [ ] Single BPM long song => info only.
- [ ] Offset present => info only.

### Source comparison

- [ ] Source/generated tempo count mismatch.
- [ ] Source tempo missing in generated chart.
- [ ] Generated extra tempo.
- [ ] Source/generated TS count mismatch.
- [ ] Source section missing in generated chart.
- [ ] Source comparison unavailable.
- [ ] BPM tolerance ±0.001 works.

### Writer ordering

- [ ] SyncTrack output sorted by tick.
- [ ] Same tick writes TS before B.
- [ ] Existing chart semantics are unchanged.

## Manual verification

### Constant tempo chart

Expected:

- Timing panel shows one BPM.
- No warning for one BPM.
- If long enough, info only.

### Multi-tempo chart

Expected:

- Timing panel shows all BPM events.
- Times are plausible.
- No false fallback warning.

### Missing tempo chart fixture

Expected:

- Warning shown.
- Accurate timing unavailable.
- Preview fallback limitation is clear.

### Source/generated mismatch fixture

Expected:

- If source analysis has extra tempo event, generated missing event triggers warning.
- Message mentions possible tempo drift.

## Regression checks

- [ ] Preview still uses generated `notes.chart` and generated `song.ogg`.
- [ ] Section navigation still works.
- [ ] Generate still writes `notes.chart`, `song.ini`, `song.ogg`, and cover if provided.
- [ ] Mapping overrides still apply.
- [ ] Source Review is not triggered automatically by Preview.
- [ ] Offset remains non-warning.
