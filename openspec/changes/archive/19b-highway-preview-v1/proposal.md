# Proposal — Highway Preview v1

## Why

Phase 19A established that CHDG can run a Canvas 2D highway from the existing Preview playback clock, preserve the original Chart view and safely manage timing, resize and animation lifecycle. Its five-parallel-lane rendering was deliberately a technical spike, not the final visual language.

The supported Highway Preview must instead resemble a drum-oriented reading model:

- four colored **pitched lanes**: red, yellow, blue and green;
- **kick** shown independently as an orange horizontal rail across the road;
- square heads for snare/tom-style hits;
- circular heads for cymbal hits;
- visible duration and supported dynamics.

The generated `notes.chart` already contains enough base-note, duration and modifier information to do this without changing generation or making anything editable.

## Desired outcome

When a user opens Preview:

- `Chart view` remains the default precision and diagnostic view.
- `Highway` is a supported, read-only alternate view.
- Transport timing remains driven by the existing audio clock.
- Raw base chart events `0..4` become one of two visual families:
  - `0` / kick -> orange road-spanning horizontal kick rail;
  - `1..4` / red-yellow-blue-green -> pitched-lane head.
- A non-cymbal pitched hit renders as a square head.
- A valid same-tick cymbal marker turns the matching yellow, blue or green pitched head into a circle.
- Accent and ghost remain distinguishable visual treatments without changing the note's time, lane or shape family.
- A non-zero duration renders a clipped sustain tail/band appropriate to its visual family.
- Orphan/unknown markers never create playable notes.
- Invalid or incomplete rich data degrades safely without inventing semantics or breaking Preview.

## User value

The Highway becomes a playback-oriented inspection surface that answers questions the flat chart cannot answer as quickly:

- **Rhythmic readability:** whether kick patterns and pitched hits arrive naturally at gameplay speed.
- **Drum identity:** square snare/tom heads are visually distinct from circular cymbal heads.
- **Kick clarity:** kick remains readable as a dedicated orange rail rather than competing for one of the pitched-lane columns.
- **Duration visibility:** sustain-like note duration is visible rather than collapsed into a tap.
- **Trust:** every displayed semantic is derived from the generated chart that will be exported.
- **Safety:** this phase cannot mutate project state or generated chart content.

## Scope

### 1. Enrich generated chart Preview data

Parse the existing Expert Drums syntax so each raw Preview event includes:

```ts
type ChartPreviewNoteEvent = {
  tick: number;
  lane: number;
  length: number;
  seconds: number;
  endSeconds: number;
};
```

Rules:

- `tick`, `lane` and `length` come directly from the generated chart event.
- `length` is a non-negative integer duration in chart ticks.
- `seconds` is chart time for `tick`.
- `endSeconds` is chart time for `tick + length`.
- Raw modifier events remain in the payload because semantic grouping depends on them.
- This is additive for existing consumers; no new Angular-to-Electron call is needed.

### 2. Build a feature-owned semantic adapter

The Highway feature groups raw events by tick and creates render-only semantic notes.

| Raw event | Highway v1 semantic and visual family |
|---|---|
| Base `N 0` | kick; orange horizontal rail across the road |
| Base `N 1` | red pitched lane; square unless a supported visual modifier changes only emphasis |
| Base `N 2` | yellow pitched lane; square by default, circle when cymbal marker `66` exists at same tick |
| Base `N 3` | blue pitched lane; square by default, circle when cymbal marker `67` exists at same tick |
| Base `N 4` | green pitched lane; square by default, circle when cymbal marker `68` exists at same tick |
| Same-tick marker `34`–`37` | accent for compatible non-kick base lane |
| Same-tick marker `40`–`43` | ghost for compatible non-kick base lane |

The adapter MUST:

- create exactly one semantic note per valid base event;
- retain the raw chart lane so data provenance stays explicit;
- expose visual category `kick-rail`, `square-head` or `cymbal-head`;
- attach only compatible same-tick modifiers;
- preserve duration and chart-time endpoints;
- ignore modifier-only/unknown events as playable notes;
- apply accent-over-ghost precedence;
- not infer a named hi-hat articulation from a yellow cymbal plus accent;
- not render lane `32` or any special/non-base event as a playable note in this phase.

### 3. Upgrade Canvas visuals

The Canvas renderer SHALL use original visuals with fixed semantic meaning:

- **Road topology:** exactly four equal pitched lanes, red/yellow/blue/green; four corresponding fixed target regions at the hit line.
- **Kick:** orange horizontal bar spanning the road interior at its projected depth. It is never positioned by a fifth lane center and never receives a fifth lane target.
- **Snare/toms:** square head centered in their pitched lane.
- **Cymbals:** circular head centered in their pitched lane.
- **Accent:** clear emphasis such as a bright outer rim/secondary outline; it does not replace square/circle identity.
- **Ghost:** reduced-opacity/subdued treatment; it does not replace square/circle identity.
- **Sustain:** a lane-colored tail for pitched notes; a translucent orange road-spanning band for kick. Tails/bands are drawn before heads/rails.
- **Timing:** existing road boundaries, four lane dividers, beat/measure lines and optional technical HUD remain available.

No image assets, shaders, external fonts, copied graphics or copied layouts may be used.

### 4. Preserve supported Preview behavior

- Chart view remains default.
- Highway remains read-only.
- Existing play/pause/seek controls remain the only playback controls.
- Normal-motion rendering follows the existing Preview audio clock.
- Reduced-motion operation must not become continuous redraw through parent clock updates.
- Seek, pause, resume, offset/data reload, preset/HUD changes and resize refresh the Canvas correctly.
- Inactive Highway does not keep an animation loop alive.
- No project/chart mutation occurs.

## Non-goals

- Editable notes, selection, grid editor, snapping, inspector, commands, undo/redo.
- Persistence of manual edits or any effective-chart overlay.
- Changes to chart writer output or generator mappings.
- New dynamics/articulation semantics beyond the current generated chart grammar.
- Persistent preferences.
- Section-marker visualization or source-analysis comparison inside Highway.
- External runtime tools, dependencies or assets.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Kick is accidentally treated as a fifth pitched lane | Separate chart-lane semantics from four-lane geometry; explicitly test that kick has no lane center/target. |
| Cymbal/tom ambiguity | Use only same-tick generated cymbal markers; square means standard/tom-style, circle means supported cymbal. |
| Modifier without compatible base | Ignore it as playable content and test it. |
| Malformed duration | Use only non-negative finite duration; render a safe tap if endpoint is unusable. |
| Sustain crosses a tempo change | Compute end time from `tick + length` through the timing map; test it. |
| Visual density obscures the road | Never discard base notes; clip tails and decorative timing lines, and draw rails/tails before heads. |
| Accessibility chatter | No frame-by-frame `aria-live` update. |
| Highway regressions affect flat chart | Chart remains default and Preview-page regression coverage is required. |
