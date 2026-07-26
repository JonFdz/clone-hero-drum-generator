# Verification: Phase 19B.1 — Highway Stage Visual Redesign

## Automated checks

Run from the repository root unless project documentation specifies otherwise:

```bash
pnpm --filter @chdg/desktop lint
pnpm --filter @chdg/desktop check:architecture
pnpm --filter @chdg/desktop test
pnpm --filter @chdg/desktop typecheck
pnpm --filter @chdg/desktop build
pnpm test
```

Run focused tests for Highway projection, renderer, component lifecycle and semantic adaptation.

When a command cannot run, record the exact command, complete relevant output, environmental limitation and any truthful alternative check in Engram. Do not claim success for a command that did not pass.

## Automated acceptance matrix

| Area | Required check |
|---|---|
| Visual profile | Profile exists as feature-owned configuration; profile values affect geometry/projection |
| Wide layout | Road viewport is bounded and centered; side scene space remains visible |
| Lane structure | Four pitched lane centers, three dividers, four targets |
| Kick | Rail remains inside road bounds; no fifth lane/target/divider |
| Projection | Depth result is finite, clamped and monotonic |
| Note identity | Standard pitched note -> square; cymbal -> circle; kick -> rail |
| Modifier identity | Accent/ghost preserve base square/circle identity |
| Sustains | Draw before heads/rails and remain road-contained |
| HUD | Default state follows approved profile; enabled state does not dominate road |
| Resize | Content-box dimensions prevent progressive growth |
| Lifecycle | Current reduced-motion and destroy cleanup tests remain valid |

## Manual validation

Use a generated chart containing kick, standard pitched notes, cymbals, accent/ghost cases, sustains, tempo data and meter data.

### Wide desktop window

1. Open Preview and select Highway.
2. Confirm a large dark scene surrounds a narrower centered road.
3. Confirm the road does not stretch to near full screen width.
4. Confirm the horizon, road and hit line read as one coherent stage-like perspective.
5. Confirm four colored pitched targets are visible.
6. Confirm kick is a separate orange rail, never a target or fifth lane.
7. Confirm squares, circles, rail and sustains remain distinct.

### Ordinary and narrow window

1. Resize narrower and wider repeatedly.
2. Confirm the road stays centered and safely bounded.
3. Confirm no clipping, collapse, overlap that hides semantics, or progressive container growth.
4. Confirm the Canvas height remains stable while idle for at least 30 seconds.

### Playback

1. Play, pause and seek.
2. Confirm visual timing remains aligned with existing Preview transport.
3. Confirm sustain/head ordering remains correct.
4. Confirm reduced-motion behavior still avoids continuous animation where required.
5. Toggle technical HUD and verify it remains compact and non-obstructive.

### Originality audit

Confirm there are no added image assets, textures, imported graphics libraries, copied layout data, branded visual labels, or attempts to reproduce a supplied reference pixel-for-pixel.

## Visual-direction documentation checks

Verify both durable documentation files exist and are coherent with this OpenSpec:

```text
docs/reference/highway-stage-visual-language.md
docs/reference/highway-stage-visual-validation.md
```

Confirm they:

- document original procedural Canvas direction rather than copied visual material;
- preserve the four pitched lanes plus separate kick rail contract;
- document wide, ordinary and narrow visual validation;
- explicitly prohibit committing or embedding planning screenshots without a separate user decision.
