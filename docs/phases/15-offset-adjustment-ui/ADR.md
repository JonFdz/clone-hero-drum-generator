# ADR Phase 15: Offset Adjustment Loop

## Status

Proposed.

## Decision

Implement offset adjustment as a preview-first loop with explicit apply/save.

Offset is edited in milliseconds in the UI, but stored in generated `notes.chart` as seconds in `[Song] Offset`.

The preview applies the offset visually to note timing relative to audio playback. It does not move note ticks and does not modify audio.

## Roadmap boundary

```txt
Phase 14A — Audio + Waveform + Timeline Preview
Phase 14B — Clone Hero Highway Preview
Phase 15  — Offset Adjustment Loop
```

Phase 15 must not become a note editor or automatic offset detector.

## Rationale

Users need to align generated Clone Hero charts with audio. Doing this inside CHDG is more convenient and moves the app away from requiring Moonscraper for basic alignment.

A preview-first workflow avoids writing files on every nudge and makes it safer to experiment.

## Offset model

Use:

```txt
savedOffsetMs
previewOffsetMs
offsetDirty
```

- `savedOffsetMs` comes from project/generation state.
- `previewOffsetMs` drives local preview.
- `offsetDirty` indicates unsaved offset changes.

## Persistence decision

When the user applies offset:

```txt
update .chdg state
update generated notes.chart [Song] Offset if generated output exists
```

Generated `notes.chart` update should be narrow and safe.

Do not rewrite `song.ogg`.

Do not rewrite notes/events.

Do not shift chart ticks.

## Security decision

No generic file write bridge.

Use a narrow Electron operation that only updates `notes.chart` in an allowed output folder and only changes `[Song] Offset`.

The renderer must not use `fs`.

The renderer must not construct arbitrary file URLs.

## Sign decision

The implementation must document and test the sign convention used for preview.

The generated chart already writes offset as seconds:

```txt
offsetSeconds = offsetMs / 1000
```

Preview should apply the same sign so what the user sees matches what is written to `notes.chart`.

## Constraints

- Keep everything local/offline.
- Preserve existing validation/generation/project behavior.
- Preserve existing preview behavior.
- Do not introduce external services.
- Do not implement automatic detection.
- Do not implement note editing.
- Do not implement mapping overrides.
- Final PR review is external.
- PRs must not be merged without explicit approval.
