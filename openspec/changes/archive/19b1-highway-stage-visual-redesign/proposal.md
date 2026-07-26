# Proposal: Phase 19B.1 — Highway Stage Visual Redesign

## Problem

Phase 19B established a correct read-only Canvas Highway Preview:

- generated-chart timing remains authoritative;
- the Preview audio clock remains the only playback clock;
- the scene contains exactly four pitched lanes (`red`, `yellow`, `blue`, `green`);
- kick remains a distinct orange horizontal rail rather than a fifth lane;
- squares represent snare/tom-style pitched notes;
- circles represent cymbals;
- accents, ghosts, sustains, reduced motion, HiDPI and resize behavior exist.

However, the visual result is still primarily a functional geometry diagram. The road occupies too much of a wide Canvas, targets are too block-like, kick rails dominate the composition, the camera lacks a focused stage feeling, and the technical HUD competes with the gameplay surface.

## Desired outcome

Create an original **stage-style drum highway visual profile** that feels focused and playable while preserving every Phase 19B semantic rule.

The final composition should exhibit these traits:

- a large dark scene surrounding a narrower road;
- a centered road viewport that does not scale indefinitely with wide windows;
- a lower, compressed horizon and more spacious near field;
- a clear visual hierarchy: road first, notes second, technical metadata last;
- dark outlined targets with colored accents rather than large solid blocks;
- square and circular notes with simple original depth/highlight treatment;
- a thinner, less dominant kick rail;
- subtle beat and measure lines;
- a compact, visually subordinate HUD.

## Scope

### In scope

- Feature-owned Highway visual profile/configuration.
- Highway camera/composition geometry.
- Road width, horizon, hit-line, perspective and depth curve adjustments.
- Stage background treatment using procedural Canvas 2D primitives only.
- Target, note-head, kick-rail, sustain, beat/measure and HUD restyling.
- Projection and renderer refactoring needed to support the profile cleanly.
- Tests for profile invariants and regressions.
- Accessibility wording updates only when the visible composition meaning changes.

### Out of scope

- New chart semantics or modifier meanings.
- Any change to generated `notes.chart` output.
- New Electron/preload/IPC operations.
- Changes to MIDI/GPIF normalization, mapping or chart writing.
- Editing, selection, snapping, persistence, undo/redo or Phase 19C work.
- WebGL, Three.js, rendering engines, shader pipelines, workers, offscreen canvas or runtime dependencies.
- Any copied third-party game visual asset, texture, 3D model, proprietary UI or exact layout.

## Compatibility contract

This phase must preserve:

1. `Chart view` remains the default Preview mode.
2. Highway stays read-only.
3. Four pitched lanes plus one separate kick rail are non-negotiable.
4. Existing Preview audio time remains the only timing authority.
5. Existing source-note semantic adaptation remains the semantic authority.
6. Existing sustain interval visibility rules remain correct.
7. Existing reduced-motion and lifecycle behavior remain correct.
8. Existing Canvas-only architecture remains intact.

## Success criteria

The result is successful when a wide desktop window shows a visually constrained and centered road with substantial surrounding scene space, while a narrow window remains readable without layout feedback loops or clipped geometry. The result must look materially more focused than the Phase 19B baseline without trying to imitate a specific commercial game.
