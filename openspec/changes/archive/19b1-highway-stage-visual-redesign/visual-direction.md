# Visual Direction: Original Stage-Style Drum Highway

## Status and purpose

This document is operational design input for Phase 19B.1. It converts the planning references into implementation rules that can be tested and reviewed without importing, copying, or recreating any external game asset, texture, model, layout, or branded visual identity.

The target is an original **stage-style drum highway**: dark, focused, deep, readable, and centered. It must feel like a gameplay surface rather than a diagnostic diagram.

## Non-negotiable semantic topology

```text
Pitched lanes: red | yellow | blue | green
Targets:       red | yellow | blue | green
Kick:          separate orange horizontal rail inside the road
```

- Exactly four pitched lane centers.
- Exactly three internal lane dividers.
- Exactly four pitched targets.
- Kick is never a fifth lane, target, divider, or lane center.
- A standard pitched note remains a square/prismatic head.
- A cymbal remains a circular/disc head.
- Accent and ghost treatment must not change the square/circle identity.

## Composition priorities

The following priorities are ordered. When constraints conflict, preserve the earlier one.

1. **Gameplay readability**: notes, target row, lane identity, kick rail, and sustain relationship must be immediately readable.
2. **Centered focused stage**: the road is a bounded object within a large scene, not a full-width chart diagram.
3. **Depth hierarchy**: near notes are readable and separated; distant notes compress smoothly toward the horizon.
4. **Semantic clarity**: color and shape encode chart meaning before decorative effects.
5. **Technical restraint**: HUD and grid support the view but never compete with it.
6. **Originality and performance**: native Canvas primitives/gradients only; no copied or imported visual material.

## Scene framing

### Scene canvas

- The Canvas fills its component container.
- The scene background is near-black, with optional subtle procedural vignette or low-contrast vertical/radial gradient.
- The road is centered in the scene.
- Wide canvases must show substantial dark negative space on both sides of the road.
- Do not add decorative scenery, images, textures, logos, stage props, crowd silhouettes, or particles in this phase.

### Road viewport

The visible road must be controlled independently from the Canvas width.

For a wide Canvas (at least 1200 CSS px wide):

- bottom road width should generally land between **34% and 48%** of the Canvas width;
- road width must be capped by a profile-owned maximum;
- each side of the road must retain visibly meaningful dark space;
- the road must remain horizontally centered within a tolerance of 1 CSS px after rounding.

For ordinary widths:

- preserve a road viewport narrower than the full Canvas where feasible;
- retain a safe scene margin around the road;
- favor readability over preserving wide-screen proportions exactly.

For narrow widths:

- the road may use more of the available width;
- retain minimum safe side padding and avoid clipping targets, kick rails, sustained bands, or note heads.

### Camera landmarks

Use profile-owned ratios, not renderer-local literals.

Initial visual target ranges:

| Landmark | Preferred range | Intent |
|---|---:|---|
| Horizon Y | 30–40% of scene height | Mid-to-upper scene; enough road depth without pinning the horizon to the top edge |
| Hit-line / target row Y | 78–86% of scene height | Large readable near field and a stable gameplay target area |
| Top road width | 8–16% of Canvas width on wide scenes | Focused vanishing end |
| Bottom road width | 34–48% of Canvas width on wide scenes | Centered stage rather than full-width diagram |

These are visual ranges, not brittle pixel-perfect output requirements. The selected profile must be deliberate, named, documented, and covered by tests.

## Road and grid language

### Road

- Road fill is dark charcoal/near-black with restrained contrast against the scene.
- Outer road borders are visible, cool-gray, and stronger than internal dividers.
- Borders may use a subtle depth-aware thickness or highlight, but must remain original and procedural.
- Do not use a bright blue panel or a large colorful trapezoid that dominates the scene.

### Lane dividers

- Exactly three dividers.
- Internal dividers are lower contrast and thinner than outer borders.
- Their contrast should reduce with depth or remain visually quiet enough that notes stay dominant.

### Beat and measure lines

