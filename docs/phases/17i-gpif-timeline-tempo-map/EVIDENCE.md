# Evidence — Decode GPIF Timing Drift

## Files analyzed

- `Paramore-Decode-02-21-2026.gp`
- `Untitled 2026-05-29T16-10-21.chdg`
- `notes(2).chart`
- `song(1).ini`
- `song.ogg`

## Finding 1 — GPIF source contains two tempo automations

The uploaded `.gp` contains `Content/score.gpif` with:

```xml
<Automation>
  <Type>Tempo</Type>
  <Linear>false</Linear>
  <Bar>0</Bar>
  <Position>0</Position>
  <Visible>true</Visible>
  <Value>164 2</Value>
</Automation>
<Automation>
  <Type>Tempo</Type>
  <Linear>false</Linear>
  <Bar>48</Bar>
  <Position>0</Position>
  <Visible>true</Visible>
  <Value>160 2</Value>
</Automation>
```

## Finding 2 — `.chdg` inspection sees two tempo structures

The `.chdg` analysis contains:

```json
"tempos": [
  {
    "path": "GPIF.Automation[Type=Tempo]",
    "value": "Tempo: 164 2"
  },
  {
    "path": "GPIF.Automation[Type=Tempo]",
    "value": "Tempo: 160 2"
  }
]
```

This means the source contains visible tempo information and CHDG inspection can see both values.

## Finding 3 — Generated chart writes only the first tempo

The generated `notes.chart` contains:

```chart
[SyncTrack]
{
  0 = TS 4 2
  0 = B 164000
}
```

It does not contain the tempo event for 160 BPM at bar 48.

## Finding 4 — Sections collapse to tick 0

The generated chart also contains all section events at tick 0:

```chart
0 = E "section Break"
0 = E "section Breakdown"
0 = E "section Bridge"
0 = E "section Chorus"
0 = E "section Down"
0 = E "section Intro"
0 = E "section Outro"
0 = E "section Refrain"
0 = E "section Solo"
0 = E "section Up"
0 = E "section Verse 1"
0 = E "section Verse 2"
```

This does not directly cause audio drift, but it supports the same root problem: GPIF timeline positions are not being converted to ticks.

## Expected chart sync track for the Decode reproduction

With 960 PPQ and 4/4 through bar 48:

```text
bar 48 * 4 beats * 960 ticks = 184320 ticks
```

Expected chart:

```chart
[SyncTrack]
{
  0 = TS 4 2
  0 = B 164000
  184320 = B 160000
}
```

## Why this causes drift

The chart currently plays everything after bar 48 as if the tempo stayed at 164 BPM. The source changes to 160 BPM. That difference accumulates over time, causing later notes to drift increasingly far from the audio.

This cannot be fixed with offset. Offset shifts every note by a constant amount, while missing tempo changes create a growing timing error.
