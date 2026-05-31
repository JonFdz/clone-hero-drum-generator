# Evidence — Phase 17K

## Discovery

While validating Decode / Paramore, generated chart events showed every section at tick `0` even though section positions are visible in the GP source.

## Observed generated chart

```chart
[Events]
{
  0 = E "section Break"
  0 = E "section Breakdown"
  0 = E "section Bridge"
  0 = E "section Chorus"
  0 = E "section Intro"
  0 = E "section Refrain"
  0 = E "section Solo"
  0 = E "section Verse 1"
  0 = E "section Verse 2"
}
```

## Expected Decode-like section placement

Assuming 960 resolution and 4/4:

```txt
Intro      -> bar 0   -> tick 0
Verse 1    -> bar 8   -> tick 30720
Refrain    -> bar 24  -> tick 92160
Chorus     -> bar 32  -> tick 122880
Break      -> bar 48  -> tick 184320
Verse 2    -> bar 52  -> tick 199680
Solo       -> bar 92  -> tick 353280
Bridge     -> bar 108 -> tick 414720
```

## Interpretation

The issue is likely not in `chartWriter`, because writer should write the tick values it receives. The likely bug is in GPIF normalization/timeline extraction where section nodes are not resolved to bar start ticks and therefore default to `0`.
