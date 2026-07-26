# Design — Highway Preview v1

## 1. Baseline after Phase 19A

The merged Phase 19A implementation provides a Canvas-owned Preview component, perspective road, timing/projection/renderer helpers, a current five-parallel-lane spike model, feature-local mode/speed/HUD state, `ResizeObserver`, DPR-aware sizing, RAF cleanup and reduced-motion protection.

Phase 19B SHALL replace only the Highway visual topology. It does **not** change Clone Hero's base chart lane grammar:

```text
Generated Expert Drums base identifiers:
0 = kick
1 = red
2 = yellow
3 = blue
4 = green
```

The new visual topology is:

```text
Road lanes and target row: red | yellow | blue | green
Kick: orange horizontal rail across the road
```

This distinction is fundamental:

- **chart base lanes:** five raw identifiers (`0..4`);
- **visual pitched lanes:** four parallel columns (`1..4`);
- **kick:** a separate visual primitive, not a fifth column.

## 2. Architectural boundaries

### 2.1 Electron / generated chart boundary

`apps/desktop/electron/previewData.ts` remains the only Preview code that reads generated `notes.chart`.

It SHALL:

- parse every syntactically valid Expert Drums `N <lane> <length>` event;
- preserve valid base and modifier lane values as raw events;
- enrich each raw event with `length`, `seconds` and `endSeconds`;
- compute `endSeconds` from `tick + length` using the same generated chart timing model used for `seconds`;
- retain existing timing diagnostics and limitations.

It SHALL NOT:

- read source MIDI/GPIF to fill semantics;
- mutate `notes.chart`;
- decide UI shape, lane center or Canvas styling;
- add runtime dependency or external tool integration.

### 2.2 Desktop bridge boundary

`DesktopBridgeService` owns the Angular type contract.

```ts
export type ChartPreviewNoteEvent = {
  tick: number;
  lane: number;
  length: number;
  seconds: number;
  endSeconds: number;
};

export type ChartPreviewData = {
  // all existing fields remain unchanged
  noteEvents: ChartPreviewNoteEvent[];
};
```

Rules:

- Existing consumers may ignore `length` and `endSeconds`.
- No new IPC operation is needed.
- Tests/fixtures must use complete event objects or a shared fixture builder.
- The bridge does not expose a UI-specific four-lane abstraction; it transports raw generated-chart events.

### 2.3 Preview feature boundary

All semantic interpretation and drawing remains feature-owned:

```text
apps/desktop/src/app/features/preview/
  components/preview-highway/
  highway/
    highway-model.ts
    highway-note-semantics.ts
    highway-projection.ts
    highway-renderer.ts
    highway-timing.ts
```

| Module | Responsibility |
|---|---|
| `highway-model.ts` | Visual topology types, four pitched lane styles, kick-rail style, presets and frame models. |
| `highway-note-semantics.ts` | Pure grouping of raw chart events into semantic base notes and supported modifier flags. |
| `highway-projection.ts` | Four-lane road geometry, interval visibility, pitched-head projection, kick-rail projection and tail projection. |
| `highway-renderer.ts` | Imperative Canvas drawing only, with no Angular state mutation. |
| `highway-timing.ts` | Existing tick/seconds, beat/measure and timing-validity behavior. |
| `PreviewHighwayComponent` | Inputs, lifecycle, resize/RAF coordination, frame preparation and stable accessibility text. |
| `PreviewPageComponent` | Existing transport ownership and feature-local mode/speed/HUD/seek epoch state. |

No presentation component may access the Electron bridge directly. No renderer/helper may mutate Angular signals, project state or chart data.

## 3. Raw event parser and duration model

### 3.1 Parsed event

```ts
type ParsedExpertDrumsEvent = {
  tick: number;
  lane: number;
  length: number;
};
```

Parsing requirements:

- accept only non-negative decimal integer tick, lane and length values from generated chart grammar;
- ignore malformed or negative entries safely;
- sort deterministically by `tick`, then `lane`, then `length`;
- preserve modifier events as raw events; semantic grouping happens only in Angular feature code;
- never manufacture a base event from a modifier event.

### 3.2 Endpoint timing

For every parsed event:

```text
startTick  = tick
endTick    = tick + length
seconds    = tickToSeconds(startTick, resolution, tempo map)
endSeconds = tickToSeconds(endTick, resolution, tempo map)
```

Invariants:

- `endSeconds >= seconds`;
- zero length is a tap;
- duration crossing tempo boundaries uses both tempo segments correctly;
- chart offset remains separate from visual Preview offset;
- low-confidence timing remains renderable but retains its existing limitation status.

## 4. Semantic adaptation

### 4.1 Semantic note model

A recommended pure model is:

```ts
type HighwayVisualKind = "kick-rail" | "square-head" | "cymbal-head";
type HighwayPitchedLane = "red" | "yellow" | "blue" | "green";

type HighwaySemanticNote = {
  id: string;
  tick: number;
  chartLane: 0 | 1 | 2 | 3 | 4;
  pitchedLane?: HighwayPitchedLane;
  visualKind: HighwayVisualKind;
  startSeconds: number;
  endSeconds: number;
  length: number;
  cymbal: boolean;
  accent: boolean;
  ghost: boolean;
};
```

Rules:

- `chartLane: 0` MUST produce `visualKind: "kick-rail"` and MUST NOT have a `pitchedLane`.
- `chartLane: 1..4` MUST map to one pitched lane.
- A non-cymbal pitched note MUST be `square-head`.
- A supported cymbal marker on yellow/blue/green MUST change the visual kind to `cymbal-head`.
- Red cannot become a cymbal from an unsupported marker.
- The semantic adapter must never create a playable semantic note for markers `32`, `34..37`, `40..43`, `66..68`, unknown values or malformed events by themselves.

### 4.2 Same-tick grouping

For each tick:

1. Preserve deterministic raw occurrence order so duplicate valid base events stay distinguishable.
2. Identify valid base events `0..4`.
3. Build same-tick marker sets:
   - cymbal: `66` -> yellow, `67` -> blue, `68` -> green;
   - accent: `34` -> red, `35` -> yellow, `36` -> blue, `37` -> green;
   - ghost: `40` -> red, `41` -> yellow, `42` -> blue, `43` -> green.
4. Attach only a marker compatible with a base event at that same tick.
5. Apply accent-over-ghost precedence.
6. Preserve base `length`, `seconds` and `endSeconds`.
7. Do not infer a separate open-hi-hat name from yellow cymbal plus accent.
8. Ignore unknown events without throwing.

## 5. Four-lane geometry and kick rail

### 5.1 Geometry model

`HighwayGeometry` SHALL describe four equal pitched lanes:

```ts
type HighwayGeometry = {
  cssWidth: number;
  cssHeight: number;
  horizonY: number;
  hitLineY: number;
  roadCenterX: number;
  topRoadWidth: number;
  bottomRoadWidth: number;
  pitchedLaneCount: 4;
  minimumReadable: boolean;
};
```

`minimumReadable` MUST be computed from four-lane readability, not five-lane readability.

Road lane dividers and the target row MUST use exactly three internal divider lines and four target regions.

### 5.2 Pitched lanes

| Raw base lane | Pitched visual lane | Default visual |
|---|---|---|
| `1` | red | square |
| `2` | yellow | square; circle with marker `66` |
| `3` | blue | square; circle with marker `67` |
| `4` | green | square; circle with marker `68` |

At any projected depth, a pitched lane center is computed from one of four evenly spaced fractions of the road width.

### 5.3 Kick rail

A kick rail is defined at the same projected depth/time as any other note but has no lane center:

```text
rail left  = projected road left + safe horizontal inset
rail right = projected road right - safe horizontal inset
rail y     = projected note y
```

Visual requirements:

- color identity is orange;
- shape is a horizontal bar with a stable minimum thickness and depth-aware sizing;
- it spans the road interior, not the Canvas viewport outside the road;
- it may coexist at the same tick/depth as pitched notes;
- it is not clipped by a nonexistent fifth lane;
- it is never rendered as a square or circle;
- it does not create a fifth target or divider.

### 5.4 Interval visibility and sustain projection

A semantic note is visible when its chart-time interval intersects the projected visible chart-time interval:

```text
note.startSeconds <= visibleEnd
AND note.endSeconds >= visibleStart
```

For a tap, start and end are identical.

For a pitched sustain:

- project both start/head and end/tail endpoint into the same pitched lane;
- draw a clipped lane-colored quadrilateral/strip between them;
- draw the tail before its square/circle head.

For a kick sustain:

- project start and end to road-wide horizontal bars;
- draw the area between them as a clipped, translucent orange road-spanning band;
- draw the kick rail/head on top of its tail band.

When a tail endpoint is off-screen or behind the hit line, clip it to valid road geometry. Non-finite/invalid endpoint geometry falls back to a tap; it must never throw or draw outside the road.

## 6. Renderer contract

Recommended draw order, from back to front:

1. background;
2. road surface and edge borders;
3. exactly three pitched-lane dividers;
4. beat/measure lines;
5. sustain tails/bands, far-to-near;
6. kick rails, far-to-near;
7. pitched note heads, far-to-near;
8. fixed hit line and four pitched targets;
9. optional HUD and static limitation overlay.

### 6.1 Fixed shape contract

| State | Required visual identity |
|---|---|
| Kick | Orange horizontal rail across road interior |
| Snare/tom-style pitched note | Colored square |
| Cymbal pitched note | Colored circle |
| Accent | Clear emphasis layered on its square/circle, such as a bright rim/outline |
| Ghost | Subdued opacity/contrast treatment on its square/circle |
| Accent + cymbal | Circle plus accent treatment |
| Tail | Drawn before rail/head and clipped to the road |

Effects may evolve aesthetically, but the core shape distinctions above are acceptance criteria.

## 7. UI, lifecycle and accessibility

- Rename experimental user-facing copy to supported `Highway` wording.
- Keep `Chart view` as default.
- Keep speed/HUD controls session-local.
- Keep existing transport as the sole playback authority.
- No Canvas RAF while Highway is absent.
- Normal motion: redraw follows existing Preview clock and never accumulates song time from frame deltas.
- Reduced motion: parent clock updates must not continuously redraw; initial render, play, pause, seek, resize, data reload, offset, mode, speed and HUD changes do refresh.
- Canvas summary must be stable/non-chatty; do not use a per-frame polite live region.
- Preserve cleanup of RAF and `ResizeObserver`.

## 8. Non-goals and boundaries

This phase must not add editing, selection, persistence, source reinterpretation, chart writing changes, other instruments, lower difficulties, double kick, special phrases, unverified flags, a secondary clock or external render dependencies.
