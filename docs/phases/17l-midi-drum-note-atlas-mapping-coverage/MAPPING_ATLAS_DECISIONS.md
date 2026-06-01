# Mapping Atlas Decisions — Phase 17L

This file is normative for Phase 17L. The implementation agent must not invent mappings that conflict with this table. If a mapping seems wrong or incomplete, stop and ask Jon.

## Action semantics

| Action | Generates by default? | User visible? | Overrideable? |
|---|---:|---:|---:|
| `map` | Yes | Yes | Yes |
| `candidate` | No | Yes | Yes |
| `ignore` | No | Yes, low-noise | Yes |
| `unknown` | No | Yes, warning/status | Yes |

## General MIDI 35–81

| Note | Name | Action | Piece / Suggested piece | Confidence | Family | Reason |
|---:|---|---|---|---|---|---|
| 35 | Acoustic Bass Drum | map | kick | high | kick | Standard kick drum. |
| 36 | Bass Drum 1 | map | kick | high | kick | Standard kick drum. |
| 37 | Side Stick | map | snare | high | snare | Rim/side-stick belongs to snare lane in CHDG. |
| 38 | Acoustic Snare | map | snare | high | snare | Standard snare. |
| 39 | Hand Clap | candidate | snare | medium | snare | Often layered with snare, but may be auxiliary percussion. |
| 40 | Electric Snare | map | snare | high | snare | Standard snare/rimshot-like drum sound. |
| 41 | Low Floor Tom | map | tom_floor | high | tom | Standard floor tom. |
| 42 | Closed Hi-Hat | map | hihat_closed | high | hihat | Standard closed hi-hat hand note. |
| 43 | High Floor Tom | map | tom_floor | high | tom | Standard floor tom. |
| 44 | Pedal Hi-Hat | candidate | hihat_closed | medium | hihat | Foot hi-hat/chick may not represent a playable hand note and can over-densify charts. |
| 45 | Low Tom | map | tom_mid | high | tom | Standard low/mid tom. |
| 46 | Open Hi-Hat | map | hihat_open | high | hihat | Standard open hi-hat hand note. |
| 47 | Low-Mid Tom | map | tom_mid | high | tom | Standard mid tom. |
| 48 | Hi-Mid Tom | map | tom_high | high | tom | Standard high/mid tom. |
| 49 | Crash Cymbal 1 | map | crash | high | cymbal | Standard crash. |
| 50 | High Tom | map | tom_high | high | tom | Standard high tom. |
| 51 | Ride Cymbal 1 | map | ride | high | cymbal | Standard ride. |
| 52 | Chinese Cymbal | map | crash | high | cymbal | No separate china lane; crash is closest CH drum lane. |
| 53 | Ride Bell | map | ride | high | cymbal | Ride bell belongs to ride lane. |
| 54 | Tambourine | ignore | — | high | aux-percussion | Auxiliary percussion, not a default CH drum lane. |
| 55 | Splash Cymbal | map | crash | high | cymbal | Splash reduces to crash lane. |
| 56 | Cowbell | candidate | — | low | aux-percussion | No natural lane; may be important in some songs. |
| 57 | Crash Cymbal 2 | map | crash | high | cymbal | Standard crash. |
| 58 | Vibraslap | ignore | — | high | aux-percussion | Auxiliary percussion / effect. |
| 59 | Ride Cymbal 2 | map | ride | high | cymbal | Standard ride. |
| 60 | High Bongo | candidate | tom_high | low | aux-percussion | Could be reduced to high tom if musically important. |
| 61 | Low Bongo | candidate | tom_mid | low | aux-percussion | Could be reduced to mid tom if musically important. |
| 62 | Mute High Conga | candidate | tom_high | low | aux-percussion | Could be reduced to high tom if musically important. |
| 63 | Open High Conga | candidate | tom_mid | low | aux-percussion | Could be reduced to mid tom if musically important. |
| 64 | Low Conga | candidate | tom_floor | low | aux-percussion | Could be reduced to floor tom if musically important. |
| 65 | High Timbale | candidate | tom_high | medium | aux-percussion | Can behave like a tom in some arrangements. |
| 66 | Low Timbale | candidate | tom_mid | medium | aux-percussion | Can behave like a tom in some arrangements. |
| 67 | High Agogo | ignore | — | high | aux-percussion | Auxiliary percussion, no natural CH lane. |
| 68 | Low Agogo | ignore | — | high | aux-percussion | Auxiliary percussion, no natural CH lane. |
| 69 | Cabasa | ignore | — | high | aux-percussion | Auxiliary percussion. |
| 70 | Maracas | ignore | — | high | aux-percussion | Auxiliary percussion. |
| 71 | Short Whistle | ignore | — | high | fx | Whistle/effect, not drum lane. |
| 72 | Long Whistle | ignore | — | high | fx | Whistle/effect, not drum lane. |
| 73 | Short Guiro | ignore | — | high | aux-percussion | Auxiliary percussion. |
| 74 | Long Guiro | ignore | — | high | aux-percussion | Auxiliary percussion. |
| 75 | Claves | candidate | snare | low | aux-percussion | Could be rim/click-like, but not safe to auto-map. |
| 76 | High Wood Block | candidate | snare | low | aux-percussion | Could be rim/click-like, but not safe to auto-map. |
| 77 | Low Wood Block | candidate | snare | low | aux-percussion | Could be rim/click-like, but not safe to auto-map. |
| 78 | Mute Cuica | ignore | — | high | aux-percussion | Auxiliary percussion/effect. |
| 79 | Open Cuica | ignore | — | high | aux-percussion | Auxiliary percussion/effect. |
| 80 | Mute Triangle | ignore | — | high | aux-percussion | Auxiliary percussion. |
| 81 | Open Triangle | ignore | — | high | aux-percussion | Auxiliary percussion. |

