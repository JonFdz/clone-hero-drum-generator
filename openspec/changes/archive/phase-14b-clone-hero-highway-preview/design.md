# Design: Phase 14B — Clone Hero Highway Preview

## Overview

Phase 14B adds a read-only Clone Hero-style highway view to the Preview page.

It builds on Phase 14A audio/timeline preview.

## Architecture

Recommended split:

```txt
apps/desktop/src/app/services
  DesktopPreviewService
  highway model/helpers

apps/desktop/src/app/pages/preview
  highway component/section
  lane rendering
  note rendering

apps/desktop/electron
  reuse existing chart/audio preview bridge
```

Avoid adding new filesystem access unless needed. Prefer existing Phase 14A preview data.

## Highway model

Recommended model:

```ts
type HighwayLane = "kick" | "red" | "yellow" | "blue" | "green";

type HighwayNote = {
  id: string;
  lane: HighwayLane;
  atSeconds: number;
  yPercent: number;
  visible: boolean;
  cymbal?: boolean;
  open?: boolean;
  accent?: boolean;
  ghost?: boolean;
};
```

Exact names can follow repo style.

## Time window

Render notes in a lookahead window relative to current audio time.

Example:

```txt
visible when atSeconds is between currentTime - 0.25s and currentTime + 3.0s
hit line corresponds to currentTime
notes move toward/past hit line as currentTime advances
```

Add a simple note speed/lookahead constant or control if useful.

## Lane mapping

Base chart notes:

```txt
0 -> kick
1 -> red
2 -> yellow
3 -> blue
4 -> green
```

Modifier notes should decorate base notes at the same tick/time.

Modifier chart notes:

```txt
66 -> yellow cymbal
67 -> blue cymbal
68 -> green cymbal
34 -> red accent
35 -> yellow accent
36 -> blue accent
37 -> green accent
40 -> red ghost
41 -> yellow ghost
42 -> blue ghost
43 -> green ghost
```

If a modifier appears without a matching base note, ignore it or surface a non-blocking preview limitation.

## Data requirements

Phase 14A `ChartPreviewData` may need to be extended to retain modifier notes or grouped notes by tick.

Do so carefully and keep the structure narrow.

Avoid generic chart file reads.

## UI

Highway should include:

```txt
lane labels
hit line
moving/positioned notes
modifier visual styling
limited state message
```

Do not implement gameplay, scoring, streaks, or fail states.

## Read-only

The highway is a preview only.

No drag/drop.

No adding/removing notes.

No persisted offset adjustment.

## Testing

Prefer pure helper tests:

```txt
chart notes -> highway notes
modifiers grouped with base notes
visible window calculation
current time positioning
limited fallback states
```

Component tests are optional if current setup makes them expensive.

## Scope guard

Do not implement:

```txt
Phase 15 offset loop
note editor
mapping overrides
packaging
full visual polish
```
