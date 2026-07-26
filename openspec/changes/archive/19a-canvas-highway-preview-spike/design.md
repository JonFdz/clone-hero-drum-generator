# Design — Canvas Highway Preview Spike

## 1. Current baseline

The implementation begins from the current Angular Preview feature after the frontend architecture refactor.

Known available Preview information includes:

- current playback time and duration;
- playback state and existing seek/play/pause controls;
- generated chart resolution and offset;
- generated note events with `tick`, lane index and chart seconds;
- generated tempo events with tick, BPM and chart seconds;
- generated time signature events with tick, numerator, denominator and chart seconds;
- generated sections and timing diagnostics.

The current Preview presents a two-dimensional chart stage. Phase 19A introduces an optional Canvas view beside it, not a replacement.

## 2. Ownership and boundaries

### Feature ownership

All phase code belongs under the Preview feature. Suggested shape after confirming the current feature layout:

```text
apps/desktop/src/app/features/preview/
  components/
    highway-preview/
      highway-preview.component.ts
      highway-preview.component.html
      highway-preview.component.css
      highway-preview.component.spec.ts
      highway-renderer.ts
      highway-renderer.spec.ts
      highway-projection.model.ts
      highway-projection.model.spec.ts
      highway-timing.model.ts
      highway-timing.model.spec.ts
```

The exact folder names may adapt to repository conventions, but the ownership split is mandatory:

| Unit | Responsibility | Must not do |
|---|---|---|
| `HighwayPreviewComponent` | Canvas lifecycle, inputs, resize hookup, rendering loop lifecycle | Read Electron/window integration directly; calculate domain logic in template |
| `HighwayRenderer` | Imperative draw calls from a prepared frame snapshot | Own audio state, mutate chart data, navigate |
| `highway-projection.model` | Pure road, lane, note and line projection | Angular, DOM, Canvas calls |
| `highway-timing.model` | Pure time/tick/beat/measure conversion | Angular, DOM, mutation |
| Existing Preview page/service | Own current playback and feature composition | Let Canvas become a second audio clock |

### Electron boundary

No Electron main, preload or new IPC API is authorized.

The highway consumes the same Preview data already available to Angular. It does not access `window`, preload objects or bridge APIs directly. The existing service/page remains responsible for bridge-backed Preview state.

## 3. Data model

### 3.1 Input snapshot

The component must prepare an immutable, renderer-friendly frame input. The renderer receives data; it does not reach into Angular signals or services.

```ts
export type HighwayFrameInput = {
  cssWidth: number;
  cssHeight: number;
  devicePixelRatio: number;
  playbackSeconds: number;
  previewOffsetSeconds: number;
  durationSeconds: number;
  lookAheadSeconds: number;
  lookBehindSeconds: number;
  noteEvents: readonly HighwayNoteEvent[];
  timingMap: HighwayTimingMap | null;
  reducedMotion: boolean;
  hud: HighwayHudState;
};

export type HighwayNoteEvent = {
  id: string;
  tick: number;
  lane: 0 | 1 | 2 | 3 | 4;
  chartSeconds: number;
};

export type HighwayHudState = {
  enabled: boolean;
  fps: number | null;
};
```

`id` is a deterministic rendering key for this spike only. It must be derived reproducibly from available event data, for example `tick-lane-occurrenceIndexAtTick`. It is not an editing identity and must not be persisted.

### 3.2 Effective timing coordinates

Current Preview offset behavior must remain consistent across visual modes.

```text
effectiveNoteSeconds = chartSeconds + previewOffsetSeconds
chartSecondsAtPlayback = playbackSeconds - previewOffsetSeconds
```

Rules:

- Road projection uses `effectiveNoteSeconds - playbackSeconds`.
- Tick/beat/measure HUD values convert `chartSecondsAtPlayback`, not the offset-adjusted visual time.
- If a computed chart time is below zero, clamp to zero for lookup.
- Offset never changes timing data or generated output in this phase.

### 3.3 Five-lane model

The spike renders the generated drum chart lane index directly:

| Lane index | Highway lane | Base visual |
|---:|---|---|
| 0 | Kick | orange rounded note |
| 1 | Red | red rounded note |
| 2 | Yellow | yellow rounded note |
| 3 | Blue | blue rounded note |
| 4 | Green | green rounded note |

