# Verify — Phase 17I GPIF Timeline Tempo Map

## Automated verification

Run:

```bash
pnpm -r build
pnpm build
pnpm typecheck
pnpm test
pnpm chdg --help
```

Additional targeted tests if supported:

```bash
pnpm --filter @chdg/guitarpro test
pnpm --filter @chdg/project test
pnpm --filter @chdg/chart test
```

## Required regression assertion

A GPIF fixture with:

```xml
<Automation>
  <Type>Tempo</Type>
  <Bar>0</Bar>
  <Position>0</Position>
  <Value>164 2</Value>
</Automation>
<Automation>
  <Type>Tempo</Type>
  <Bar>48</Bar>
  <Position>0</Position>
  <Value>160 2</Value>
</Automation>
```

and 960 PPQ / 4/4 must produce tempo events:

```ts
[
  { tick: 0, bpm: 164 },
  { tick: 184320, bpm: 160 },
]
```

Generated chart must contain:

```chart
0 = B 164000
184320 = B 160000
```

## Manual verification

Use the Decode reproduction:

- Source: `Paramore-Decode-02-21-2026.gp`
- Generate package with CHDG.
- Open `notes.chart`.
- Confirm `[SyncTrack]` includes tempo change at tick `184320`.
- Play in Clone Hero or preview workflow.
- Confirm the chart does not progressively drift after the tempo change.

## Failure cases to watch

- Only one tempo event is emitted.
- Tempo event exists but tick is wrong.
- Sections still all collapse to tick 0 even when marker bar data exists.
- Time signatures duplicate excessively at every bar.
- Existing MIDI generation changes unexpectedly.