- Beat lines are subtle neutral-gray horizontal guides.
- Measure lines are distinguishable from beats, but not by a bright saturated color.
- Musical lines should not be confused with kick rails.
- Kick rails remain orange and retain a clearly separate semantic identity.

## Target row

Targets are the interaction anchor even though the phase is read-only.

- There are four compact trapezoidal or rectangular target pads aligned with pitched lanes.
- Interior is dark or low-alpha lane tint.
- Lane-color outline/highlight carries the lane identity.
- Targets must not be large solid blocks.
- Target geometry derives from the same road bounds and lane widths used for note projection.
- The target row may have a subtle neutral hit line behind or around it, but no extra kick target.

## Note language

### Standard pitched notes: squares / prisms

- Standard red/yellow/blue/green notes use a square-derived head.
- The face carries lane color.
- Add a small original depth cue: for example a darker lower/side face, a narrow top highlight, or a controlled shadow.
- Keep the silhouette compact and recognizably square; do not turn it into a generic rounded token.
- Near notes may be larger, but should not become oversized blocks that mask the road.

### Cymbals: discs

- Cymbals use a circular/disc-derived head.
- Add an original radial/highlight/ring treatment to create shallow depth.
- Keep the base lane color unmistakable.
- Do not replicate a specific external cymbal mesh, cone, logo, or texture.
- The disc silhouette remains visually distinct from the square head at every useful depth.

### Accent and ghost

- Accent: add a concise bright rim, ring, or extra outline around the original square/disc.
- Ghost: lower alpha/contrast while retaining the base shape and lane color.
- Accent has semantic precedence when both modifiers are present.
- Do not add text labels to notes.

### Kick rails

- Kick is an orange horizontal rail bounded inside the road.
- It should be thinner and less dominant than the baseline Phase 19B rail.
- Use a restrained main fill, subtle highlight, and dark/neutral shadow or edge as appropriate.
- A near kick rail must remain readable without spanning outside road bounds.
- Kick sustains are road-contained orange bands behind rails and must not masquerade as beat/measure lines.

### Sustains

- Pitched sustains are lane-contained quads/bands.
- Kick sustains are road-contained bands.
- Sustains draw before heads/rails.
- Sustains are visually quieter than their terminal head/rail.
- All sustain geometry is clipped or derived from valid road bounds.

## Projection and pacing

The depth curve must be a named profile-driven function.

- Input and output are finite and clamped to `[0, 1]`.
- The function is monotonic.
- It creates meaningful separation between notes close to the target row.
- It compresses distant notes smoothly toward the horizon.
- It must preserve temporal ordering of notes, sustains, and musical lines.

Avoid a curve that produces a large empty near field with every useful note clustered near the horizon. Avoid the opposite extreme where the road reads as a flat chart plane.

## HUD and technical information

- HUD default is **off** for the stage profile.
- The existing session-only toggle remains available.
- When enabled, HUD is small, low-alpha, neutral-colored, and anchored to a non-obstructive corner.
- Do not use a large opaque HUD panel.
- No per-frame accessibility announcement.
- Existing text summary remains stable and descriptive.

## Explicit anti-patterns

The implementation must avoid:

- full-width road on wide Canvas;
- target pads rendered as large opaque solid blocks;
- a fifth lane, fifth target, or fifth divider for kick;
- bright colored beat/measure lines that compete with notes;
- thick orange kick rails that dominate every frame;
- overly large heads that cover lane geometry;
- unbounded `ResizeObserver` growth or any geometry feedback loop;
- copied screenshot-specific proportions, external assets, textures, meshes, labels, or branded UI;
- a general theme system, user-selectable visual profile, or persistence changes.

## Visual acceptance checklist

A reviewer looking at a paused wide-window frame should be able to say yes to all of these:

- The road is clearly centered and materially narrower than the scene.
- The scene has deliberate dark negative space left and right.
- The horizon and target row produce strong depth.
- Four colored targets are compact and outline-led.
- Kick reads as a separate orange rail, not a fifth lane.
- Square notes, circular cymbals, accent, ghost, and sustains are distinguishable.
- Beat/measure lines and HUD are secondary.
- The result is an original Canvas interpretation, not a screenshot reproduction.
