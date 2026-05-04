# Phase 03 Chart Encoding Notes

These notes supplement `PRD.md` for Phase 03.

## Confirmed 4-lane drum base-note encoding

Use the following `.chart` note numbers for base drum lanes:

```txt
kick   -> N 0
red    -> N 1
yellow -> N 2
blue   -> N 3
green  -> N 4
```

Important:

```txt
green -> N 4
```

Do not use `N 5` for green in Phase 03.

## Out of scope for Phase 03

Do not implement these in Phase 03:

- cymbal flags;
- ghost notes;
- accent notes;
- double kick;
- star power;
- drum fills;
- lower difficulties;
- frontend UI.

Those features belong to later phases.

## Phase 03 validation addition

When validating generated `notes.chart`, confirm:

- `[ExpertDrums]` exists;
- green lane serializes as `N 4`;
- no `N 5` is emitted for standard 4-lane green drum notes;
- generated chart opens in Moonscraper;
- Clone Hero detects the chart as drums.
