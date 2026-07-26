# Design — Phase 17M Source Review Mapping Coverage UI

## Architecture

Use existing Phase 17L data:

- `NormalizationPreview.mappingCandidates`
- `NormalizationPreview.mappingCoverage`
- `ProjectMappingOverrides`
- Source Review mapping semantic helpers

Build UI-ready rows from existing mapping candidates and overrides.

## Row classification

Classification must consider override first, then row action.

Suggested priority:

1. If override exists:
   - piece override -> override / mapped override
   - ignore override -> override / ignored override
2. Else if action is `unknown` -> unknown
3. Else if action is `candidate` -> candidate
4. Else if action is `ignore` -> ignored known
5. Else if action is `map` -> auto-mapped
6. Else legacy fallback:
   - `automaticPiece === "unknown"` or missing -> unknown
   - otherwise auto-mapped

## Unresolved state

A row is unresolved unknown when:

```txt
action unknown and no piece/ignore override
```

A row is unresolved candidate when:

```txt
action candidate and no piece/ignore override
```

Ignored known rows are not unresolved.

Auto-mapped rows are not unresolved.

Override rows are not unresolved.

## Filter model

Define filter ids:

```ts
type MappingReviewFilter =
  | "needs-review"
  | "candidates"
  | "unknown"
  | "ignored-known"
  | "auto-mapped"
  | "overrides"
  | "all";
```

Filter semantics:

- Needs review: unresolved candidates + unresolved unknowns.
- Candidates: all candidates.
- Unknown: all unknowns.
- Ignored known: all ignored known.
- Auto-mapped: all auto-mapped defaults.
- Overrides: rows with overrides.
- All: all rows.

## Default filter

If `unresolvedUnknown > 0 || unresolvedCandidates > 0`, default to `needs-review`.

Otherwise default to `all`.

Do not reset user-selected filter unnecessarily after the user changes it.

## Action model

Actions should reuse existing override mechanisms.

### applySuggestion(row)

Preconditions:

- `row.action === "candidate"`
- `row.suggestedPiece` exists

Effect:

```ts
override[row.key] = {
  sourceKind: row.sourceKind,
  key: row.key,
  target: { kind: "piece", piece: row.suggestedPiece }
}
```

Then call existing mapping changed/recompute behavior.

### ignoreRow(row)

Effect:

```ts
override[row.key] = {
  sourceKind: row.sourceKind,
  key: row.key,
  target: { kind: "ignore" }
}
```

### mapRow(row, piece)

Effect:

```ts
override[row.key] = {
  sourceKind: row.sourceKind,
  key: row.key,
  target: { kind: "piece", piece }
}
```

### resetOverride(row)

Effect:

```ts
delete override[row.key]
```

Then call existing mapping changed/recompute behavior.

## UI

Use compact list/card rows inside Source Review's Mapping Review section.

Top section:

- status badge;
- summary;
- atlas/source summary;
- short educational copy;
- filter chips.

Rows:

- source chip;
- name/title;
- badge;
- count;
- first tick;
- default/suggested/current mapping;
- confidence/reason where useful;
- actions.

## Styling

Follow existing CHDG styling.

Do not create new global design language.

Avoid making ignored known percussion red/orange.

## Testing strategy

Test pure helpers wherever possible.

Component tests are optional if existing repo patterns make them expensive.

Minimum tests:

- row classification;
- filter behavior;
- default filter;
- apply suggestion target model or handler;
- reset override;
- copy/status helpers if extracted.

## Compatibility

No compatibility with old flat mapping JSON is required by this phase.

No persisted project schema migration beyond existing Phase 17L fields should be required.

Existing `.chdg` projects without `mappingCoverage` must still load safely.
