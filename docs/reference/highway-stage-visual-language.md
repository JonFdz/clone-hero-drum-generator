# Highway Stage Visual Language

> Durable reference for the Clone Hero Drum Generator desktop Highway preview.
> This documents the **original** stage-style visual language implemented in
> Phase 19B.1. It is a design/contract reference, not a spec.

## Ownership and scope

- The stage visual language is feature-owned under
  `apps/desktop/src/app/features/preview/highway/`.
- One production visual profile owns every profile-driven visual value:
  `highway-stage-visual-profile.ts` (`HIGHWAY_STAGE_VISUAL_PROFILE`).
- The renderer and projection consume the profile; they do not scatter
  profile-owned constants as local literals.
- There is **no** user-selectable theme and **no** persisted visual preference.
- Chart semantics (lane data, kick identity, note meaning) are owned by
  `highway-model.ts` / `highway-note-semantics.ts` and are intentionally not
  part of the visual profile.
- This phase is presentation-only. It does not change `notes.chart` output,
  MIDI/GPIF parsing, mappings, chart writing, Electron/preload/IPC,
  persistence, transport ownership, or audio behavior.

## Planning references policy

Screenshots supplied during planning are **external direction only**. They are
not repository assets. They must not be committed, embedded, copied, or
reproduced pixel-for-pixel. The implemented language is an original Canvas 2D
interpretation that uses only native primitives and gradients — no images,
textures, sprites, 3D models, shaders, copied layouts, or branded iconography.

## Non-negotiable semantic topology

```
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
- Accent and ghost preserve the base square/circle identity.
- Sustains preserve current timing and draw before heads/rails.

## Projection and calibration pass

This iteration is explicitly a **camera-calibration pass**. The remaining
defect after the first stage-style pass was no longer generic styling, but the
actual gameplay camera: time-to-depth spacing, target-row height, road width at
the hit line, and note size relative to local lane width.

The calibrated intent is:

- a materially narrower centered road;
- more black negative space on wide scenes, primarily at the left and right;
- a tall gameplay field that occupies most of the Canvas height;
- a lower hit line / higher horizon pairing that yields roughly 70–75% playable road span;
- a shorter Fast travel window so fewer future notes are visible at once;
- more readable note spacing through the near and mid sections;
- perspective-style lower-field expansion with compression pushed toward the far horizon;
- no duplicate/piled-up passed heads or musical lines at the hit line;
- compact note/target sizing tied to local lane geometry;
- tiny corner-oriented technical HUD metrics.

## Scene and camera principles

- The Canvas fills its component container; the playable road lives inside a
  **bounded, centered road viewport** whose width is derived independently of
  the total Canvas width.
- Road viewport width is `min(maxRoadViewportWidth, canvasWidth * roadViewportWidthRatio)`,
  floored by `minRoadViewportWidth`, and never exceeds the canvas minus safe
  scene padding.
- On wide canvases the bottom road lands in roughly the 33–38% band of canvas
  width and the top road in the 8–10% band, with substantial dark negative
  space on both sides.
- The road is centered within a 1 CSS px tolerance.
- The canvas shell itself is responsively bounded so the Highway has enough
  real vertical pixels for a long gameplay field instead of a short strip.
- The horizon sits in roughly the 18–22% height band.
- The hit line/target row sits in roughly the 88–91% height band.
- Together, the playable road span occupies roughly 70–75% of the Canvas
  height.
- The depth curve is a named, profile-driven, monotonic, finite function
  clamped to `[0, 1]` (`stageDepthForProgress`). The calibrated curve is the
  perspective-style mapping `p / (p + perspectiveCompression * (1 - p))`,
  chosen because it expands the lower field much more aggressively than a
  generic exponent ease while still compressing the far horizon.
- Passed heads and passed beat/measure lines are not rendered once their
  effective seconds fall behind playback. Sustains that cross playback are
  clipped safely to the hit line without spawning a duplicate head there.
- Fast uses a shorter look-ahead than before so its visible field is materially
  less dense near the targets; Normal and Slow remain unchanged.

## Draw order

The renderer retains this fixed semantic order:

1. scene background / vignette;
2. road fill and borders;
3. lane dividers;
4. beat / measure lines;
5. sustain tails and kick sustain bands;
6. kick rails;
7. pitched square/circle heads plus dynamic treatment;
8. hit line and four pitched targets;
9. optional compact HUD;
10. static limitation overlay, if required.

## Target row

- Four compact pads aligned with pitched lanes.
- Darker interior and clearer framing than the initial stage-style pass.
- Lane-colored outline/highlight remains the lane identity carrier.
- Never large opaque solid blocks.
- Geometry derives from the same road bounds and lane widths used for
  projection — no renderer-only interpretation.
- Target height is clamped relative to the local lane width so targets do not
  bloat when the road narrows.
- No fifth kick target.

## Standard pitched notes (squares / prisms)

- Square-derived head carrying lane color.
- Original depth cue: a narrow top highlight and a darker lower face, plus a
  consistent outline.
- Calibrated smaller than the initial stage-style pass; never oversized blocks
  that mask the road.
- Head size is clamped relative to the current local lane width.

## Cymbals (discs)

- Circular/disc-derived head carrying lane color.
- Original disc treatment: filled disc, ring outline, offset radial
  highlight, and a subtle halo constrained near the disc.
- Calibrated smaller and less soft than the initial stage-style pass.
- Visually distinct from the square head at every useful depth.
- No copied cymbal mesh, cone, logo, or texture.

## Accent and ghost

- Accent: a concise bright rim/ring/outline over the original square or disc.
  Accent has semantic precedence when both modifiers are present.
- Ghost: reduced alpha/contrast while preserving the base shape and lane color.
- No text labels over notes.

## Kick rails and sustains

- Kick is an orange horizontal rail bounded inside the road, thinner and less
  dominant than the Phase 19B baseline, and slightly more restrained than the
  first stage-style calibration, with a restrained highlight/shadow.
- Kick sustains are road-contained orange bands behind rails, drawn before
  rails, and quieter than the terminal rail.
- Pitched sustains are lane-contained bands behind heads, drawn before heads.
- All sustain geometry is clipped/derived from valid road bounds.

## Beat and measure lines

- Beat lines are subtle neutral-gray horizontal guides.
- Measure lines are distinguishable from beats but not by a bright saturated
  color.
- Musical lines never compete with notes and are never confused with the
  orange kick rail.

## HUD and accessibility policy

- The technical HUD defaults to **off** for the stage profile.
- The existing session-only toggle remains available; the setting is not
  persisted.
- When enabled, the HUD is intentionally tiny and split across corners:
  **FPS top-left**, **Tick / Beat / Measure top-right**.
- It uses low-alpha neutral text only; there is no large opaque panel.
- The HUD must not obscure the road, horizon, or near notes.
- No per-frame accessibility announcements (`aria-live` or equivalent).
- The Canvas accessible summary remains stable and descriptive.

## Extension boundaries

Future Highway visual work should:

- keep the visual profile as the single source of profile-owned values;
- preserve the four-pitched-lanes-plus-separate-kick-rail topology;
- keep Canvas 2D primitives/gradients only (no external rendering engines,
  images, or textures);
- avoid reintroducing renderer/projection-local visual literals;
- keep the HUD secondary and off by default unless explicitly re-approved.
