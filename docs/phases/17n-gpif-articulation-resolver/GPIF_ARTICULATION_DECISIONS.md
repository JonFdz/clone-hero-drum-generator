# GPIF Articulation Decisions — Phase 17N

This document is normative for Phase 17N.

The implementation agent must not invent mappings outside this document. If a GPIF articulation is not covered by output MIDI resolution or by these name patterns, it must remain unknown/candidate and the agent must ask for clarification if needed.

## Resolution priority

```text
1. Project override
2. OutputMidiNumber through 17L MIDI Drum Note Atlas
3. Controlled GPIF Name pattern
4. InputMidiNumbers through 17L MIDI Drum Note Atlas as fallback evidence
5. Unknown
```

## Kick

| Name pattern | Output MIDI | Action | Piece | Confidence | Notes |
|---|---:|---|---|---|---|
| `kick` | 35/36 | map | kick | high | Safe |
| `bass drum` | 35/36 | map | kick | high | Safe |
| `acoustic bass drum` | 35 | map | kick | high | Safe |
| `bass drum 1` | 36 | map | kick | high | Safe |

## Snare

| Name pattern | Output MIDI | Action | Piece | Confidence | Notes |
|---|---:|---|---|---|---|
| `snare` | 38/40 | map | snare | high | Safe |
| `acoustic snare` | 38 | map | snare | high | Safe |
| `electric snare` | 40 | map | snare | high | Safe |
| `side stick` / `sidestick` | 37 | map | snare | high/medium | Same decision as MIDI atlas |
| `cross stick` | 37 | map | snare | high/medium | Same decision as side stick |
| `rimshot` / `rim shot` | 37/38/40/custom | map | snare | high/medium | Use name if drum context |
| `rim` / `snare rim` | 37/38/40/custom | map | snare | medium | Use only if clearly snare/drum context |
| `stick shot` / `stickshot` | custom | candidate | snare | medium | Less certain |

## Hi-hat

| Name pattern | Output MIDI | Action | Piece/Suggested | Confidence | Notes |
|---|---:|---|---|---|---|
| `closed hi-hat` / `closed hihat` | 42 | map | hihat_closed | high | Safe |
| `hi-hat closed` / `hihat closed` | 42 | map | hihat_closed | high | Safe |
| `open hi-hat` / `open hihat` | 46 | map | hihat_open | high | Safe |
| `hi-hat open` / `hihat open` | 46 | map | hihat_open | high | Safe |
| `hi-hat half` / `hihat half` | 46/custom input | map | hihat_open | high if output 46; medium if name-only | Required Decode case |
| `half open hi-hat` / `half-open hi-hat` | 46 | map | hihat_open | high | Treat as open lane |
| `semi-open hi-hat` | 46/custom | map | hihat_open | medium/high | Treat as open lane |
| `loose hi-hat` | 46/custom | map | hihat_open | medium | Treat as open lane |
| `pedal hi-hat` / `foot hi-hat` | 44 | candidate | hihat_closed | medium | Does not generate by default |
| `hi-hat chick` / `hihat chick` | 44/custom | candidate | hihat_closed | medium | Does not generate by default |
| `hi-hat splash` | custom | candidate | hihat_open | low/medium | Do not automap unless output clearly maps |

Required case:

```text
InputMidiNumbers: [92]
Name: Hi-Hat (half)
OutputMidiNumber: 46
=> map hihat_open
```

## Toms

| Name pattern | Output MIDI | Action | Piece | Confidence |
|---|---:|---|---|---|
| `high tom` / `hi tom` | 48/50 | map | tom_high | high |
| `hi-mid tom` / `high-mid tom` | 48 | map | tom_high | high |
| `mid tom` | 47/48 | map | tom_mid | medium/high |
| `low tom` | 45 | map | tom_mid | high |
| `low-mid tom` | 47 | map | tom_mid | high |
| `floor tom` | 41/43 | map | tom_floor | high |
| `low floor tom` | 41 | map | tom_floor | high |
| `high floor tom` | 43 | map | tom_floor | high |

## Crash / Splash / China

| Name pattern | Output MIDI | Action | Piece | Confidence |
|---|---:|---|---|---|
| `crash` | 49/57 | map | crash | high |
| `crash cymbal` | 49/57 | map | crash | high |
| `china` / `chinese` | 52 | map | crash | high |
| `chinese cymbal` | 52 | map | crash | high |
| `splash` / `splash cymbal` | 55 | map | crash | high |
| generic `cymbal` only | unknown/candidate | — | low |

