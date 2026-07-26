# Tasks: Phase 19B.1 — Highway Stage Visual Redesign

## 0. Mandatory preparation

- [ ] Read `AGENTS.md`, current SDD workflow documentation, this OpenSpec, and current Engram memory.
- [ ] Transfer/reconcile this OpenSpec into Engram before modifying implementation code.
- [ ] Inspect current merged Highway code and current tests.
- [ ] Confirm the branch begins from current `main` and worktree is clean.
- [ ] Stop and ask if the implementation baseline is not the merged Phase 19B behavior.

## 1. Establish the visual-profile boundary

- [ ] Add a feature-owned visual-profile module in `apps/desktop/src/app/features/preview/highway/`.
- [ ] Define a named stage profile controlling scene viewport, road, projection, targets, notes and HUD values.
- [ ] Remove duplicated visual-geometry literals from projection/renderer where the profile should own them.
- [ ] Keep semantic lane data and chart semantics outside the visual profile.
- [ ] Add unit tests for profile-backed geometry invariants.

## 2. Rework scene and road geometry

- [ ] Make road viewport width bounded and centered inside the full Canvas.
- [ ] Preserve safe behavior across narrow, ordinary and wide canvas sizes.
- [ ] Tune horizon/hit-line placement for a deeper stage composition.
- [ ] Replace anonymous depth tuning with a named, profile-driven monotonic curve.
- [ ] Ensure all road-bound calculations reuse the same geometry source.
- [ ] Preserve four lane centers, three dividers and four targets.
- [ ] Preserve the separate kick rail with no fifth lane geometry.

## 3. Restyle procedural Canvas rendering

- [ ] Add an original dark stage background treatment using Canvas primitives/gradients only.
- [ ] Restyle road border/fill without using images or copied visual assets.
- [ ] Make beat/measure lines less visually dominant while retaining measure distinction.
- [ ] Restyle targets to dark interiors with lane-colored outlines/highlights.
- [ ] Render square pitched notes with a small original dimensional highlight/shadow treatment.
- [ ] Render circular cymbals with an original disc/ring/highlight treatment.
- [ ] Make kick rails thinner and visually subordinate to pitched notes while preserving orange identity.
- [ ] Keep sustain bands behind note heads/rails and road-clipped.
- [ ] Retain accent and ghost distinction over square/circle identities.

## 4. HUD, accessibility and controls

- [ ] Set stage-profile HUD default to hidden unless current UX constraints require a documented alternative.
- [ ] Preserve the feature-local HUD toggle and session-only behavior.
- [ ] Render enabled HUD compactly in a non-obstructive corner without a large opaque card.
- [ ] Keep Canvas accessible summary stable and descriptive.
- [ ] Keep `Chart view` as default and Highway explicitly read-only.

## 5. Regression protection

- [ ] Update projection tests for centered scene viewport and bounded road width on a wide Canvas.
- [ ] Test geometry remains valid on narrow and ordinary Canvas sizes.
- [ ] Test four pitched centers, three dividers, four targets, and no fifth target/center remain true.
- [ ] Test kick rail bounds remain inside road bounds at near and far depths.
- [ ] Test monotonic finite depth projection.
- [ ] Test square/circle/kick rendering paths still execute.
- [ ] Test target, sustain, accent and ghost draw ordering/identity remains intact.
- [ ] Keep current ResizeObserver content-box regression coverage.
- [ ] Keep reduced-motion and destroy-cleanup coverage.

## 6. Validation and delivery

- [ ] Run all required automated validation commands.
- [ ] Perform manual visual validation at wide, ordinary and narrow window sizes.
- [ ] Confirm stable idle height and no resize feedback loop.
- [ ] Confirm visual outcome remains original and contains no third-party assets or copied layouts.
- [ ] Record actual implementation and validation results in Engram.
- [ ] Create one PR only after validation; do not request review, approve, merge, or close anything.

## 7. Visual-direction documentation

- [ ] Read `visual-direction.md`, `reference-observations.md`, and `CHANGELOG.md` before implementation.
- [ ] Create `docs/reference/highway-stage-visual-language.md` as a durable original design-language reference.
- [ ] Create `docs/reference/highway-stage-visual-validation.md` as a durable manual validation/reference checklist.
- [ ] State in those documents that planning screenshots are external direction only and must not be committed, embedded, or recreated pixel-for-pixel.
- [ ] Ensure the documents describe the four pitched lanes plus separate kick rail topology and do not reintroduce a fifth lane.
