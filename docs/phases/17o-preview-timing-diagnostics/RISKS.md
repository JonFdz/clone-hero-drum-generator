# Risks — Phase 17O — Preview Timing Diagnostics

## Risk 1 — False positives on valid constant-tempo songs

A song with one BPM can be perfectly valid.

Mitigation:

- Single BPM in long songs is info only.
- Do not mark as warning.

## Risk 2 — Preview becomes too noisy

Too many diagnostics can overwhelm the user.

Mitigation:

- Use compact summary.
- Separate info/warning/error visually.
- Put detailed tables in expandable sections if needed.

## Risk 3 — Source analysis stale or unavailable

Cached source analysis may be missing or stale.

Mitigation:

- Do not silently recompute from Preview.
- Show `SOURCE_COMPARISON_UNAVAILABLE` when missing.
- If existing fingerprint freshness logic is available, respect it.

## Risk 4 — Inconsistent parser behavior

Preview parser, Generate summary, and tests could diverge.

Mitigation:

- Prefer a shared pure parser/diagnostics module.
- Avoid duplicating chart parsing logic.

## Risk 5 — Changing writer ordering breaks snapshots

Ordering SyncTrack by tick may change expected chart text output.

Mitigation:

- Update tests deliberately.
- Verify semantics remain unchanged.
- Ensure TS before B at same tick.

## Risk 6 — Treating missing TS too strongly

Some tools/charts may omit TS and still work with implicit 4/4.

Mitigation:

- Use moderate severity.
- Explain fallback/assumption if applicable.

## Risk 7 — BPM comparison tolerance

Floating point BPM values may round differently.

Mitigation:

- Use ±0.001 BPM tolerance for source-vs-generated comparison.

## Risk 8 — Generated chart sections include duplicate/sanitized names

Section names may be sanitized or deduped by writer.

Mitigation:

- Compare section names after trimming and lowercasing.
- Keep section mismatch severity lower than tempo mismatch.
