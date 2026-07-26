# Design: Highway Stage Visual Redesign

## 1. Architectural boundary

The redesign is entirely feature-owned under:

```text
apps/desktop/src/app/features/preview/highway/
```

Expected primary touchpoints:

```text
highway-model.ts
highway-projection.ts
highway-renderer.ts
highway-projection.spec.ts
highway-renderer.spec.ts
components/preview-highway/preview-highway.component.ts
components/preview-highway/preview-highway.component.spec.ts
```

Do **not** change the Preview bridge contract, Electron parser, generated chart writer, project persistence, source parsing, mapping, or playback service for this phase unless a genuine existing defect blocks the visual profile. If that occurs, stop and ask before broadening scope.

## 2. Introduce one named visual profile

Create a feature-owned module such as:

```text
highway-stage-visual-profile.ts
```

It must centralize the visual constants currently distributed across geometry, projection and renderer logic. The exact exported shape may differ, but it must make the following values explicit and discoverable:

```ts
export type HighwayStageVisualProfile = {
  scene: {
    maxRoadViewportWidth: number;
    roadViewportWidthRatio: number;
    minRoadViewportWidth: number;
    sideScenePadding: number;
    horizonRatio: number;
    hitLineRatio: number;
  };
  road: {
    topWidthRatio: number;
    bottomWidthRatio: number;
    borderWidthNear: number;
    borderWidthFar: number;
    laneDividerAlpha: number;
  };
  projection: {
    depthExponent: number;
    nearFieldBias: number;
  };
  targets: {
    heightNear: number;
    interiorAlpha: number;
    outlineWidth: number;
  };
  notes: {
    squareNearSize: number;
    squareFarSize: number;
    circleNearRadius: number;
    circleFarRadius: number;
    kickRailNearThickness: number;
    kickRailFarThickness: number;
    sustainAlpha: number;
  };
  hud: {
    enabledByDefault: boolean;
    fontSize: number;
    alpha: number;
    edgeInset: number;
  };
};
```

Use a single production profile for this phase. Do not add user-selectable themes or persisted display settings.

## 3. Scene composition

### 3.1 Scene viewport

The Canvas still fills its container, but the playable road must live inside a centered scene viewport whose width is bounded independently from total Canvas width.

Rules:

- Road viewport width is derived from both a ratio of Canvas width and an explicit maximum width.
- On wide screens, the road remains substantially narrower than the Canvas.
- The dark background remains visible to the left and right of the road.
- On smaller screens, geometry may consume more of the Canvas width but must retain safe side padding.
- The visual profile, not renderer-local literals, owns these constraints.

A suitable initial direction is:

```text
road viewport ~= min(maxRoadViewportWidth, canvasWidth * 0.52)
```

This is a direction, not a requirement to preserve those exact numbers. Validate the chosen constants visually and through tests.

### 3.2 Camera

The highway should feel deeper and more focused.

- Horizon must sit lower than the Phase 19B baseline, approximately in the upper-middle part of the scene rather than close to the top edge.
- Hit line remains near the lower portion of the road, leaving meaningful near-field space.
- Road trapezoid must remain centered.
- The perspective curve must be named and profile-driven.
- The curve should leave more readable spacing between near notes while compressing distant notes smoothly toward the horizon.

Replace anonymous/implicit perspective tuning with a function whose intent is evident, for example:

```ts
function stageDepthForProgress(progress: number, profile: HighwayStageVisualProfile): number
```

The function must be monotonic, finite and clamped to `[0, 1]`.

## 4. Geometry invariants

The following invariants remain mandatory:

```text
Pitched lanes: red | yellow | blue | green
Targets: exactly four
Internal lane dividers: exactly three
Kick: separate orange rail, never a fifth lane/target/divider
```

Road bounds, targets, dividers, pitched lane centers, kick rail bounds and sustain bands must all derive from the same geometry/profile inputs. No renderer-only geometry should create a separate interpretation of road width.

## 5. Procedural visual language

### 5.1 Background and road

Use Canvas primitives and gradients only:

- dark near-black scene backdrop;
- optional subtle procedural vignette or restrained vertical/radial gradient;
- road fill with a restrained dark gradient;
- road border with one original highlight/shadow treatment;
- beat and measure lines low contrast, with measure lines modestly stronger.

No images, sprites, texture files, shaders or third-party visual assets.

### 5.2 Targets

Targets must remain identifiable by lane color but become less block-like.

Requirements:

- dark/translucent interior;
- lane-colored outline and restrained highlight;
- lane color remains readable for color-identification;
- no fifth kick target;
- target geometry remains fully inside the bottom road bounds;
- targets must not obscure the kick rail at the hit line.

