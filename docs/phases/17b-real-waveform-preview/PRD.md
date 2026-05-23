# PRD Phase 17B: Real Waveform Preview

## Goal

Replace the current decorative/placeholder waveform in Preview with a real decoded audio waveform overview that helps users visually align the song audio with generated chart notes.

This phase is a bug-fix / functional preview accuracy phase, not a broad Timeline or Clone Hero Highway redesign.

## Roadmap context

```txt
Phase 16A — Project Mapping Overrides
Phase 16B — Mapping Override Profiles
Phase 17A — Desktop Bug Bash
Phase 17B — Real Waveform Preview
Phase 17C — Timeline + Clone Hero Preview UX Redesign
Phase 17D — General UI Polish / Information Architecture
Phase 18  — Desktop Packaging / Distribution
```

This phase is **17B only**.

## Why this exists

Manual desktop testing showed that the Preview page currently displays a lightweight placeholder waveform/overview rather than a decoded waveform from the actual `song.ogg`/audio file.

Observed copy:

```txt
Lightweight preview overview (not decoded audio waveform yet).
```

This makes offset validation and song/note synchronization difficult because users cannot see real audio transients, loud sections, silence, or the relationship between notes and waveform.

## Problem

The current Preview visually implies an audio overview, but it is not real waveform data. That is misleading and not useful enough for synchronization.

Known issues:

```txt
waveform is decorative/placeholder
does not reflect the actual audio file
does not help locate beats/transients
does not help confirm chart/audio offset
preview timeline/highway are still visually rough, but those are separate UI redesign work
```

## Expected behavior

Preview should use real audio data.

At minimum:

```txt
decode/read the current preview audio source
derive a lightweight waveform overview
render amplitude over time
align waveform duration with preview timeline/playhead
show loading/error/empty states
avoid blocking the renderer on large files
```

The user should be able to see the shape of the actual song audio, not a generated placeholder.

## Source of truth

Preview should be based on the same output that Clone Hero receives where possible:

```txt
notes.chart + song.ogg
```

If preview is being shown before generation, it may use the selected audio file, but the UI must make the source clear.

## Scope

- Add real waveform data extraction for local audio preview.
- Prefer output `song.ogg` when generated output exists and preview is post-generation.
- Use selected source audio only when output audio is not available or generation has not run.
- Add a waveform DTO/model suitable for renderer display.
- Render real waveform overview in Preview.
- Align waveform to audio duration/playhead time.
- Add loading/error/empty state.
- Preserve existing audio playback.
- Preserve current Preview timeline and Clone Hero Highway components functionally.
- Preserve offset adjustment behavior.
- Preserve mapping override/profile behavior.
- Preserve Electron security boundaries.

## Non-goals

- No Timeline Notes visual redesign.
- No Clone Hero Highway visual redesign.
- No global UI polish.
- No Home dashboard redesign.
- No Projects library redesign.
- No packaging/distribution.
- No automatic offset detection.
- No individual note editing.
- No external editor integration.
- No cloud/audio upload.
- No advanced spectral analysis.
- No beat detection.
- No automatic tempo detection from audio.

## Waveform requirements

The waveform should be lightweight and suitable for UI rendering.

Recommended representation:

```ts
type WaveformOverview = {
  durationSeconds: number;
  sampleRate?: number;
  channels?: number;
  buckets: Array<{
    startSeconds: number;
    endSeconds: number;
    min: number;
    max: number;
    rms?: number;
  }>;
};
```

Amplitude values should be normalized to a stable range, preferably:

```txt
-1.0 to 1.0 for min/max
0.0 to 1.0 for rms
```

## Extraction strategy

Use the safest existing audio stack.

Preferred order:

```txt
1. Use Web Audio API in the renderer for browser-supported audio if practical.
2. Use an Electron main/preload bridge if decoding must happen in Node.
3. Use ffmpeg only if already configured and appropriate.
```

The implementation must not weaken Electron security.

Renderer must not get direct filesystem access.

## Performance

The waveform overview should be downsampled.

Acceptance target:

```txt
works for normal song-length audio files
does not freeze the app noticeably
does not try to render tens of thousands of DOM nodes
uses canvas/SVG or compact HTML efficiently
```

## Acceptance criteria

- Preview no longer shows placeholder/decorative waveform for supported audio.
- Preview waveform is derived from the actual audio source.
- Waveform duration aligns with audio duration/playhead.
- Loading and decode failure states are handled.
- Renderer does not import Node-only APIs directly.
- Existing audio playback still works.
- Existing timeline/highway still render.
- Existing offset loop still works.
- Existing generation/validation/mapping flows still work.
- Tests cover waveform model/normalization/downsampling where practical.
