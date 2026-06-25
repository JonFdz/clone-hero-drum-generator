# Highway Stage Visual Validation

> Durable manual/visual validation guide for the desktop Highway stage visual
> language (Phase 19B.1). Use this when visually reviewing Highway changes.

## Automated gates

Run from the repository root (or as noted):

```bash
pnpm --filter @chdg/desktop lint
pnpm --filter @chdg/desktop check:architecture
pnpm --filter @chdg/desktop test
pnpm --filter @chdg/desktop typecheck
pnpm --filter @chdg/desktop build
pnpm test
```

Automated coverage exists for: profile existence and profile-driven geometry,
bounded centered road viewport on wide canvases, safe geometry on ordinary
and narrow canvases, exactly four pitched centers / three dividers / four
targets, no fifth kick target/center/divider, kick rail inside road bounds at
near and far depths, finite monotonic depth curve, square/cymbal/kick
rail/sustain/accent/ghost renderer paths, target and sustain draw ordering,
HUD default-off and enabled compact behavior, content-box `ResizeObserver`
regression, and reduced-motion/destroy cleanup regressions.

## Manual validation

This iteration is explicitly a **camera-calibration pass**. Manual review
should compare not only whether the Highway is "pretty" but whether the camera,
projection, and note sizing now behave materially closer to gameplay spacing.

Priority comparison axes for this pass:

- vertical road occupancy within the canvas;
- lateral negative space versus excessive top/bottom dead space;
- road width feel;
- target-row vertical position;
- horizon / stage-depth feel;
- note spacing feel (especially near + mid sections);
- number of visible future notes at matching Tick / Beat / Measure positions;
- stability of the shared camera when switching Fast/Normal/Slow;
- absence of lower-road pile-up from recently passed events;
- target scale and darkness;
- note scale relative to lane width (square + cymbal heads);
- HUD subtlety and corner placement.

Use a generated chart that contains kick, standard pitched notes, cymbals,
accent/ghost cases, sustains, tempo data, and meter data.

### Wide desktop window

1. Open Preview and select Highway.
2. Use the HUD to match the same Tick / Beat / Measure position against the
   same-song reference before judging spacing.
3. Confirm the Highway occupies most of the canvas vertically rather than
   appearing as a tiny road floating in the center.
4. Confirm the black negative space is primarily lateral, not excessive above
   or below the road.
5. Compare the road width feel against the previous iteration: confirm a
   materially narrower centered road with more black space around it.
6. Confirm the road does not stretch to near full screen width.
7. Compare the target-row vertical position against the reference: it should
   sit materially lower than the previous pass while still leaving a readable
   near field.
8. Compare the horizon feel against the previous iteration: confirm a farther,
   longer, deeper stage perspective.
9. Compare the number of visible future notes at the same musical position:
   the field should not feel materially denser than the reference.
10. Confirm four colored pitched targets are visible, compact, darker inside,
   and more clearly framed (not solid blocks).
11. Compare note scale against the previous iteration: square and cymbal heads
   should feel more compact relative to their lanes.
12. Compare note spacing feel against the previous iteration: clusters should
   be more readable vertically through the near and mid sections.
13. Switch between Normal and Fast at the same musical position and confirm the
   road geometry, target row, and camera composition do not jump into a
   different visual mode.
14. Focus on repeated fast notes near the target row and confirm they gain more
   separation through faster travel rather than through a different camera.
15. Confirm there is no lower-road pile-up from recently passed heads or
   beat/measure lines at the hit line during repeated passages.
16. Confirm kick is a separate orange rail, never a target or fifth lane.
17. Confirm squares, circles, rail, and sustains remain distinct.

### Ordinary desktop window

1. Confirm the road stays centered and safely bounded.
2. Use the HUD to compare the same Tick / Beat / Measure against the reference.
3. Compare note spacing feel against the previous iteration: the mid field
   should feel less vertically compressed.
4. Confirm the number of visible future notes is materially lower in Fast than
   the previous pass at the same musical position.
5. Confirm recently passed heads and beat/measure lines do not stack at the hit
   line.
6. Confirm notes, targets, rails, and sustains are legible.
7. Confirm beat/measure lines remain secondary.

### Narrow window

1. Resize narrower repeatedly.
2. Confirm no clipping, no overlap that hides semantics, no collapse, and no
   progressive container size growth.
3. Confirm minimum safe side padding is retained.

### Idle resize stability

1. Leave the Highway idle for at least 30 seconds.
2. Confirm the Canvas/container height remains stable.
3. Resize repeatedly and confirm no `ResizeObserver` feedback loop.

### Playback, pause, and seek

1. Play, pause, and seek.
2. Confirm visual timing remains aligned with the existing Preview transport
   (the Preview audio clock is the only timing authority).
3. Confirm sustain/head ordering remains correct.
4. Toggle the technical HUD and confirm it remains tiny, corner-oriented, and
   non-obstructive (FPS top-left; Tick / Beat / Measure top-right).

### Reduced motion

1. Enable reduced-motion in the OS/browser.
2. Confirm no unwanted continuous animation from playback updates.
3. Confirm seek/manual changes still render.

### Semantic topology checks

Confirm in a paused frame: four targets, three internal dividers, squares for
standard pitched notes, circles for cymbals, a separate orange kick rail
(never a fifth lane), accent/ghost preserve base shapes, and sustains remain
correct and ordered behind heads/rails.

### Original-rendering / no-external-assets audit

Confirm there are no added image assets, textures, imported graphics
libraries, copied layout data, branded visual labels, external renderer
engines, shaders, workers, offscreen canvas, 3D models, or attempts to
reproduce a supplied reference pixel-for-pixel. All styling must use native
Canvas 2D primitives and gradients only.

## Future evidence expectations

Record validation evidence for future phases as:

- the exact commands run and their pass/fail outcome;
- any environmental limitation that prevented a command or manual check;
- the window widths used for wide/ordinary/narrow checks;
- confirmation that the four-lane-plus-kick-rail topology and original-rendering
  audit held.

Do not claim a command or manual check passed unless it actually passed.