## Ride

| Name pattern | Output MIDI | Action | Piece | Confidence |
|---|---:|---|---|---|
| `ride` | 51/59 | map | ride | high |
| `ride cymbal` | 51/59 | map | ride | high |
| `ride bell` | 53 | map | ride | high |
| `bell ride` | 53 | map | ride | medium/high |
| `ride cup` | 53 | map | ride | medium/high |
| `cup` in ride context | 53/custom | map | ride | medium |
| generic `bell` only | candidate/unknown | — | low |

## Known ignored auxiliary percussion

These must be `ignore` and not unknown.

| Name pattern | Output MIDI | Action | Confidence |
|---|---:|---|---|
| tambourine | 54 | ignore | high |
| vibraslap | 58 | ignore | high |
| agogo | 67/68 | ignore | high |
| cabasa | 69 | ignore | high |
| maracas | 70 | ignore | high |
| whistle | 71/72 | ignore | high |
| guiro | 73/74 | ignore | high |
| cuica | 78/79 | ignore | high |
| triangle | 80/81 | ignore | high |
| shaker | 82 | ignore | high |
| jingle bell | 83 | ignore | high |
| bell tree | 84 | ignore | high |
| castanets | 85 | ignore | high |

## Candidate auxiliary percussion

These are known but do not generate by default.

| Name pattern | Output MIDI | Action | Suggested Piece | Confidence |
|---|---:|---|---|---|
| hand clap / clap | 39 | candidate | snare | medium |
| slap | 28 | candidate | snare | medium |
| sticks / stick | 31 | candidate | snare | medium |
| square click | 32 | candidate | snare | low |
| claves | 75 | candidate | snare | medium |
| high wood block / high woodblock | 76 | candidate | snare | low/medium |
| low wood block / low woodblock | 77 | candidate | snare | low/medium |
| high bongo | 60 | candidate | tom_high | medium |
| low bongo | 61 | candidate | tom_mid | medium |
| mute high conga | 62 | candidate | tom_high | medium |
| open high conga | 63 | candidate | tom_mid | medium |
| low conga | 64 | candidate | tom_floor | medium |
| high timbale | 65 | candidate | tom_high | medium |
| low timbale | 66 | candidate | tom_mid | medium |
| surdo | 86/87 | candidate | tom_floor | medium |

## FX / metronome / non-playable

| Name pattern | Output MIDI | Action | Confidence |
|---|---:|---|---|
| high q | 27 | ignore | high |
| scratch push | 29 | ignore | high |
| scratch pull | 30 | ignore | high |
| metronome click | 33 | ignore | high |
| metronome bell | 34 | ignore | high |
| count-in | custom | ignore | high |
| tap tempo | custom | ignore | high |

`click` is ambiguous:

- output 33/34 -> ignore
- output 31/32 -> candidate snare
- name-only `click` -> candidate/unknown, not auto-map

## Ambiguous terms that must not automap name-only

If these appear without useful output MIDI or context, do not automap:

```text
bell
click
cymbal
tom
drum
percussion
effect
noise
hit
accent
ghost
```

## Conflict handling

If name pattern and output MIDI disagree, produce candidate/review with low confidence and `resolvedVia: conflict`. Do not silent map.

Examples:

```text
Name: Hi-Hat (half)
OutputMidiNumber: 42
=> candidate/review conflict
```

```text
Name: Ride Bell
OutputMidiNumber: 49
=> candidate/review conflict
```

## Required test list

- `Hi-Hat (half)` with input 92/output 46 -> `map hihat_open`.
- `Pedal Hi-Hat` output 44 -> `candidate hihat_closed`.
- `Rimshot` output 37/38 -> `map snare`.
- `Ride Bell` output 53 -> `map ride`.
- `China` output 52 -> `map crash`.
- `Splash` output 55 -> `map crash`.
- `Tambourine` output 54 -> `ignore`.
- `High Bongo` output 60 -> `candidate tom_high`.
- Unknown custom articulation with input 92 and no output/name clue -> `unknown`.
- Conflict: `Hi-Hat (half)` + output 42 -> candidate/review.
- Conflict: `Ride Bell` + output 49 -> candidate/review.
- Override resolves GPIF articulation.
