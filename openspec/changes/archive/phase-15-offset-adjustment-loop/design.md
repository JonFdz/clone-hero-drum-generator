# Design: Phase 15 — Offset Adjustment Loop

## Overview

Phase 15 adds an in-app loop for previewing and applying chart offset.

It builds on Phase 14A audio/timeline preview and Phase 14B highway preview.

## Architecture

Recommended split:

```txt
apps/desktop/src/app/services
  DesktopPreviewService
  offset preview state/helpers

apps/desktop/src/app/pages/preview
  chart offset controls
  live preview application

apps/desktop/electron
  narrow chart offset update IPC handler

packages/project or packages/chart
  pure helper for updating notes.chart [Song] Offset, if useful
```

## State model

Use:

```ts
type OffsetPreviewState = {
  savedOffsetMs: number;
  previewOffsetMs: number;
  isDirty: boolean;
  errorMessage?: string;
};
```

Exact names can follow repo style.

## Preview timing

Apply preview offset visually.

Recommended helper:

```ts
effectivePreviewTime(noteSeconds, previewOffsetMs): number
```

The sign convention must match generated `notes.chart` `Offset`.

Add tests documenting:

```txt
offsetMs -> offsetSeconds
effective note timing in preview
```

## Chart update

Implement a narrow chart update function.

Recommended behavior:

```txt
read notes.chart
find [Song] section
replace existing Offset line
or insert Offset if missing
write chart back
preserve all other lines
```

Validation:

```txt
chart path basename must be notes.chart
chart path must belong to allowed output folder
offsetMs must be finite
```

Do not expose generic file writes.

## Project save

When applying offset:

```txt
update DesktopGenerateState offsetMs
mark project dirty as appropriate
persist through existing .chdg save flow
update generated notes.chart if output exists
```

If only preview offset changes, do not write files.

## UI

Add a card/section near preview controls.

Required UI:

```txt
Chart Offset
saved offset
preview offset
delta
quick nudge buttons
manual ms input
reset/revert
apply/save
status/error message
```

Use wording that explains:

```txt
This changes notes.chart [Song] Offset.
It does not move notes or modify audio.
```

## Validation integration

Invalid offset input should show UI error and disable apply.

Validation page should continue to surface invalid offset if project state becomes invalid.

## Testing

Prefer pure helper tests:

```txt
ms to seconds formatting
update chart Offset existing
insert chart Offset missing
does not change note/event ticks
preview timing shift
reset/apply state transitions
invalid offset rejected
```

Component tests are optional if setup is expensive.

## Scope guard

Do not implement:

```txt
automatic offset detection
note editing
mapping overrides
packaging
full UX polish
```
