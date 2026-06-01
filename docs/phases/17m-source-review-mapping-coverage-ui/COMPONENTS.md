# Components — Phase 17M

## Existing relevant areas

Likely files:

```txt
apps/desktop/src/app/pages/source-review/source-review-page.component.ts
apps/desktop/src/app/pages/mapping/mapping-page.model.ts
apps/desktop/src/app/services/source-review-model.ts
apps/desktop/src/app/services/source-review-model.test.ts
```

Potentially:

```txt
apps/desktop/src/app/pages/source-review/source-review-page.component.scss
apps/desktop/src/app/pages/source-review/components/*
```

Exact structure should follow the repo.

## Suggested component/model structure

### Mapping row view model

Create or extend a row view model that contains UI-ready information.

Suggested shape:

```ts
type MappingReviewFilter =
  | "needs-review"
  | "candidates"
  | "unknown"
  | "ignored-known"
  | "auto-mapped"
  | "overrides"
  | "all";

type MappingReviewRowKind =
  | "auto-mapped"
  | "candidate"
  | "ignored-known"
  | "unknown"
  | "override";

type MappingReviewRowView = {
  key: string;
  sourceKind: "midi" | "gpif";
  sourceValue: string;
  title: string;
  subtitle?: string;
  action?: "map" | "candidate" | "ignore" | "unknown";
  kind: MappingReviewRowKind;
  badgeLabel: string;
  badgeTone: "success" | "review" | "info" | "warning" | "accent" | "neutral";
  noteName?: string;
  automaticPiece?: string;
  suggestedPiece?: string;
  currentMappingLabel: string;
  count?: number;
  firstTick?: number;
  confidence?: string;
  family?: string;
  reason?: string;
  hasOverride: boolean;
  overrideLabel?: string;
  unresolved: boolean;
  unresolvedType?: "candidate" | "unknown";
};
```

Names may vary, but semantics must be equivalent.

### Classification helpers

Prefer pure functions in `source-review-model.ts` or a nearby UI model file.

Required concepts:

```ts
classifyMappingRow(row, overrides)
filterMappingRows(rows, filter, overrides)
defaultMappingFilter(rows, overrides)
mappingReviewCounts({ rows, overrides })
mappingAttentionState({ rows, overrides })
```

Phase 17L already introduced `mappingReviewCounts` and `mappingAttentionState`. Reuse/extend them rather than duplicating logic in the component.

### Filters

Represent filters as data:

```ts
const MAPPING_REVIEW_FILTERS = [
  { id: "needs-review", label: "Needs review" },
  { id: "candidates", label: "Candidates" },
  { id: "unknown", label: "Unknown" },
  { id: "ignored-known", label: "Ignored known" },
  { id: "auto-mapped", label: "Auto-mapped" },
  { id: "overrides", label: "Overrides" },
  { id: "all", label: "All" },
] as const;
```

Each filter should show a count if straightforward.

### Quick actions

Existing `setOverride(row, value)` can be reused.

Add wrapper methods if useful:

```ts
applySuggestion(row): Promise<void>
ignoreRow(row): Promise<void>
mapRow(row, piece): Promise<void>
resetOverride(row): Promise<void>
```

These should call existing override state update mechanisms.

### Piece selector

Use the existing supported pieces:

```txt
kick
snare
hihat_closed
hihat_open
crash
ride
tom_high
tom_mid
tom_floor
```

Display labels should match existing `pieceLabel(...)` behavior.

### Row action rules

#### Candidate with suggestedPiece

Show:

- Apply suggestion
- Ignore
- Map to... / More

#### Candidate without suggestedPiece

Show:

- Map to...
- Ignore

#### Unknown

Show:

- Map to...
- Ignore

#### Ignored known

Show:

- Keep ignored
- Map to...

#### Auto-mapped

Show:

- Keep default
- Override / Map to...
- Ignore

#### Override

Show:

- current override;
- Reset override.

### Old `/mapping` page

Review route usage before editing/removing.

If clearly dead:

- remove dead route/component or remove dead model;
- ensure no imports break.

If still live:

- do not remove it in Phase 17M;
- prefer shared model functions to avoid divergent behavior.

## Styling requirements

Use existing CHDG style:

- dark surface;
- soft rounded cards;
- compact spacing;
- readable badges;
- no large redesign of Source Review page.

Badges:

- Candidate: review/amber-like tone.
- Unknown: warning/danger tone.
- Ignored known: muted/info.
- Auto-mapped: success/neutral.
- Override: accent.

Do not rely on color alone; use text labels too.

## Empty states

### No rows

Show a calm message:

```txt
No mapping sources detected for the selected track.
```

### Filter with zero rows

Show:

```txt
No rows match this filter.
```

### All resolved

Show:

```txt
All mapping decisions are resolved.
```

## Accessibility

- Buttons must have accessible text.
- Select/dropdown must have labels or `aria-label`.
- Do not use clickable divs without keyboard support.
- Use existing Angular patterns.
