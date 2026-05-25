# ADR: Source Review Unification

## Status

Proposed

## Context

CHDG Desktop currently has separate screens for Inspect Source, Track Selection, and Mapping. This matches internal implementation boundaries but creates unnecessary user-facing friction.

The existing code already has the required domain data and desktop bridge calls:

- source inspection;
- selected tracks;
- normalization preview;
- mapping candidates;
- project mapping overrides;
- mapping profiles.

The missing pieces are:

- a unified Source Review UI;
- automatic orchestration;
- durable analysis cache in `.chdg`;
- route/navigation cleanup.

## Decision

Add a single Source Review route:

```txt
/source-review
```

Replace the sidebar entries:

```txt
Inspect Source
Track Selection
Mapping
```

with:

```txt
Source Review
```

Keep compatibility redirects from old routes to `/source-review` if practical.

## Analysis cache

Persist a complete cache in `.chdg` so CHDG does not re-run inspection/normalization unless needed.

Proposed shape:

```ts
type ChdgProjectAnalysisCache = {
  schemaVersion: 1;
  sourceFingerprint: {
    path: string;
    sizeBytes?: number;
    mtimeMs?: number;
  };
  mappingFingerprint: string;
  selectedTracks: number[];
  inspectedAt: string;
  normalizedAt?: string;
  inspection: SourceInspectionResult;
  normalizationPreview?: NormalizationPreview;
};
```

Add this to `ChdgProjectFile` as:

```ts
analysis?: ChdgProjectAnalysisCache;
```

Validation must be defensive:

- old projects without `analysis` remain valid;
- malformed analysis cache is ignored or dropped safely;
- invalid analysis cache must not prevent a project from opening.

## Fingerprints

Use lightweight fingerprints in this phase:

```txt
source fingerprint = path + sizeBytes + mtimeMs
mapping fingerprint = stable deterministic serialization/hash of mappingOverrides
selected tracks key = sorted selectedTracks
```

No full file hash in this phase.

## Orchestration

Add a testable orchestration layer. Avoid putting async orchestration directly in component effects.

Recommended implementation:

```txt
SourceReviewOrchestratorService
SourceReviewCacheModel
```

Responsibilities:

- determine cache validity;
- inspect source when required;
- select exactly one strongest track for a new source;
- normalize selected tracks when required;
- respond to selectedTracks changes;
- respond to mapping changes;
- autosave analysis cache when possible;
- avoid loops/races.

Race protection is required:

```txt
Use runId / operation id / normalized input key.
Discard stale async results.
```

## Default track decision

For a new source or no saved selectedTracks:

```txt
Select exactly one strongest candidate.
```

Do not auto-select multiple complementary tracks. Multi-track selection is manual.

## Mapping decision

Mapping Review is collapsed by default because mapping is usually automatic.

Expand automatically only when attention is useful:

- unknown/unmapped source candidates;
- active overrides;
- profile conflict/error;
- manual review recommended;
- explicit user click.

## Route decisions

Required updates:

- add `/source-review`;
- update sidebar nav;
- update Project Details primary action from Inspect Source to Review Source;
- update Generate back route from `/track-selection` to `/source-review`;
- update Validation fix routes for tracks/chart from `/track-selection` to `/source-review`;
- update source/input fix routes from `/new-project` to `/projects/details` where appropriate.

## Consequences

Positive:

- simpler UX;
- less unnecessary user action;
- faster project reopen due to cached analysis;
- mapping stays available without dominating the flow.

Risks:

- async auto-run loops;
- stale cache if fingerprints are wrong;
- selectedTracks accidentally overwritten;
- cache writes marking projects dirty unnecessarily;
- old routes/tests breaking.

Mitigations:

- pure cache model tests;
- orchestrator tests;
- defensive `.chdg` validation;
- compatibility redirects;
- do not overwrite manual selectedTracks unless source changes;
- distinguish technical cache autosave from real user edits.
