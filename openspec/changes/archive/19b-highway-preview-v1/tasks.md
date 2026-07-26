# Tasks — Highway Preview v1

## 0. Preconditions and SDD transfer

- [ ] Read `AGENTS.md`, the relevant SDD workflow, issue #81 and every file in this OpenSpec.
- [ ] Inspect merged Phase 19A implementation and the current Preview bridge/parser/chart writer contracts.
- [ ] Transfer accepted decisions, constraints, task plan and verification criteria into Engram before coding.
- [ ] Verify no current Engram requirement conflicts with the four-pitched-lane plus kick-rail topology.
- [ ] Stop and ask before coding if an approved source conflicts or a required file is unavailable.

## 1. Enrich Preview transport data

- [ ] Introduce/reuse `ChartPreviewNoteEvent` with `tick`, `lane`, `length`, `seconds`, `endSeconds`.
- [ ] Update the Expert Drums Preview parser to retain `length` from `N <lane> <length>`.
- [ ] Accept only non-negative integer tick/lane/length values from generated chart grammar.
- [ ] Compute `endSeconds` from `tick + length` using the existing generated-chart timing path.
- [ ] Preserve raw modifier entries for semantic adaptation.
- [ ] Keep existing Chart Preview consumers compatible.
- [ ] Update all affected bridge types, preload-facing types and safe fixtures consistently.
- [ ] Add parser tests for taps, sustains, tempo-crossing sustains, malformed entries, deterministic sorting, modifier preservation and chart/Preview offset separation.

## 2. Add pure semantic adaptation

- [ ] Add a feature-owned semantic adapter under `features/preview/highway/`.
- [ ] Create one semantic note per valid base chart lane `0..4`.
- [ ] Map base `0` to `kick-rail`, with no pitched lane.
- [ ] Map bases `1..4` to four pitched lanes: red, yellow, blue, green.
- [ ] Use square visual kind for non-cymbal pitched notes.
- [ ] Use circle visual kind only for valid yellow/blue/green cymbal markers.
- [ ] Apply same-tick accent markers for compatible non-kick lanes.
- [ ] Apply same-tick ghost markers for compatible non-kick lanes.
- [ ] Enforce accent-over-ghost precedence.
- [ ] Preserve duplicate base events as distinct deterministic occurrences.
- [ ] Ignore orphan, unknown, special and malformed events as playable notes.
- [ ] Add tests for all base lanes, four-lane mapping, kick-rail mapping, cymbal cases, dynamic conflicts, orphans, unknowns and duplicates.

## 3. Replace five-parallel-lane geometry with four pitched lanes plus kick rail

- [ ] Replace any `five lane` geometry invariant in Highway code with explicit four pitched lanes plus separate kick rail semantics.
- [ ] Make road divider count and hit-target count exactly four pitched lanes / three internal dividers.
- [ ] Remove any fifth kick center or fifth kick target from Highway geometry/model/renderer.
- [ ] Add a pure projection function for a road-spanning kick rail.
- [ ] Ensure the kick rail spans road interior with safe depth-aware inset.
- [ ] Keep red/yellow/blue/green lane centers ordered and inside road bounds.
- [ ] Recalculate minimum-readable thresholds for four pitched lanes.
- [ ] Change visible-note filtering to interval intersection so long notes/tails entering the viewport are not incorrectly omitted.
- [ ] Add geometry/projection tests for four lane centers, three dividers, no kick center, kick rail bounds and interval visibility.

## 4. Add duration tails and fixed shape rendering

- [ ] Extend projected note/frame types to represent semantic visual kind and optional sustain geometry.
- [ ] Project pitched sustain tails inside the pitched lane.
- [ ] Project kick sustain as a clipped orange road-spanning band.
- [ ] Use square Canvas drawing for standard/snare/tom-style pitched notes.
- [ ] Use circular Canvas drawing for supported cymbals.
- [ ] Use horizontal orange bar drawing for kicks.
- [ ] Draw accent/ghost as layered emphasis/subdued treatments without changing the required square/circle/rail identity.
- [ ] Draw tails/bands before corresponding rails/heads.
- [ ] Ensure rails and heads remain readable at the hit line.
- [ ] Add mocked-context renderer tests for square, circle, kick rail, accent, ghost, combined cymbal+accent, sustain draw ordering and clipping fallback.

## 5. Promote UI to supported read-only Highway

- [ ] Rename user-facing experimental wording to `Highway` wording.
- [ ] Keep `Chart view` as the default mode.
- [ ] Keep Highway controls session-local.
- [ ] Do not add edit, selection or persistence controls.
- [ ] Verify mode switches preserve current time, playback state, Preview offset, chart data and diagnostics.
- [ ] Verify inactive Highway does not retain RAF or resize work.
- [ ] Ensure accessible status is stable and not per-frame live-announced.

## 6. Preserve timing and lifecycle guarantees

- [ ] Preserve existing Preview audio clock as the sole authority.
- [ ] Preserve reduced-motion behavior from Phase 19A.
- [ ] Verify initial load, play, pause, seek, resize, data reload, offset change, mode switch, preset change and HUD change.
- [ ] Cancel Canvas RAF on destroy.
- [ ] Disconnect `ResizeObserver` on destroy.
- [ ] Do not add polling, a new clock or a render worker.
- [ ] Update component/page tests for regressions.

## 7. Documentation and evidence

- [ ] Add `docs/phases/19b-highway-preview-v1/CHECKLIST.md`.
- [ ] Add `docs/phases/19b-highway-preview-v1/EVIDENCE.md`.
- [ ] Document the raw Preview note contract.
- [ ] Document that raw chart lanes stay `0..4` while visual geometry is four pitched lanes plus kick rail.
- [ ] Document exact supported square/circle/kick-rail shape semantics.
- [ ] Document unsupported semantics and non-goals.
- [ ] Record actual commands/results and separate automated from manual evidence.
- [ ] Keep Phase 19A documentation historically accurate.

## 8. Validate

Run, when the environment permits:

```bash
pnpm --filter @chdg/desktop lint
pnpm --filter @chdg/desktop check:architecture
pnpm --filter @chdg/desktop test
pnpm --filter @chdg/desktop typecheck
pnpm --filter @chdg/desktop build
pnpm test
```

- [ ] Run focused Electron Preview-data tests.
- [ ] Run focused semantic, projection, renderer, timing, component and Preview-page tests.
- [ ] Run required commands or document exact blockers and truthful equivalents.
- [ ] Manually validate in desktop app with safe generated/fixture content:
  - [ ] Chart view remains default.
  - [ ] Four pitched targets are red/yellow/blue/green only.
  - [ ] Kick displays as orange road-spanning rail, not fifth lane/target.
  - [ ] Snare/tom-style hits are square.
  - [ ] Supported cymbals are circular.
  - [ ] Accent/ghost remain readable without changing square/circle identity.
  - [ ] Pitched and kick sustain tails remain aligned across a tempo change.
  - [ ] Play/pause/seek/mode switching remain synchronized.
  - [ ] Reduced motion does not continuously animate.
  - [ ] Resize/high-DPI remains legible.
  - [ ] No project/chart mutation occurs.
- [ ] Update Engram with implementation facts, deviations and validation outcomes.

## 9. Delivery

- [ ] Re-read issue #81, approved OpenSpec and Engram.
- [ ] Confirm no Phase 19C+ behavior exists.
- [ ] Confirm no external dependency, copied asset or copied layout exists.
- [ ] Create one PR against `main` with `Closes #81`.
- [ ] Do not self-review, self-approve, request review or merge.