The renderer must not infer cymbal/tom, sustain, ghost or accent semantics from missing data. Those are Phase 19B concerns.

## 4. Timing map

### 4.1 Purpose

The timing map provides pure conversions and line generation. Notes themselves must continue to use their supplied `chartSeconds` values, because those are the existing Preview authority for note placement.

### 4.2 Validity

`buildHighwayTimingMap()` returns `null` when any of the following is true:

- resolution is not finite or is less than or equal to zero;
- no finite positive tempo exists at or before the earliest required lookup range;
- tempo events cannot be ordered into a usable sequence;
- time signature data is absent when beat/measure calculation is requested.

When only tempo data is usable:

- tick conversion may work;
- beat/measure display and musical grid lines must be unavailable rather than guessed.

When a timing map is unavailable:

- notes still render from their supplied seconds;
- HUD renders `Tick: —`, `Beat: —`, `Measure: —` for unavailable fields;
- beat and measure lines are omitted;
- the component exposes an accessible informational limitation.

### 4.3 Tick ↔ seconds conversion

For a tempo segment beginning at `segment.tick`, `segment.seconds` and `segment.bpm`:

```text
secondsAtTick(t) = segment.seconds + (t - segment.tick) * 60 / (segment.bpm * resolution)
```

`tickAtSeconds(s)` uses the inverse of the same segment equation:

```text
tickAtSeconds(s) = segment.tick + (s - segment.seconds) * segment.bpm * resolution / 60
```

Implementation rules:

- Sort defensive copies by `tick`, then by `seconds`.
- Reject non-finite ticks, seconds and BPM values; reject BPM less than or equal to zero.
- Choose the last tempo segment whose tick/seconds boundary is not after the lookup value.
- Use binary search after preprocessing; do not linearly scan the full tempo list once per note/frame.
- Rounding policy: return integer ticks using `Math.round()` only at public display boundaries. Projection helpers may retain floating-point precision internally.

### 4.4 Beat and measure position

For a time signature `(numerator, denominator)`:

```text
ticksPerBeat = resolution * 4 / denominator
ticksPerMeasure = ticksPerBeat * numerator
```

Supported constraints for this spike:

- denominator must be a positive power of two;
- numerator must be a positive integer;
- a valid initial time signature must exist at tick zero to show measure values;
- later time-signature changes are supported only for well-formed chart events that begin on a measure boundary.

For valid data, the map returns:

```ts
export type MusicalPosition = {
  tick: number;
  beat: number;       // 1-based within the active measure
  measure: number;    // 1-based from chart start
  numerator: number;
  denominator: number;
};
```

If a later signature begins off a measure boundary, the function may omit measure output and record a limitation for the HUD. It must not silently fabricate a bar numbering scheme.

### 4.5 Beat and measure line generation

`enumerateMusicalLines()` receives a chart-time range and returns a sorted, bounded list:

```ts
export type HighwayMusicalLine = {
  tick: number;
  chartSeconds: number;
  kind: "beat" | "measure";
  measure: number;
  beat: number;
};
```

Rules:

- Generate only lines inside the visible chart-time range plus a small deterministic padding.
- A measure line replaces the beat line at the same tick; never return both for one tick.
- Cap generated lines to a documented safe maximum, initially `512`. If the cap would be exceeded, retain measure lines and sample minor beat lines deterministically.
- The spike must not derive sub-beat lines.

## 5. Highway projection

### 5.1 Coordinate system

The road is rendered in CSS pixel coordinates, then scaled to the backing-store resolution.

Default geometry, expressed as fractions of available canvas space:

```text
horizonY       = cssHeight * 0.18
hitLineY       = cssHeight * 0.82
roadCenterX    = cssWidth * 0.50
topRoadWidth   = min(cssWidth * 0.22, 260)
bottomRoadWidth= min(cssWidth * 0.84, 980)
```

Clamp geometry to maintain a usable view:

- minimum CSS height: 280 px;
- preferred height: 420–620 px;
- minimum road width: 260 px;
- maintain at least 14 CSS px per lane at the horizon and 42 CSS px per lane at the hit line.

When the available space is below the minimum, keep the component mounted but display the compact limitation state instead of drawing unreadable geometry.

### 5.2 Visible time window

