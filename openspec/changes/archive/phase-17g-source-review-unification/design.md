# Design: Phase 17G — Source Review Unification

## Goals

- Present source inspection, track selection, normalization preview, mapping review, and issues as a single Source Review screen.
- Hide internal pipeline complexity from the user.
- Avoid requiring audio or output folder on Source Review.
- Avoid manual inspect/normalize buttons as required flow steps.
- Persist valid analysis results so reopening a project does not re-analyze unnecessarily.
- Preserve existing generation behavior and keep Generate/Validate unification out of scope.

## Non-goals

- No Generate + Validation unification.
- No note editing.
- No add/remove individual notes.
- No section creation/editing.
- No manual merge strategy UI.
- No `.chdg` bundle/archive conversion.
- No embedding source/audio/cover into `.chdg`.
- No network/URL/scraping/upload workflow.
- No new dependency unless explicitly justified.
- Do not commit OpenSpec artifacts unless Jon explicitly decides to keep them in the repo.

## User-facing route and navigation

Add:

```txt
/source-review
```

Sidebar should show:

```txt
Home
Projects
New Project
Source Review
Generate
Validation
Preview
Settings
```

Remove from sidebar:

```txt
Inspect Source
Track Selection
Mapping
```

Recommended compatibility redirects:

```txt
/inspect-source -> /source-review
/track-selection -> /source-review
/mapping -> /source-review
```

Update existing internal links:

- Project Details action: `Review Source` -> `/source-review`.
- Generate Back action -> `/source-review`.
- Validation tracks/chart fix actions -> `/source-review`.
- Source/project input fix actions should prefer `/projects/details`.

## Screen structure

Use the existing CHDG desktop visual language: dark background, subtle card borders, purple accent, compact badges, and left sidebar. The target mockups are:

```txt
docs/desktop/mockups/11-source-review.png
docs/desktop/mockups/11a-source-review-expanded.png
```

### Default/collapsed state

Visible sections:

- Source Review header.
- Selected Source card.
- Source Summary card.
- Combined Summary card.
- Piece Summary Preview card.
- Track Candidates table.
- Mapping Review collapsed card.
- Issues & Warnings collapsed card.
- Back to Project Details.
- Continue to Generate.

### Expanded/attention state

Visible sections after expansion/scroll:

- Mapping Review expanded table.
- Active Overrides Summary.
- Profile Actions.
- Issues & Warnings expanded with warnings and unknowns.

## Component plan

Visual components, or equivalent clearly separated template sections:

```txt
SourceReviewPageComponent
SourceReviewHeaderComponent
SourceReviewSelectedSourceCardComponent
SourceSummaryCardComponent
TrackCandidatesTableComponent
CombinedSummaryCardComponent
PieceSummaryPreviewComponent
MappingReviewAccordionComponent
MappingOverridesTableComponent
ActiveOverridesSummaryComponent
MappingProfilesCompactComponent
IssuesWarningsPanelComponent
AdvancedJsonPanelComponent
SourceReviewBottomActionsComponent
```

Non-visual components/models:

```txt
SourceReviewOrchestratorService
SourceReviewCacheModel
ChdgProjectAnalysisCache validation/model
```

It is acceptable to combine tiny visual components if readability is preserved. Track Candidates, Mapping Review, Mapping Table, Issues, and orchestration should remain testable and understandable.

## Source Review orchestration

Source Review is conceptually one process, even though implementation still uses inspect + normalize.

### Valid cache entry

When opening Source Review with a valid cache:

1. Load cached inspection and normalization preview from `.chdg`.
2. Do not call inspect or normalize.
3. Show `Source review up to date`.

### No valid cache entry

When opening Source Review without a valid cache:

1. Show analyzing state.
2. Inspect source.
3. Select exactly one strongest candidate if selected tracks are missing for this source.
4. Normalize selected track(s).
5. Show ready state.
6. Autosave when possible.

### Source changes

When source changes:

1. Invalidate complete analysis cache.
2. Reset manual selected tracks.
3. Inspect new source.
4. Select exactly one strongest candidate.
5. Normalize.
6. Autosave when possible.

