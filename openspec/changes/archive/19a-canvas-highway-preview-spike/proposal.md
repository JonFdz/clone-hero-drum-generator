# Proposal — Canvas Highway Preview Spike

## Why

CHDG's current Preview provides useful waveform, timing diagnostics, sections and a precise two-dimensional chart view. It does not yet offer a perspective-based playtest view that lets a user quickly judge whether a generated drum pattern will read naturally at gameplay speed.

The product opportunity is a second, complementary visual mode:

- The existing two-dimensional chart remains the precision and diagnostic surface.
- The new experimental highway is a playback-oriented review surface.
- Neither view replaces the other in this phase.

The uncertainty is not whether a canvas can draw a road. The uncertainty is whether a five-lane view can be synchronized, musically coherent and visually useful using CHDG's existing Preview data without opening a much larger editing project.

## Outcome

Add an **Experimental Highway** mode to Preview. It renders generated Expert Drums on a native Canvas 2D road in perspective, synchronized to the existing audio/playback state.

The mode must display:

- five lanes: kick, red, yellow, blue and green;
- a horizon, road boundaries, lane dividers and a hit line;
- future notes approaching the hit line;
- beat lines and stronger measure lines when the timing map is usable;
- a compact technical HUD showing time, tick, beat, measure and sampled FPS;
- a small in-memory control for highway speed / look-ahead.

## Decision summary

| Decision | Chosen approach | Rationale |
|---|---|---|
| Rendering technology | Native Canvas 2D | Small, deterministic rendering surface; no production graphics dependency for a five-lane spike |
| Playback authority | Existing Preview playback time | The renderer visualizes the existing audio lifecycle; it must not create a second clock |
| Animation cadence | `requestAnimationFrame` for redraw only | The renderer redraws from supplied playback time, never accumulates simulated song time from frames |
| Existing Preview | Remains available | The two-dimensional view is still the reliable timing/diagnostic surface |
| Data scope | Existing Preview payload only | Avoid Electron/preload/domain changes until the spike proves value |
| Lane model | Five generated chart lanes | Matches generated drum-chart output without inventing a second drum model |
| Modifiers and sustains | Explicitly deferred | Existing preview events do not yet guarantee enough data for faithful rendering |
| Editing | Excluded | Editing needs a separate effective-chart, history and persistence design |
| Preferences | In-memory only | The spike must not introduce project/document persistence |

## In scope

1. A feature-owned Canvas component, renderer and pure projection/timing helpers.
2. An experimental mode switch inside the existing Preview experience.
3. Five-lane note rendering from current generated preview events.
4. Musical line/HUD projection based on usable generated tempos and time signatures.
5. Playback, pause, seek and component lifecycle integration.
6. High-DPI sizing, resize handling, reduced-motion behavior and a non-canvas text summary.
7. Focused tests and implementation evidence.

## Out of scope

- Any mutation of `notes.chart`, generated output, project files or mapping data.
- Editing, selection, drag/drop, keyboard authoring, snap, inspector panels, undo/redo or persistence.
- Sustains, cymbal/tom distinction, ghost/accent visuals, unless existing Preview data already provides those values without contract changes. The baseline assumption is that it does not.
- Tempo, time-signature or section editing.
- New Electron/preload IPC, new package APIs, or changes under `packages/*`.
- Graphics engines, WebGL, worker/off-main-thread rendering, shaders or external rendering packages.
- Copying external assets, layouts, iconography, code or visual identity.

## Success criteria

The spike is considered successful when all of the following are true:

1. The highway is visually legible at ordinary desktop sizes.
2. It remains stable through repeated play, pause and seek interactions.
3. A known synthetic timing fixture verifies tick, beat and measure values.
4. The Canvas backing store is crisp on high-DPI displays.
5. The renderer can be destroyed without leaking animation frames or resize observers.
6. The existing Preview view and timing diagnostics remain behaviorally unchanged.
7. Evidence can support a clear go/no-go decision for Phase 19B.

## Non-success outcomes that are still valuable

The spike may conclude that the highway should not proceed unchanged. Valid evidence includes:

- timing data is insufficient for trustworthy musical HUD values without a contract change;
- dense charts are not readable at the selected window size;
- the renderer causes unacceptable desktop jank;
- the existing two-dimensional view remains the superior review experience.

A negative conclusion is preferable to silently expanding the spike into unplanned work.
