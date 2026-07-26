# Tasks — Canvas Highway Preview Spike

> Do not start implementation until this OpenSpec has been approved and its accepted content has been transferred into Engram.

## 0. Reconcile and inspect

- [ ] Read `AGENTS.md` and the SDD workflow documentation.
- [ ] Read the accepted OpenSpec package in full.
- [ ] Transfer accepted decisions, constraints, tasks and verification rules into Engram.
- [ ] Inspect current Preview page, Preview service, current chart-stage component, Preview data types and timing-diagnostic helpers.
- [ ] Confirm the exact generated Preview payload available on the target `main` commit.
- [ ] Confirm no Electron/preload or `packages/*` change is required for Phase 19A.
- [ ] Record any mismatch between this OpenSpec and current code before implementing; do not silently redesign scope.

## 1. Add pure timing model

- [ ] Create a Preview-feature-owned pure timing module.
- [ ] Define typed inputs for resolution, tempos and time signatures.
- [ ] Build defensively sorted tempo and meter segments without mutating input arrays.
- [ ] Implement `chartSecondsAtTick()`.
- [ ] Implement `tickAtChartSeconds()`.
- [ ] Implement `musicalPositionAtTick()`.
- [ ] Implement visible beat/measure line enumeration with deterministic cap behavior.
- [ ] Define explicit unavailable/limitation results instead of using fabricated defaults.
- [ ] Add focused tests for constant tempo, tempo changes, 4/4, valid meter changes and incomplete timing.

## 2. Add pure highway projection model

- [ ] Define five lane constants and their CHDG-owned visual tokens.
- [ ] Define named geometry and speed-preset configuration.
- [ ] Implement visible-note filtering from effective note seconds.
- [ ] Implement road width, lane center, note position and note scale projection.
- [ ] Implement projection for beat/measure lines.
- [ ] Implement deterministic note ordering.
- [ ] Add focused tests for geometry, lane ordering, speed presets, clipping and stable ordering.

## 3. Add renderer

- [ ] Create a renderer that accepts only a prepared `HighwayFrameInput`.
- [ ] Draw background, road, dividers, musical lines, notes, hit line, HUD and limitation overlay in documented order.
- [ ] Use only Canvas 2D primitives and CHDG-owned colors/shapes.
- [ ] Keep all configuration named and local; do not spread geometry constants through the renderer.
- [ ] Add narrow fake-context tests for draw ordering and no-throw behavior.

## 4. Add Angular Canvas component

- [ ] Create one standalone OnPush component with external template, CSS and spec.
- [ ] Initialize Canvas only after DOM render.
- [ ] Add container size observation.
- [ ] Implement DPR-aware backing-store resize with DPR cap two.
- [ ] Store/cancel animation-frame request ids safely using `null`, not `0`.
- [ ] Use latest supplied Preview playback time as the rendering authority.
- [ ] Stop continuous redraw when the component is not in active highway mode, is destroyed or reduced motion is preferred.
- [ ] Expose compact accessible summary/limitation content.
- [ ] Add unit tests for resize, destroy cleanup, reduced motion and accessible limitation output.

## 5. Compose in Preview

- [ ] Add an in-memory view switch; current 2D chart view remains default.
- [ ] Add in-memory speed preset and HUD visibility controls.
- [ ] Route existing audio time, duration, offset and chart data into the highway component without duplicating playback state.
- [ ] Preserve current transport, offset behavior, sections and timing diagnostics.
- [ ] Verify switching visual mode does not reset playback or seek position.

## 6. Evidence and regression validation

- [ ] Add or update phase evidence documentation without committing copyrighted media.
- [ ] Validate a synthetic fixture with known tempo and meter values.
- [ ] Validate a safe local chart/audio sample manually, if available.
- [ ] Record behavior for play, pause, seek, resize, normal DPI, high DPI and reduced motion.
- [ ] Record observed performance honestly.
- [ ] Run quality gates and record actual results.

## Required commands

```bash
pnpm --filter @chdg/desktop lint
pnpm --filter @chdg/desktop check:architecture
pnpm --filter @chdg/desktop test
pnpm --filter @chdg/desktop typecheck
pnpm --filter @chdg/desktop build
pnpm test
```

## Completion checklist

- [ ] No editing or persistence capability was introduced.
- [ ] No new Electron/preload IPC exists.
- [ ] No new package API exists.
- [ ] No production graphics dependency exists.
- [ ] Existing 2D Preview remains available and unchanged in behavior.
- [ ] Pure timing/projection tests cover defined edge cases.
- [ ] Lifecycle cleanup is tested.
- [ ] Evidence supports a concrete Phase 19B decision.
