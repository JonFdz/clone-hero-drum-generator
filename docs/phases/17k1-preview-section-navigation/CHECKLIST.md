# Checklist — Phase 17K.1

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read this phase docs.
- [ ] Read OpenSpec change package.
- [ ] Transfer accepted OpenSpec to Engram before implementation.
- [ ] Stop if any required file is missing.

## Parser

- [ ] Extend `ChartPreviewData` with section events.
- [ ] Parse `[Events]`.
- [ ] Extract only `E "section ..."` events.
- [ ] Convert section ticks to seconds using tempo map.
- [ ] Preserve generated chart section names.
- [ ] Ignore malformed/non-section events safely.

## Model

- [ ] Derive current section.
- [ ] Derive previous/next section.
- [ ] Build dropdown items.
- [ ] Disambiguate repeated section names in UI only.
- [ ] Respect `previewOffsetMs`.

## UI

- [ ] Show overlay only when sections exist.
- [ ] Show current section.
- [ ] Add previous section button.
- [ ] Add next section button.
- [ ] Add dropdown/select section jump.
- [ ] Preserve play/pause state after seek.
- [ ] Keep UI compact and consistent with existing Preview style.

## Tests

- [ ] Parser tests for section events.
- [ ] Parser tests for ignoring non-section events.
- [ ] Model tests for current section.
- [ ] Model tests for offset behavior.
- [ ] Model tests for repeated section names.
- [ ] Component tests if existing project style supports them.

## Validation

- [ ] `pnpm --filter @chdg/desktop test`
- [ ] `pnpm test`
- [ ] `pnpm --filter @chdg/desktop typecheck`
- [ ] `pnpm lint`

Follow `AGENTS.md` regarding build commands.
