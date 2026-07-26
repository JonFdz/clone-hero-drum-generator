# Proposal: Phase 17B — Real Waveform Preview

## Change ID

`phase-17b-real-waveform-preview`

## Summary

Replace the current placeholder/decorative waveform in Preview with a real decoded audio waveform overview derived from the actual preview audio source.

This improves sync/offset validation without starting a full Timeline or Clone Hero Highway redesign.

## Branch

```txt
fix/phase-17b-real-waveform-preview
```

## Problem

The Preview page currently shows a lightweight placeholder waveform/overview and explicitly says it is not a decoded audio waveform.

This does not help users visually align notes with the song.

## Goals

1. Generate a real waveform overview from the current audio source.
2. Render the waveform in Preview.
3. Align waveform duration with audio/playhead.
4. Show loading/error states.
5. Preserve existing playback and offset behavior.
6. Preserve current timeline/highway functionality.
7. Preserve Electron security boundaries.

## Non-goals

- No Timeline Notes redesign.
- No Clone Hero Highway redesign.
- No Home/Projects redesign.
- No global UI polish.
- No packaging.
- No automatic offset detection.
- No individual note editing.
- No beat detection.
- No spectral analysis.

## Acceptance

- Preview no longer shows placeholder waveform for supported audio.
- Waveform is derived from actual audio.
- Waveform duration aligns with audio.
- Playhead aligns with waveform time.
- Decode/loading failures are handled.
- Existing preview/timeline/highway/offset still work.
- Renderer does not import Node-only APIs.
