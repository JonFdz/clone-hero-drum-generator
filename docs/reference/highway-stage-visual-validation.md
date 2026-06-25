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

Use a generated chart that contains kick, standard pitched notes, cymbals,
accent/ghost cases, sustains, tempo data, and meter data.

### Wide desktop window

1. Open Preview and select Highway.
2. Confirm a large dark scene surrounds a narrower centered road.
3. Confirm the road does not stretch to near full screen width.
4. Confirm the horizon, road, and hit line read as one coherent stage-like
   perspective.
5. Confirm four colored pitched targets are visible and compact (outline-led,
   not solid blocks).
6. Confirm kick is a separate orange rail, never a target or fifth lane.
7. Confirm squares, circles, rail, and sustains remain distinct.

### Ordinary desktop window

1. Confirm the road stays centered and safely bounded.
2. Confirm notes, targets, rails, and sustains are legible.
3. Confirm beat/measure lines remain secondary.

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
4. Toggle the technical HUD and confirm it remains compact and
   non-obstructive.

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
