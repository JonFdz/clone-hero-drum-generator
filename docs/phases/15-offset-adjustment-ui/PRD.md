# PRD Phase 15: Offset Adjustment Loop

## Goal

Add a safe, local offset adjustment loop to CHDG Desktop.

The user should be able to preview chart/audio alignment, tweak offset in milliseconds, and apply the offset to the project and generated chart without manually editing `notes.chart`.

## Roadmap context

```txt
Phase 14A — Audio + Waveform + Timeline Preview
Phase 14B — Clone Hero Highway Preview
Phase 15  — Offset Adjustment Loop
```

This phase builds on Phase 14A/14B preview.

## Why this exists

Offset is critical for Clone Hero chart usability.

CHDG already generates `notes.chart`, `song.ini`, and `song.ogg`, and the preview can show audio/timeline/highway. The next step is an in-app loop for aligning chart timing with audio.

The app should move toward self-sufficiency and reduce dependency on external editors for basic alignment checks.

## Source of truth

Offset semantics are defined by `docs/desktop/decisions.md`:

```txt
UI uses milliseconds.
Chart uses seconds.
Offset is stored in notes.chart [Song] Offset.
Offset does not shift note/event ticks.
Offset adjustment should preview live without writing files.
Save should update the chart/project when the user confirms.
If source/track/audio changes, keep state but mark preview/generation/validation as outdated.
UI wording should describe chart offset, not audio shifting.
```

## Scope

- Add offset adjustment controls to the Preview page.
- Reuse Phase 14A audio playback/current time.
- Reuse Phase 14B highway and timeline preview.
- Show current project offset in milliseconds.
- Add preview offset state separate from saved/project offset.
- Allow quick adjustment buttons:
  - `-100 ms`
  - `-50 ms`
  - `-10 ms`
  - `+10 ms`
  - `+50 ms`
  - `+100 ms`
- Allow manual offset input in milliseconds.
- Apply preview offset visually to timeline/highway alignment without immediately writing files.
- Provide reset/revert to saved offset.
- Provide apply/save action that updates:
  - `.chdg` project offset;
  - generated `notes.chart` `[Song] Offset` when generated output exists and is allowed.
- Convert milliseconds to chart seconds:
  - `900 ms -> 0.9`
  - `-120 ms -> -0.12`
- Mark project dirty when preview offset differs from saved offset.
- Mark output status appropriately after applying/saving offset.
- Preserve validation/generation/project behavior.
- Preserve Electron security boundaries.

## Required UX

The UI must make it clear that this is **chart offset**, not audio shifting.

Suggested wording:

```txt
Chart Offset
Adjusts notes.chart [Song] Offset. Notes are not moved; audio is not modified.
```

Required controls:

```txt
current saved offset
preview offset
delta from saved
quick nudge buttons
manual ms input
reset/revert button
apply/save offset button
```

## Offset states

Use explicit state concepts:

```txt
savedOffsetMs
previewOffsetMs
offsetDirty = previewOffsetMs !== savedOffsetMs
```

The preview should use `previewOffsetMs`.

The project/generated output should only be updated when the user confirms apply/save.

## Preview behavior

Phase 15 should visually preview offset by adjusting note timing relative to audio playback.

Do not shift audio playback.

Do not rewrite note ticks.

Do not move individual notes.

Recommended display behavior:

```txt
effectiveNoteTime = noteTime + previewOffsetMs / 1000
```

Use the same effective timing for:

```txt
timeline notes
highway notes
near-current note highlight
```

The exact sign must match generated `notes.chart` `Offset` behavior used by CHDG. Add tests documenting the chosen sign.

## Apply/save behavior

When the user applies offset:

1. Update desktop generation/project state offset in milliseconds.
2. Persist offset in `.chdg` through existing project save flow.
3. If a generated `notes.chart` exists, update only `[Song] Offset` through a narrow Electron bridge method.
4. Do not rewrite arbitrary files.
5. Do not regenerate audio.
6. Do not shift note/event ticks.

If generated chart update fails, show an error and keep the user-facing state consistent.

## Chart update security

Renderer must not read/write arbitrary files.

Electron main/preload must expose only a narrow operation such as:

```ts
applyChartOffset(input: {
  outputDir: string;
  chartPath?: string;
  offsetMs: number;
}): Promise<JsonEnvelope<{ chartPath: string; offsetSeconds: number }>>
```

Exact name can follow repo style.

The handler must validate:

```txt
chart path is notes.chart
chart path belongs to selected/allowed output folder
output folder is allowed
offsetMs is finite
```

## Validation integration

Phase 13 validation already knows about offset shape.

Phase 15 should ensure:

```txt
invalid offset input is shown as UI error
invalid offset cannot be applied
valid preview offset does not block preview
applied offset updates validation/generate state
```

## Non-goals

- No automatic offset detection.
- No beat/onset analysis.
- No audio stretching/time manipulation.
- No note editing.
- No manual note add/remove/move.
- No mapping override UI.
- No mapping profiles.
- No gameplay/scoring.
- No packaging/distribution.
- No full desktop UX polish pass.
- No external editor/Moonscraper dependency.

## Acceptance criteria

- Preview page shows Chart Offset controls.
- Quick nudge buttons update preview offset.
- Manual ms input updates preview offset.
- Preview offset changes timeline/highway alignment live.
- Reset/revert restores saved offset.
- Apply/save updates project offset.
- Apply/save updates generated `notes.chart` `[Song] Offset` when output exists.
- `900 ms` is written as `0.9` in `notes.chart`.
- Notes/events ticks are not shifted.
- Project dirty state behaves correctly.
- Validation page still works.
- Generate page still works.
- Project save/load still works.
- Electron security boundaries are preserved.