### selectedTracks changes

When the user selects/deselects tracks:

1. Preserve the manual selection.
2. Re-normalize automatically.
3. Update Combined Summary, Piece Summary, Mapping Review, and Issues.
4. Autosave when possible.

### mappingOverrides changes

When overrides/profile application changes mappingOverrides:

1. Re-normalize automatically.
2. Update summaries, mapping rows, and issues.
3. Keep mapping expanded if review is required.
4. Autosave when possible.

## Race and loop protection

The implementation must not rely on an unguarded Angular `effect()` that can loop indefinitely.

Use one or more of:

```txt
runId
operation key
last analyzed key
last normalized key
stale result discard
debounce for rapid mapping/track changes
```

Async results from stale inspect/normalize calls must not overwrite newer state.

## Cache and `.chdg` persistence

Add a complete, optional analysis cache to `.chdg`.

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

Add to project file:

```ts
analysis?: ChdgProjectAnalysisCache;
```

Validation rules:

- Projects without `analysis` remain valid.
- Malformed analysis cache must not block project open.
- Invalid cache should be ignored/dropped safely.
- Source fingerprint mismatch invalidates the complete cache.
- Mapping fingerprint mismatch invalidates the normalization preview but may reuse inspection.

## Fingerprints

Use:

```txt
source fingerprint = path + sizeBytes + mtimeMs
mapping fingerprint = stable deterministic serialization/hash of mappingOverrides
selectedTracks key = selectedTracks sorted ascending
```

No full file hash in this phase.

Electron main should provide file metadata or calculate fingerprints through a narrow safe path. Do not add a generic renderer file-read capability.

## Autosave

Autosave whenever possible:

- after successful first Source Review;
- after selectedTracks changes and normalization succeeds;
- after mapping changes and normalization succeeds.

If no `projectFilePath` exists, keep analysis in memory and persist during normal save.

Autosave failure must not block user flow. Show only a small non-blocking warning if needed.

Analysis cache autosave alone should not make the project appear dirty. Real project changes such as sourcePath, selectedTracks, mappingOverrides, metadata, audio, output, or offset should still mark project dirty/needs-regenerate according to existing conventions.

## Data mapping to UI

### Source Summary

Show:

```txt
Source Type
Resolution (PPQ)
Tempo Count
Time Signatures
Sections
Total Tracks
```

Sections show either:

```txt
9 detected
None detected
```

No section editor in this phase.

### Track Candidates

Columns:

```txt
checkbox
Track
Name
Notes
Confidence
Status
```

Do not show `Role` column.

Confidence is derived from current domain strength values. The current domain supports `strong`, `weak`, and `unknown`; do not invent unsupported states unless the domain is explicitly changed.

Status examples:

```txt
Auto-selected
Available
Selected
```

### Combined Summary

Show:

```txt
Selected Tracks
Combined Hits
Duplicates Removed
Unknowns
Warnings
```

### Piece Summary Preview

Show counts for:

```txt
Kick
Snare
Hi-Hat Closed
Hi-Hat Open
Crash
Ride
Toms
```

### Mapping Review

Collapsed by default when clean. Show summary:

```txt
Automatic mapping ready
X mapped sources · Y unknown · Z overrides
Profile: None / profile name
```

Expand or show attention when unknowns/overrides/review-worthy issues exist.

### Mapping table

Columns:

```txt
Source Kind
Source Value
Detected Meaning
Current Mapping
Override
Status
```

Override options include:

```txt
Keep Current
Ignore
Map to Kick
Map to Snare
Map to Hi-Hat Closed
Map to Hi-Hat Open
Map to Crash
Map to Ride
Map to Tom High
Map to Tom Mid
Map to Tom Floor
```

### Issues & Warnings

Collapsed when clean. Expanded attention state includes warnings and unknowns. Rows should include a `Review in Mapping Review` action where appropriate.

### Advanced JSON

Read-only, advanced action. It may show:

```txt
Inspection JSON
Normalization JSON
Analysis Cache Metadata
```

No editing.
