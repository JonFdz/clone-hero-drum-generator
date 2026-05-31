# Components — Phase 17K.1

## Backend / Electron preview parser

Likely file:

- `apps/desktop/electron/previewData.ts`

Responsibilities:

- Parse `[Events]` section markers from generated `notes.chart`.
- Convert section ticks to seconds using the generated chart tempo map.
- Add `sectionEvents` to `ChartPreviewData`.

Suggested type:

```ts
export type ChartPreviewSectionEvent = {
  tick: number;
  name: string;
  seconds: number;
  source: "generated-chart";
};
```

## Frontend preview model

Likely file:

- `apps/desktop/src/app/services/desktop-preview-model.ts`

Responsibilities:

- Derive current section from `chartData`, `currentTime`, and `previewOffsetMs`.
- Build dropdown/navigation items.
- Disambiguate repeated section names for UI labels only.

Suggested helpers:

```ts
deriveCurrentSection(chartData, currentTimeSeconds, previewOffsetMs)
deriveSectionNavigationItems(chartData, previewOffsetMs)
deriveAdjacentSections(sectionItems, currentTimeSeconds)
```

## Preview UI

Likely files:

- `apps/desktop/src/app/pages/preview/preview-page.component.ts`
- `apps/desktop/src/app/pages/preview/components/preview-chart-stage.component.ts`
- optional new component:
  - `apps/desktop/src/app/pages/preview/components/preview-section-navigation.component.ts`

Responsibilities:

- Display compact section overlay only when `sectionEvents.length > 0`.
- Show current section.
- Offer previous/next controls.
- Offer dropdown/select section jump.
- Emit seek events to existing Preview seek flow.

## Placement recommendation

Place the section navigation as a compact overlay on the chart/highway stage, not in the offset side panel.

Conceptual layout:

```txt
[Preview Stage]
  ┌──────────────────────────────────────┐
  │ SECTION                              │
  │ Verse 1        [‹] [Sections ▾] [›]  │
  │                                      │
  │            highway / notes           │
  └──────────────────────────────────────┘
```

## Tests

Suggested coverage:

- parser extracts section events from `[Events]`;
- parser ignores non-section events;
- seconds are calculated using tempo map;
- current section derives correctly with and without offset;
- repeated names get UI suffixes;
- previous/next navigation chooses correct section;
- no overlay when there are no sections.