```text
visibleStart = playbackSeconds - lookBehindSeconds
visibleEnd   = playbackSeconds + lookAheadSeconds
```

Initial presets:

| Preset | Look-ahead | Look-behind | Intended use |
|---|---:|---:|---|
| Fast | 3.0 s | 0.10 s | Dense or rapid review |
| Normal | 4.5 s | 0.10 s | Default |
| Slow | 6.0 s | 0.10 s | Broad pattern inspection |

The selected preset is held in feature-local in-memory state only. Default: `Normal`.

### 5.3 Depth projection

For a note's effective visual time:

```text
deltaSeconds = effectiveNoteSeconds - playbackSeconds
progress     = clamp(deltaSeconds / lookAheadSeconds, 0, 1)
depth        = easeOutCubic(progress)
```

`progress = 0` is the hit line. `progress = 1` is the horizon.

Suggested deterministic projection:

```text
noteY       = lerp(hitLineY, horizonY, depth)
roadWidthY  = lerp(bottomRoadWidth, topRoadWidth, depth)
laneWidthY  = roadWidthY / 5
noteRadius  = lerp(18, 5, depth)
```

Use a documented pure `easeOutCubic(x) = 1 - (1 - x)^3` implementation. The renderer may tune constants only through named configuration values; avoid magic values scattered through draw code.

### 5.4 Lane projection

At any `y`, compute road left edge as `roadCenterX - roadWidthY / 2`.

```text
laneCenterX = roadLeftAtY + (lane + 0.5) * laneWidthY
```

The road must show four dividers, creating exactly five lanes. No additional visual lanes may be created for drum-piece variants.

### 5.5 Note ordering

- Filter candidate notes by the visual time window before projecting.
- Sort for drawing by increasing effective time, then lane, then deterministic id.
- Draw far-to-near so later/nearer notes are visually on top.
- Notes at the same tick/lane may overlap only if the source contains duplicates; the renderer must remain deterministic.

## 6. Rendering contract

### 6.1 Canvas lifecycle

- The component owns exactly one `<canvas>` element.
- DOM initialization occurs after the component has rendered.
- The component uses `ResizeObserver` on its container or canvas wrapper.
- On each resize, calculate CSS width/height and the backing-store dimensions.
- Effective DPR is `min(max(window.devicePixelRatio || 1, 1), 2)`.
- Backing-store size is `round(cssSize * effectiveDpr)`.
- Set the Canvas transform so all renderer geometry remains in CSS pixels.
- Disconnect `ResizeObserver` and cancel any pending animation frame on destruction.

### 6.2 Animation loop

The renderer loop is redraw-only:

1. Parent/service supplies authoritative playback time.
2. The component stores the latest inputs in local state/signals.
3. `requestAnimationFrame` asks for the next visual redraw only while the highway mode is active and mounted.
4. Each redraw creates a `HighwayFrameInput` snapshot and calls `renderer.draw(frame)`.
5. The renderer never increments playback time, changes audio state, seeks audio or mutates chart data.

FPS sampling:

- Track frame count over a rolling 500–1000 ms window.
- Update displayed FPS no more than four times per second.
- A missing FPS value is acceptable before enough samples exist.

### 6.3 Draw layers

The renderer draws in this order:

1. Clear/background.
2. Road trapezoid and subtle internal gradient using CHDG-owned colors only.
3. Lane dividers.
4. Musical beat/measure lines.
5. Section labels/markers only when they remain legible; otherwise omit in this spike.
6. Notes, far to near.
7. Hit line and optional small timing glow.
8. HUD.
9. Compact status/limitation overlay, when required.

No bitmap assets are required. Use Canvas primitives: paths, lines, fills, strokes, arcs and text.

### 6.4 Reduced motion

When the user prefers reduced motion:

- do not run a continuously scheduled animation loop solely for visual movement;
- redraw when authoritative playback time, size, mode, preset or input data changes;
- retain the hit line and an understandable static snapshot;
- preserve all existing audio controls and non-canvas Preview information.

## 7. UI composition

### 7.1 Mode switch

Add an experimental, feature-local switch in Preview:

```text
Chart view | Highway (experimental)
```

Rules:

- Default remains the current chart view.
- Changing view must not reset playback, current time, audio source, offset preview, timing diagnostics or selected section.
- The switch is not persisted in project data.
- The switch must have an accessible name and visible experimental label.

