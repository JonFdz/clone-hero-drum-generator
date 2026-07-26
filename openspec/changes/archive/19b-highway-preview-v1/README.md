# OpenSpec — Phase 19B: Highway Preview v1

- **Issue:** #81 — Phase 19B: Highway Preview v1
- **Depends on:** #80, delivered through PR #85 and merged
- **Status:** Draft for Jon's approval
- **Revision:** 2 — corrected visual highway topology
- **Target change directory:** `openspec/changes/19b-highway-preview-v1`
- **Suggested implementation branch:** `feat/81-highway-preview-v1`

## Why this revision exists

Phase 19A used a five-lane proof-of-concept model: kick plus red, yellow, blue and green were all rendered as parallel lanes. That does not match the intended drum-highway language.

For Highway Preview v1, CHDG SHALL use **four pitched lanes**—red, yellow, blue and green—and a separate **kick rail**:

- kick (`N 0`) is an **orange horizontal bar** spanning the usable road width at its projected depth;
- snare and tom notes are **square heads** in their colored pitched lane;
- cymbal notes are **circular heads** in their colored pitched lane;
- kick is not a fifth vertical lane, does not have a fifth lane divider, and does not receive a fifth rectangular target.

The raw chart grammar still has five base identifiers (`0..4`). “Four-lane” in this OpenSpec means the visual road topology, not a change to Clone Hero Expert Drums data.

## Purpose

Phase 19B promotes the Phase 19A spike into a supported, read-only Highway Preview that faithfully exposes the generated `notes.chart` semantics already available in the project:

- four pitched lanes plus a lane-spanning kick rail;
- square snare/tom heads and circular cymbal heads;
- accent and ghost dynamics where the generated chart expresses them;
- note duration via sustain tails;
- tempo and meter-aware timing lines;
- safe behavior during play, pause, seek, resize and reduced-motion operation.

The existing two-dimensional Chart view remains the default precision and diagnostic surface. This phase is not a chart editor.

## Product decisions fixed by this OpenSpec

1. **Supported but read-only.** The former experimental view becomes `Highway`; it remains non-editable.
2. **Chart view remains default.** It is the precision and diagnostics-first Preview surface.
3. **Four visual lanes.** The road and target row contain only red, yellow, blue and green pitched lanes.
4. **Kick rail.** Base lane `0` is rendered as an orange horizontal bar across the road at its projected depth, not as a fifth vertical lane.
5. **Fixed head shapes.** A non-cymbal red/yellow/blue/green base note is square; a supported cymbal note is circular. Accent and ghost alter emphasis, not the underlying shape class.
6. **Generated chart authority.** Preview semantics come from generated `notes.chart`, never reconstructed from source MIDI or GPIF.
7. **Additive Preview payload.** The bridge gains duration information needed for rendering but remains compatible for existing consumers.
8. **No guessed semantics.** Supported modifiers are cymbal, accent and ghost. Unknown or orphan markers never become playable notes.
9. **Conflict rule.** Accent wins over ghost for the same compatible base note.
10. **No open-hi-hat relabeling.** Yellow cymbal plus accent is rendered as those two flags; it is not named or inferred as a separate articulation.
11. **No automatic playable-note thinning.** Every valid visible base event is represented. Decorative timing lines may be bounded.
12. **No persistence or editing.** Mode, HUD and speed stay feature-local for the session. No edit document, overlay, mutation, save or export behavior is introduced.
13. **Original implementation.** Native Canvas 2D only; no external runtime rendering dependency, copied asset, copied source or copied layout.

## Mandatory SDD workflow

Before implementation:

1. Read `AGENTS.md`, the repository SDD workflow and all files in this OpenSpec.
2. Inspect the merged Phase 19A code and current Preview bridge contracts.
3. Transfer approved requirements, constraints, acceptance criteria and validation requirements from this OpenSpec into Engram **before coding**.
4. Treat Engram as project source of truth. This OpenSpec is the approval/specification input to be reconciled into Engram.
5. Stop and ask when current code, chart grammar, Engram or this OpenSpec conflict. Do not invent a contract to continue.

## In scope

- Additive generated-chart Preview payload enrichment for duration and endpoint timing.
- Pure semantic adaptation of base notes plus supported modifier markers.
- Four-lane road geometry and target row for red/yellow/blue/green.
- Orange, road-spanning kick rail semantics for base lane `0`.
- Square standard/tom note heads, circular cymbal heads, accent and ghost treatment, and sustain tails.
- Existing beat/measure lines and optional technical HUD.
- Supported read-only Highway mode with existing transport controls.
- Tests, documentation and truthful evidence.

## Explicitly out of scope

- Editing, selection, drag/drop, snapping, inspector panels, grid editing, commands or undo/redo.
- Project persistence, edit overlays, save/discard behavior or regenerated-chart reconciliation.
- Changing source MIDI/GPIF interpretation, the generator mapping rules, or chart writer output.
- Lower difficulties, other instruments, double kick, special phrases/fills and unverified modifier semantics.
- A new audio engine, a second playback clock, WebGL, workers or external rendering packages.
- Copied visual assets, copied UI layouts or third-party editor integration.
