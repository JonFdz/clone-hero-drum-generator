# Evidence — Phase 17M

Use this file to record implementation and validation evidence.

## Implementation notes

- Added Source Review mapping review helpers for row classification, filter semantics, default filter selection, row display labels, and override-aware state.
- Replaced the dense Source Review mapping table with compact card/list rows, filter chips, category badges, educational copy, count/first tick metadata, and quick actions.
- Preserved existing project mapping override persistence/regeneration flow by routing Apply suggestion, Ignore, Map to, and Reset override through the existing mapping-changed path.
- Left the old `/mapping` route redirected to Source Review; no risky route cleanup was performed.

## Screenshots / visual evidence

Recommended screenshots:

1. Mapping Review collapsed with unresolved candidates.
2. Mapping Review expanded with `Needs review` filter.
3. Candidate row with Apply suggestion.
4. Unknown row with Map to / Ignore.
5. Ignored known row.
6. Auto-mapped row.
7. Row after override.
8. Empty/no rows or no filter matches state.

## Manual validation checklist

- [ ] MIDI with 44 Pedal Hi-Hat shows candidate, suggested Closed Hi-Hat, Apply suggestion.
- [ ] Applying suggestion creates override and row becomes resolved.
- [ ] MIDI with 54 Tambourine appears ignored known and does not look like an error.
- [ ] MIDI with unknown note appears in Unknown and Needs review.
- [ ] Ignoring unknown removes strong pending state.
- [ ] Auto-mapped kick/snare/hihat rows show default mapping.
- [ ] Auto-mapped row can be ignored.
- [ ] Reset override restores default state.
- [ ] Filters work.
- [ ] Default filter is Needs review when pending rows exist.
- [ ] Default filter is All when no pending rows exist.
- [ ] Source Review profiles still behave as before.
- [ ] Generate behavior unchanged.
- [ ] Preview behavior unchanged.

## Automated validation

```bash
pnpm exec vitest run apps/desktop/src/app/services/source-review-model.test.ts apps/desktop/src/app/pages/mapping/mapping-page.component.test.ts
# PASS: 2 files, 23 tests

pnpm test
# PASS: 57 files, 474 tests

pnpm exec vitest run apps/desktop/src/app/services/source-review-model.test.ts
# PASS: 1 file, 21 tests

pnpm exec tsc -p apps/desktop/tsconfig.json --noEmit
# PASS

pnpm lint
# PASS: workspace lint scripts are placeholders / not configured yet
```

Not run: `pnpm --filter @chdg/desktop typecheck` because it invokes `ng build`, and `AGENTS.md` says never build after changes.

## Follow-up pass — PR #67 row density and semantics

### Implementation notes

- Refined Mapping Review rows into a three-zone desktop layout: identity, decision/reasoning, and badge/actions.
- Added compact primary/meta labels to avoid duplicated source text such as `GPIF GPIF articulation` and repeated note names.
- Made auto-mapped `Ignore` visually secondary and kept default/override as the baseline interaction.
- Removed redundant `Ignore` action for default ignored-known rows.
- Separated open behavior from warning styling: override-only resolved rows can open Mapping Review without showing warning attention.

### Automated validation

```bash
pnpm exec vitest run apps/desktop/src/app/services/source-review-model.test.ts
# PASS: 1 file, 22 tests

pnpm exec tsc -p apps/desktop/tsconfig.json --noEmit
# PASS

pnpm test
# PASS: 57 files, 475 tests

pnpm lint
# PASS: workspace lint scripts are placeholders / not configured yet
```

Manual screenshot validation was not performed in this agent environment.
