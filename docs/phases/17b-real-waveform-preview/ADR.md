# ADR Phase 17B: Real Waveform Preview

## Status

Proposed.

## Decision

Implement a real decoded waveform overview in Preview, replacing the current placeholder waveform.

This is treated as a functional preview bug fix because the existing display is not based on actual audio and does not help users synchronize notes with the song.

## Roadmap boundary

```txt
Phase 17B — Real Waveform Preview
Phase 17C — Timeline + Clone Hero Preview UX Redesign
```

Phase 17B must not become a full Preview UI redesign.

## Context

CHDG now supports generation, preview, offset adjustment, mapping overrides, and mapping profiles.

Manual testing showed that the waveform area is a placeholder and does not provide useful sync information.

## Decision details

Add a lightweight waveform overview model derived from the actual audio file.

The waveform should be rendered in the existing Preview screen and aligned to the current playback/playhead time.

## Source decision

Post-generation preview should prefer:

```txt
song.ogg
```

because it is the audio Clone Hero receives.

If generated output is unavailable, the preview may use the selected project audio path, with clear labeling.

## Security decision

Do not add direct filesystem access to Angular renderer.

Do not expose generic file read bridges.

Any Electron bridge for waveform/audio must be narrow and path-validated using existing project/audio allowlist patterns.

## Rendering decision

Use a lightweight overview, not full raw sample rendering.

Downsample audio into buckets:

```txt
min
max
optional rms
time range
```

Render efficiently.

## Non-goals

- No timeline redesign.
- No Clone Hero Highway redesign.
- No automatic offset detection.
- No beat/transient detection.
- No spectral view.
- No packaging.
- No note editing.

## Constraints

- Keep local/offline behavior.
- Preserve existing preview/audio playback.
- Preserve Electron security.
- Preserve Phase 16A/16B mapping behavior.
- Keep PR scoped to waveform preview only.
