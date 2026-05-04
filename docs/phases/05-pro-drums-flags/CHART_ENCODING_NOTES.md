# Phase 05 Pro Drums Flag Encoding Notes

These notes supplement `PRD.md` for Phase 05.

## Confirmed cymbal flag encoding

Cymbals are encoded by writing the base lane note plus a cymbal flag at the same tick.

```txt
yellow cymbal = base N 2 0 + flag N 66 0
blue cymbal   = base N 3 0 + flag N 67 0
green cymbal  = base N 4 0 + flag N 68 0
```

Example:

```txt
1536 = N 2 0
1536 = N 66 0
```

This represents a yellow cymbal hit.

## Confirmed ghost encoding

Observed:

```txt
red ghost = base N 1 0 + flag N 40 0
```

Only red ghost has been confirmed from the inspected chart so far.

Do not invent unconfirmed ghost flags for other lanes.

## Accent notes

Accent encoding is not confirmed yet.

Before implementing accent notes, confirm the exact chart encoding through Moonscraper, Clone Hero-compatible references, or source-code review.

## Implementation rule

Phase 05 should only implement flags whose encoding is confirmed.

If a requested flag is not confirmed, document it as pending instead of guessing.