## Extended GM2/GS-style 27–34 and 82–87

| Note | Name | Action | Piece / Suggested piece | Confidence | Family | Reason |
|---:|---|---|---|---|---|---|
| 27 | High Q | ignore | — | high | fx | Digital/effect percussion, not a drum lane. |
| 28 | Slap | candidate | snare | low | digital | Could be snare/rim-like in some sources. |
| 29 | Scratch Push | ignore | — | high | fx | Scratch/effect. |
| 30 | Scratch Pull | ignore | — | high | fx | Scratch/effect. |
| 31 | Sticks | candidate | snare | medium | snare | Stick clicks may be rim/snare-like but should not auto-map. |
| 32 | Square Click | candidate | snare | low | digital | Click can be rim-like or metronomic; review needed. |
| 33 | Metronome Click | ignore | — | high | metronome | Metronome should not be charted. |
| 34 | Metronome Bell | ignore | — | high | metronome | Metronome should not be charted. |
| 82 | Shaker | ignore | — | high | aux-percussion | Auxiliary percussion. |
| 83 | Jingle Bell | ignore | — | high | aux-percussion | Auxiliary percussion. |
| 84 | Bell Tree | ignore | — | high | fx | Effect/percussion sweep. |
| 85 | Castanets | ignore | — | high | aux-percussion | Auxiliary percussion. |
| 86 | Mute Surdo | candidate | tom_floor | medium | aux-percussion | Large drum can reduce to floor tom if musically important. |
| 87 | Open Surdo | candidate | tom_floor | medium | aux-percussion | Large drum can reduce to floor tom if musically important. |

## Outside atlas

- Valid MIDI note numbers `0–127` outside the atlas are `unknown`.
- Invalid values outside `0–127` should be treated as invalid data and ignored with an issue/status.

## Deferred GPIF-specific examples

These are not implemented in 17L unless they naturally fit without expanding scope. They must be recorded as future work for 17N:

| Source | Meaning | Future mapping |
|---|---|---|
| GPIF `InputMidiNumbers=92`, `Name=Hi-Hat (half)`, `OutputMidiNumber=46` | Half-open hi-hat articulation | `hihat_open` |
| GPIF articulation names containing rim/side stick | Snare rim/side stick | `snare` |
| GPIF china/splash articulations | Cymbal accents | `crash` |
