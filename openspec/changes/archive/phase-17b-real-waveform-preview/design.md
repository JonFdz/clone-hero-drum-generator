# Design: Phase 17B — Real Waveform Preview

## Overview

Add a real waveform overview to Preview.

The waveform should be derived from the actual audio and rendered efficiently.

## Model

Recommended model:

```ts
export type WaveformBucket = {
  startSeconds: number;
  endSeconds: number;
  min: number;
  max: number;
  rms?: number;
};

export type WaveformOverview = {
  durationSeconds: number;
  sampleRate?: number;
  channels?: number;
  buckets: WaveformBucket[];
};
```

## Extraction

Preferred implementation should use browser-safe APIs where possible.

Options:

```txt
Web Audio API decodeAudioData in renderer
narrow Electron bridge that returns decoded/downsampled overview
ffmpeg-based extraction only if already supported and secure
```

Do not expose generic file access.

## Downsampling

Convert raw samples into a fixed number of buckets.

For each bucket:

```txt
min sample amplitude
max sample amplitude
optional rms
start/end time
```

For stereo/multichannel audio, combine channels safely, for example by averaging or taking max absolute amplitude per sample.

## Rendering

Use an efficient rendering approach.

Acceptable:

```txt
canvas
svg polyline/path
compact div bars
```

Avoid large DOM node counts.

## Loading and errors

Preview should show:

```txt
loading waveform
waveform unavailable/decode failed
audio source label
duration
```

Decode failure must not break Generate/Preview pages.

## Security

Renderer must not use direct Node APIs.

If file path access is needed, use existing desktop bridge patterns and validate paths.

## Tests

Add pure tests for waveform utility code:

```txt
bucket count
min/max normalization
silence
finite values
duration alignment
```
