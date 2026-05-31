# Components — Phase 17K

## Likely files

- `packages/guitarpro/src/gpifTimeline.ts`
- `packages/guitarpro/src/normalizeGpDrums.ts`
- `packages/guitarpro/src/gpifTimeline.test.ts`
- `packages/guitarpro/src/normalizeGpDrums.test.ts`
- `packages/project/src/generatePackage.test.ts` if generated chart regression is useful

## Functional components

### GPIF timeline helper

Responsible for converting GPIF bar/measure positions to CHDG/chart ticks.

Must expose enough data for section extraction:

```ts
barIndex -> startTick
```

### GPIF section extraction

Responsible for reading GPIF marker/section structures and returning CHDG `SectionEvent[]` or equivalent:

```ts
{ tick: 184320, name: "Break" }
```

### Chart writer

Expected to already write every section event it receives. Do not change unless a writer-specific bug is found.

### Tests

Required coverage:

- marker at bar 0;
- marker at bar 8;
- marker at bar 48;
- Decode-like marker list;
- generated chart `[Events]` contains non-zero section ticks.