### 7.2 Highway controls

Add one accessible preset control:

```text
Highway speed: Fast | Normal | Slow
```

The label must explain that it affects visual look-ahead, not audio speed.

HUD behavior:

- It may be shown by default during the spike.
- It must have a control to hide it.
- The control is in-memory only.

### 7.3 Accessibility summary

Near the canvas, provide an `aria-live="polite"` or equivalent compact text summary that does not update excessively. It must include:

- mode name;
- current time;
- tick/beat/measure when available;
- current limitation when timing map is unavailable;
- note count in the visible window when available.

Do not announce every animation frame.

## 8. Error and limitation states

| Condition | Highway behavior |
|---|---|
| No generated chart | Do not mount active renderer; show existing Preview empty state |
| No audio | Use existing Preview no-audio state; no artificial playback clock |
| Valid notes, invalid tempo/timing map | Render notes by seconds; omit musical lines and unavailable HUD fields; show informative limitation |
| Container too small | Show compact instruction/limitation instead of unreadable road |
| Canvas context unavailable | Show non-fatal error; existing chart view stays available |
| Resize observer unavailable | Use a documented fallback only if existing browser target needs it; otherwise report unsupported environment gracefully |
| Component destroyed | Cancel frame, disconnect observer, release references |

## 9. Performance budget

This is a spike, so the budget is an evidence target rather than a release promise.

- Default visible range: 4.5 seconds ahead, 0.1 seconds behind.
- Render only visible notes and musical lines.
- No per-frame sorting of the entire chart. Pre-sort immutable note data once; filter a bounded range using time ordering or binary search when practical.
- No Angular change detection should be required for every draw call.
- Measure median and worst observed FPS in a normal local desktop window using a safe local sample and a synthetic dense fixture.
- Target: no visible input/playback stutter during ordinary use. Record actual results; never invent a numeric claim.

## 10. Testing architecture

### Pure unit tests

1. `buildHighwayTimingMap`
   - constant tempo / 4-4 map;
   - multiple tempos;
   - invalid tempo rejection;
   - no usable initial tempo;
   - valid and invalid time signatures.
2. Tick/seconds conversions
   - exact values at tempo boundaries;
   - round-trip tolerance around boundaries;
   - offset is not applied inside chart-time conversion.
3. Beat/measure conversion
   - 4/4 known ticks;
   - legal signature change at measure boundary;
   - unavailable measure output for incomplete data.
4. Musical lines
   - no duplicate beat/measure line at a measure boundary;
   - deterministic cap behavior.
5. Projection
   - lane centers are ordered and inside road bounds;
   - horizon/hit line endpoints;
   - speed presets;
   - visible-window filtering;
   - deterministic draw ordering.

### Component tests

- Highway mode remains off by default.
- Switching to highway preserves supplied current time and transport state.
- Resize updates backing-store size using capped DPR.
- Destroy cancels pending animation frame and disconnects resize observer.
- Reduced motion does not schedule a continuous redraw loop.
- Timing limitation exposes accessible summary text.

### Renderer tests

Use a fake Canvas 2D context or a narrow renderer adapter. Assert stable draw-call ordering/inputs rather than pixel-perfect screenshots in the first phase.

## 11. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Musical position diverges from notes after offset | Separate chart-time conversion from effective visual time; test both explicitly |
| High refresh rate changes perceived speed | Derive all positions from authoritative playback time, never frame count |
| Dense notes obscure the road | Begin with bounded look-ahead presets and document readability evidence |
| Canvas becomes an inaccessible black box | Keep existing chart/diagnostic view and add compact accessible summary |
| Scope expands into editing | Treat every mutation-related request as Phase 19C+ work |
| Bad timing data produces fake confidence | Omit beat/measure output when map validity is insufficient |
| Resize/DPR causes blur or performance issues | Use capped DPR, CSS-pixel projection and resize tests |

## 12. No-go criteria

Stop and report rather than broadening scope when:

- existing Preview data cannot drive stable note projection without a new IPC/domain contract;
- timing conversion cannot meet the defined deterministic fixtures;
- the new Canvas requires a graphics dependency to be usable;
- the highway breaks the existing Preview flow;
- implementation would need chart mutation, persistence or edit history to complete its stated acceptance criteria.
