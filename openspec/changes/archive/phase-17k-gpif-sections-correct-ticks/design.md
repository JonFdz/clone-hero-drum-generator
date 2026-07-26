# Design — Phase 17K

## Current behavior

GPIF section extraction detects section names but does not preserve or compute correct ticks, causing all section events to be emitted at tick `0`.

## Desired behavior

Section extraction should return events with correct chart ticks:

```ts
{ tick: 30720, name: "Verse 1" }
{ tick: 184320, name: "Break" }
```

## Approach

1. Inspect GPIF marker/section structures used by current parser.
2. Determine available bar/measure references for each marker.
3. Use `buildGpifTimeline(...)` or equivalent to convert bar index to chart tick.
4. Return sorted section events.
5. Deduplicate sections if GPIF exposes duplicates.
6. Preserve names exactly enough for chart readability, while still using existing chart escaping.

## Fallbacks

If a marker has no reliable position:

- Do not crash.
- Do not blindly place all unknown markers at `0`.
- Prefer omitting unsafe marker or emitting a warning if supported.
- A marker explicitly at bar `0` should still emit at tick `0`.

## Risks

- GPIF marker format may differ across files.
- Some Guitar Pro versions may encode sections differently.
- Synthetic tests must not be the only validation; include a real-like fixture shape.
