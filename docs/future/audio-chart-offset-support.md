# Future Work: Audio/Chart Offset Support

## Status

Deferred.

## Context

During Phase 05 Moonscraper validation, the generated chart and audio loaded correctly and Pro Drums cymbals displayed as expected. The only manual adjustment needed was where the song starts.

This appears to be a fixed start offset between the symbolic source and the audio file, not a tempo drift problem.

## Future requirements to consider

- Add CLI support for an offset option, for example `--offset-ms`.
- Decide whether the offset should be represented through `[Song] Offset` or by shifting note events.
- Ensure offset behavior is documented and tested.
- Expose offset adjustment in the future desktop UI.
- Keep the default behavior unchanged when no offset is provided.

## Non-goals for now

- No automatic audio alignment.
- No tempo drift correction.
- No waveform analysis.
- No audio-to-chart transcription.