### 5.3 Square heads

Square heads remain for non-cymbal pitched notes.

Use a simple original dimensional treatment such as:

- main colored face;
- brighter top/edge accent;
- darker side or lower shadow;
- consistent outline.

Do not create a copied 3D model or match a third-party note mesh.

### 5.4 Cymbal heads

Cymbal heads remain circles.

Use a simple original disc treatment such as:

- filled circle;
- ring/outline;
- lightweight centered or offset highlight;
- optional subtle halo constrained to the road.

The result must remain visibly circular at near and far depths.

### 5.5 Kick rail

Kick remains an orange horizontal rail inside current road bounds.

Rules:

- thickness is profile-driven and thinner than the Phase 19B visual baseline;
- safe horizontal inset remains;
- it may have a compact edge highlight and subtle shadow;
- it never spans the full Canvas;
- kick sustain bands remain behind the rail and use a lower alpha.

### 5.6 Accent, ghost and sustains

Existing semantics must not change.

- Accent remains an emphasis layer over the existing square/circle identity.
- Ghost remains a subdued version of the existing square/circle identity.
- Pitched sustains remain lane-contained and draw before heads.
- Kick sustains remain road-contained and draw before rails.
- All visual treatments must be readable without masking lane/color semantics.

## 6. HUD and static text

The technical HUD must become visually secondary.

Default direction:

- HUD hidden by default for the stage profile, while its existing feature-local control remains available.
- When enabled, HUD uses a small, low-alpha text treatment in a corner with no large opaque panel.
- It must not obscure the road, horizon or near notes.
- It must not use `aria-live` or emit continuous announcements.

Keep stable accessible summary text. Do not turn per-frame metric values into dynamic accessibility announcements.

## 7. Resize, DPR and lifecycle

Retain all corrected behavior from Phase 19B:

- Use content-box dimensions (`clientWidth`/`clientHeight`) for the observed canvas-shell.
- No ResizeObserver feedback loop.
- DPR remains capped at 2 unless current project policy changes explicitly.
- Canvas redraws correctly after genuine resize.
- rAF remains constrained by normal motion/playback policy.
- Reduced motion does not continuously redraw from playback updates.
- Destruction cancels rAF and disconnects observer.

## 8. Performance constraints

- Keep a single Canvas.
- No per-frame allocations that scale with full chart size beyond the existing visible-window path.
- No image loading or asynchronous rendering pipeline.
- Avoid expensive blur/filter effects that compromise ordinary desktop playback.
- Preserve deterministic draw order.

## 9. Draw order

The renderer must retain this semantic order while allowing restyling:

1. scene background/vignette;
2. road fill and borders;
3. lane dividers;
4. beat/measure lines;
5. sustain tails and kick sustain bands;
6. kick rails;
7. pitched square/circle heads plus dynamic treatment;
8. hit line and four pitched targets;
9. optional compact HUD;
10. static limitation overlay, if required.

## 10. Visual-direction package and durable documentation

The implementation MUST read and comply with:

```text
visual-direction.md
reference-observations.md
```

These documents are part of the approved design input for this phase.

The implementation MUST create the following durable repository documents as part of the phase:

```text
docs/reference/highway-stage-visual-language.md
docs/reference/highway-stage-visual-validation.md
```

### 10.1 `highway-stage-visual-language.md`

This is the durable project reference for future Highway work. It must record:

- four pitched lanes plus separate kick rail topology;
- scene viewport and camera principles;
- target, standard-note, cymbal, kick-rail, sustain, accent and ghost language;
- HUD/accessibility policy;
- profile ownership and extension boundaries;
- the fact that planning screenshots were abstract direction only and are not repository assets.

### 10.2 `highway-stage-visual-validation.md`

This is the durable manual/visual verification guide. It must record:

- wide, ordinary and narrow window visual checks;
- idle resize-stability check;
- playback/pause/seek/reduced-motion checks;
- four-lane/kick-rail semantic checks;
- original-rendering/no-external-assets audit;
- expected evidence format for future phases.

Neither document may embed, copy, or redistribute planning screenshots without a separate explicit decision by the user.

## 11. Reference-derived composition constraints

The following visual constraints are normative for implementation but must be delivered through an original Canvas language:

- bounded centered road viewport on wide Canvas;
- substantial dark negative space surrounding the road;
- compact outline-led four-target row;
- low-dominance beat/measure lines;
- thinner kick rail than Phase 19B baseline;
- compact optional HUD, disabled by default;
- clear square versus circular note silhouette at useful depths;
- no full-width broad-road fallback on wide desktop scenes.
