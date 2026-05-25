# PRD: Source Review Unification

## Problem

Desktop currently exposes three separate user-facing steps for what users perceive as one activity:

- Inspect Source;
- Track Selection;
- Mapping.

This reflects the implementation model, not the end-user mental model. A user wants to choose a source file, review what CHDG detected, optionally adjust track/mapping choices, then continue to Generate.

## Product decision

Create a single desktop screen named **Source Review**.

```txt
Route: /source-review
Sidebar label: Source Review
Primary next step: Generate
```

Remove the separate user-facing navigation items:

```txt
Inspect Source
Track Selection
Mapping
```

The old routes may redirect to `/source-review` for compatibility, but the product should not present them as separate steps.

## User goals

A user should be able to:

1. Open Source Review and have CHDG automatically analyze the selected source.
2. See a compact source summary.
3. See which track CHDG selected by default.
4. Add/remove selected tracks manually if needed.
5. See combined normalization/piece summary update automatically.
6. Ignore mapping unless there is an issue or they explicitly open it.
7. Review warnings/unknowns only when relevant.
8. Continue to Generate.

## Non-goals

- Source Review must not require audio.
- Source Review must not require output folder.
- Source Review must not perform generation.
- Source Review must not validate final output.
- Source Review must not edit individual notes.
- Source Review must not create/edit sections.
- Source Review must not expose manual merge strategy controls.
- Source Review must not introduce network, URL, YouTube, scraping, or server upload flows.

## Primary workflow

### First entry with a valid source and no valid cache

1. User enters `/source-review`.
2. CHDG shows an analyzing state.
3. CHDG inspects the source automatically.
4. CHDG selects exactly one default track: the strongest candidate.
5. CHDG normalizes the selected track automatically.
6. CHDG displays Source Review ready state.
7. If a `.chdg` project file exists, CHDG autosaves the analysis cache.

### Entry with valid cache

1. User enters `/source-review`.
2. CHDG loads cached inspection + normalization preview from `.chdg`.
3. CHDG does not call inspect/normalize again.
4. CHDG displays `Source review up to date`.

### User changes track selection

1. User checks/unchecks tracks in Track Candidates.
2. Manual selection is preserved.
3. CHDG re-normalizes automatically.
4. UI updates Combined Summary, Piece Summary Preview, Mapping Review, and Issues.
5. If possible, CHDG autosaves.

### User changes mapping

1. User expands Mapping Review or it auto-expands due to unknown/unmapped sources.
2. User changes override or applies a profile.
3. CHDG re-normalizes automatically.
4. UI updates summaries/issues.
5. If possible, CHDG autosaves.

### User changes source

1. Source path/fingerprint changes.
2. Cached analysis is invalidated.
3. Manual selected tracks are cleared.
4. CHDG inspects the new source.
5. CHDG selects exactly one strongest track by default.
6. CHDG normalizes and autosaves if possible.

## Default track selection rule

Default selection must select **exactly one track**:

```txt
If no saved/manual selectedTracks exist for the current source, select the strongest drum candidate.
```

Do not auto-select multiple complementary tracks. Multi-track selection remains user-driven.

If no suitable candidate exists:

- select no track;
- show a non-blocking warning that no strong drum candidate was found;
- keep Continue to Generate disabled until at least one track is selected.

## Mapping behavior

Mapping is automatic by default and should not dominate the main screen.

Default state:

```txt
Mapping Review collapsed
```

Auto-expand Mapping Review when:

- unknown/unmapped sources exist;
- active overrides exist;
- manual review is recommended;
- profile apply conflict/error occurs;
- user clicks Review Mapping.

## Issues behavior

Issues & Warnings should be compact by default when there is nothing to review.

Clean state example:

```txt
0 warnings · 0 issues · All good
```

Attention state should show:

```txt
Review needs attention
Warnings
Unknowns
Review in Mapping Review actions
```

## Sections behavior

Source Review should show sections only as a summary value:

```txt
Sections: 9 detected
Sections: None detected
```

Section creation/editing is out of scope.

## Audio/output behavior

Audio and output folder must not appear as requirements in Source Review. They remain Generate/Validation concerns.

## Save behavior

Autosave whenever possible:

- after successful first analysis;
- after selectedTracks changes and normalization succeeds;
- after mapping changes and normalization succeeds.

If no project file path exists, keep state in memory and persist on normal project save.

Autosave failure must not block review/generation. Show a small non-blocking warning if needed.

## Visual target

Use the existing CHDG desktop visual language:

- dark background;
- left sidebar;
- purple accent;
- subtle borders;
- dense cards/tables;
- green/yellow/red status badges;
- compact desktop-native panels.

Reference:

- `docs/desktop/mockups/11-source-review.png`
- `docs/desktop/mockups/11a-source-review-expanded.png`
