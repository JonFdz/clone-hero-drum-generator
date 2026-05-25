# Components: Source Review

## Final component list

Visual components:

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

Non-visual services/models:

```txt
SourceReviewOrchestratorService
SourceReviewCacheModel
ChdgProjectAnalysisCache model
```

Do not create separate Drum Candidates, Tempo & Sections, or Merge Rules cards in this phase.

## Page layout

### Desktop / large window

```txt
Header
Selected Source card
Top summary row:
  Source Summary | Combined Summary | Piece Summary Preview
Main row:
  Track Candidates table
Mapping Review accordion
Issues & Warnings accordion
Bottom actions:
  Back to Project Details | Continue to Generate
```

### Medium window

```txt
Header
Selected Source card
Source Summary
Combined Summary
Piece Summary Preview
Track Candidates table
Mapping Review
Issues & Warnings
Bottom actions
```

### Small window

```txt
Single column
Tables use horizontal scroll
Piece summary wraps to 2 columns
Primary action full width
```

## SourceReviewPageComponent

Container component for `/source-review`.

Responsibilities:

- render page layout;
- initialize Source Review orchestration;
- pass state to child components;
- navigate to `/generate`;
- show no-source state when sourcePath is missing.

Should not hold most business logic directly.

## SourceReviewHeaderComponent

Header area.

Text:

```txt
Source Review
Review detected drum tracks, normalized preview, and mapping before generation.
```

Status examples:

```txt
Source review up to date
Analyzing source…
Updating preview…
Review needs attention
Source review failed
```

## SourceReviewSelectedSourceCardComponent

Top full-width card.

Fields:

```txt
Selected Source
file icon
file name
source kind badge
file path
last analyzed
review status
```

Actions:

```txt
Refresh Analysis
View JSON
more/options menu if needed
```

No audio or output folder fields here.

## SourceSummaryCardComponent

Compact source summary.

Fields:

```txt
Source Type
Resolution (PPQ)
Tempo Count
Time Signatures
Sections
Total Tracks
```

Sections display:

```txt
9 detected
None detected
```

No section editor in this phase.

## CombinedSummaryCardComponent

Normalization summary.

Fields:

```txt
Selected Tracks
Combined Hits
Duplicates Removed
Unknowns
Warnings
```

Examples:

```txt
Selected Tracks: 1
Combined Hits: 9,177
Duplicates Removed: 1,326 (14.4%)
Unknowns: 0 (0.0%)
Warnings: 0 issues
```

Display loading copy while normalization is running:

```txt
Building normalized preview…
Updating preview…
```

## PieceSummaryPreviewComponent

Visual piece count summary.

Items:

```txt
Kick
Snare
Hi-Hat Closed
Hi-Hat Open
Crash
Ride
Toms
```

Each item shows:

```txt
icon
label
count
```

Responsive:

- large: one row;
- medium: wrap;
- small: 2 columns.

## TrackCandidatesTableComponent

Primary track selection table.

Columns:

```txt
checkbox
Track
Name
Notes
Confidence
Status
```

Do not include Role column.

Rows contain:

```txt
selected checkbox
track index
track name or Untitled
note count or n/a
confidence badge
status text/badge
```

Status examples:

```txt
Auto-selected
Available
Selected
Low confidence
```

Behavior:

- source new/no selection: select exactly one strongest track;
- user changes selection: preserve manual selection;
- selectedTracks changes trigger automatic normalization;
- source changes reset selection and choose strongest again.

## MappingReviewAccordionComponent

Compact by default.

Collapsed content:

```txt
Mapping Review
Automatic mapping ready / Manual review recommended
X mapped sources · Y unknown · Z overrides
Profile: None / profile name
Review Mapping button
```

Auto-expand when:

- unknown/unmapped sources > 0;
- active overrides > 0;
- manual review is recommended;
- profile apply conflict/error;
- user clicks Review Mapping.

## MappingOverridesTableComponent

Shown inside expanded Mapping Review.

Columns:

```txt
Source Kind
Source Value
Detected Meaning
Current Mapping
Override
Status
```

Source Kind values:

```txt
MIDI
GPIF
```

Override options:

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

Behavior:

- changing override updates project mappingOverrides;
- mappingOverrides changes trigger automatic normalization;
- autosave when possible;
- no individual note editing.

## ActiveOverridesSummaryComponent

Shown inside expanded Mapping Review.

Metrics:

```txt
Total Overrides
Mappings Changed
Ignored Sources
Unknown Sources / Special Rules
```

No destructive clear-all action unless implemented with confirmation.

## MappingProfilesCompactComponent

Shown inside expanded Mapping Review.

Compact state:

```txt
Profile Actions (Local Only)
No profile applied
Profiles are stored locally on this machine and are not synced.
Save as Profile
Apply Profile
```

Expanded/list state may show:

```txt
Profile name
Description
Override count
Updated at
Apply
Update from current
Edit metadata
Delete
```

Applying a profile changes mappingOverrides and triggers automatic normalization.

## IssuesWarningsPanelComponent

Compact by default.

Clean state:

```txt
Issues & Warnings · 0 warnings · 0 issues · All good
```

Attention state:

```txt
Issues & Warnings · 7 warnings · 6 unknowns · Review recommended
```

Expanded sections:

```txt
Warnings
Unknowns
Errors
```

Each row:

```txt
severity icon
message
optional action: Review in Mapping Review
```

## AdvancedJsonPanelComponent

Read-only debug/advanced panel.

Suggested tabs/sections:

```txt
Inspection JSON
Normalization JSON
Analysis Cache Metadata
```

No editing.

## SourceReviewBottomActionsComponent

Bottom actions.

Buttons:

```txt
Back to Project Details
Continue to Generate
```

`Continue to Generate` enabled when:

- sourcePath exists;
- selectedTracks length > 0;
- normalizationPreview exists;
- no blocking source review error.

Do not require audio or output folder here.
