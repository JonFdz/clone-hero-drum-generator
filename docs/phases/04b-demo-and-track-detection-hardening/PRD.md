# PRD Phase 04B: Demo and Track Detection Hardening

## Final result

The main demo and drum track detection behavior are aligned with real validation needs.

The demo should use the Eat My Dust sample locally, and MIDI drum auto-detection should avoid false strong drum tracks.

## Why this phase exists

The new demo exposes a track detection issue.

Observed with `samples/demo.mid`:

```txt
Strong Drum Tracks: 10, 28, 53
```

But only track `53` is the clear drum track:

```txt
[53] "" (ch 9): 1039 notes
```

Tracks `10` and `28` are drum-like by note numbers, but are on channel 5 and have empty names. They should not be classified as strong.

## Scope

- Update drum track scoring.
- Make channel 9 a strong signal.
- Make drum-like notes alone a weak signal unless supported by channel/name metadata.
- Keep explicit `--track` behavior unchanged.
- Add tests for this scenario.
- Document the new demo track selection.

## Desired behavior

For the Eat My Dust MIDI export:

```txt
Strong Drum Tracks: 53
Weak Drum Candidates: 10, 28
```

or equivalent.

## Proposed scoring rules

Strong candidate if:

- channel is 9 and drum-like note distribution is realistic;
- or track/instrument name clearly indicates drums/percussion and note distribution is realistic.

Weak candidate if:

- note distribution looks drum-like;
- but channel is not 9;
- and name is empty or not clearly drums/percussion.

Rejected if:

- name clearly indicates guitar/bass/vocals/keys;
- or note distribution is not drum-like.

## Non-goals

- No GPIF import.
- No multi-track drum merge.
- No Pro Drums flags.
- No audio packaging unless part of Phase 04A.

## Validation checklist

- Eat My Dust demo selects track 53 automatically.
- Track 10 and 28 become weak candidates or non-selected.
- Explicit `--track 53` still works.
- Multiple true strong tracks still produce a clear error unless user passes `--track`.
- Tests cover channel 9 vs non-channel-9 drum-like tracks.
