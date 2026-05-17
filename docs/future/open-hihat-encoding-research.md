# Future Research: Open Hi-Hat Beyond .chart Accent Convention

## Status

Deferred.

## Current conclusion

No separate `.chart` flag has been found for open hi-hat.

The practical convention for Clone Hero/Moonscraper `.chart` output appears to be:

```txt
hihat_closed -> yellow cymbal
hihat_open   -> yellow cymbal + yellow accent
```

## Future questions

- Does YARG support a richer open hi-hat representation in `.sng`, MIDI, or a YARG-specific extension?
- Do any charting communities use a different convention for open hi-hat?
- Is yellow accent consistently interpreted by players as open hi-hat, or only as a stronger yellow cymbal hit?
- Should CHDG expose `openHihatEncoding` as a user-facing option?

## Non-goals for current implementation

- Do not invent a new `.chart` note number.
- Do not encode open hi-hat differently unless validated in target tools.
