# Spec: Highway Stage Visual Redesign

## Status

Proposed.

## Context

The repository has a merged read-only Canvas 2D Highway Preview. This specification introduces a visual presentation pass without changing semantic chart interpretation, generation behavior, transport ownership or editing boundaries.

## Requirements

### R1 — Feature-owned stage visual profile

The implementation MUST define one named stage visual profile under the Preview Highway feature.

The profile MUST centralize scene viewport, road, perspective, target, note, kick rail and HUD visual parameters.

The renderer and projection MUST consume this profile rather than duplicate profile-owned constants.

### R2 — Controlled road viewport

The Canvas MAY occupy the full component container, but the playable road MUST be centered within a controlled road viewport.

On a wide Canvas, the road viewport MUST be materially narrower than the full Canvas and preserve surrounding dark scene space.

The road viewport MUST remain responsive and bounded on narrow Canvas sizes.

### R3 — Camera and depth

The highway MUST use a profile-driven, finite, monotonic depth curve.

The camera composition MUST provide a more spacious near field and a compressed horizon than the baseline Phase 19B composition.

The depth curve MUST preserve correct order for notes, sustains and musical lines.

### R4 — Lane topology

The highway MUST continue to provide exactly:

```text
four pitched lanes: red | yellow | blue | green
three internal dividers
four pitched targets
one separate kick rail
```

Kick MUST NOT appear as a fifth lane, center, divider or target.

### R5 — Procedural original rendering

All visual styling MUST be created with native Canvas 2D primitives and gradients.

The implementation MUST NOT add external rendering dependencies, images, textures, sprites, third-party models, shaders, copied assets, or copied layouts.

A supplied visual reference MAY inform high-level direction only and MUST NOT be reproduced exactly.

### R6 — Note and target identity

- Standard pitched notes MUST remain square.
- Cymbal notes MUST remain circular.
- Kick notes MUST remain orange horizontal rails bounded inside the road.
- Accent and ghost treatments MUST preserve square/circle identity.
- Pitched targets MUST use a darker, visually restrained interior with lane-color identification.
- Note and target dimensions MUST be profile-driven and remain readable across supported canvas sizes.

### R7 — Sustain behavior

The redesign MUST preserve existing sustain semantics.

- Pitched sustains MUST remain lane-contained.
- Kick sustains MUST remain road-contained.
- Sustains MUST draw before heads/rails.
- Sustains MUST remain safely clipped to valid road geometry.

### R8 — HUD and accessibility

The stage profile SHOULD default the technical HUD to hidden.

When HUD is enabled, it MUST remain compact, non-obstructive and visually secondary.

Canvas accessibility text MUST remain stable and MUST NOT use per-frame announcements.

### R9 — Existing behavior preservation

The redesign MUST preserve:

- existing Preview audio clock ownership;
- existing Chart view default;
- read-only Highway behavior;
- current generated-chart semantic adaptation;
- resize behavior using content-box sizing;
- HiDPI support with current DPR policy;
- reduced-motion policy;
- rAF and observer cleanup.

### R10 — Tests and validation

The implementation MUST add or update automated tests for:

- controlled road viewport on wide canvases;
- lane/kick topology invariants;
- monotonic finite depth curve;
- renderer paths for square/circle/kick and dynamic treatments;
- responsiveness and resize regression behavior.

The implementation MUST complete manual validation across wide, ordinary and narrow window sizes, plus idle stability, playback, seek and HUD behavior.

## Non-goals

This spec does not introduce chart editing, persistence, new IPC, new playback behavior, source parsing changes, chart writer changes, additional instruments, lower difficulties, double kick, fills or a general theming system.

### R11 — Visual direction and durable reference documents

The implementation MUST use the approved `visual-direction.md` and `reference-observations.md` as design input.

The implementation MUST create:

```text
docs/reference/highway-stage-visual-language.md
docs/reference/highway-stage-visual-validation.md
```

The durable documents MUST describe the stage visual language, four-lane-plus-kick topology, validation procedure, and no-copying policy.

Planning screenshots MUST NOT be embedded, copied into the repository, recreated pixel-for-pixel, or used as shipped assets without a separate explicit user decision.

### R12 — Reference-derived original composition

The implementation MUST deliver an original composition with a bounded centered road, substantial dark surrounding scene space on wide canvases, compact outline-led targets, quiet technical overlays, and distinct square/circular/kick silhouettes.

The implementation MUST NOT use this requirement to reproduce a specific external game screen, model, texture, icon, or layout.
