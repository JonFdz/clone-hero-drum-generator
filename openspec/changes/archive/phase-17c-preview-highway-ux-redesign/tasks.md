# Tasks: Phase 17C — Preview Highway UX Redesign

## 1. Read context

- [ ] Read docs and OpenSpec.
- [ ] Open `docs/desktop/mockups/08a-preview-highway-redesign.png`.
- [ ] Review current Preview files.

## 2. Add model helpers

- [ ] Add `preview-chart-stage-model.ts`.
- [ ] Add lane definitions.
- [ ] Add piece-to-lane mapping.
- [ ] Add piece-to-glyph mapping.
- [ ] Add viewport helper.
- [ ] Add time projection helper.
- [ ] Add visible-note filtering.
- [ ] Add chart note adapter.
- [ ] Add tests.

## 3. Split components

- [ ] Create transport card component.
- [ ] Create chart stage component.
- [ ] Create time ruler component.
- [ ] Create waveform background component.
- [ ] Create lane labels component.
- [ ] Create lane grid component.
- [ ] Create note layer component.
- [ ] Create playhead component.
- [ ] Create offset panel component.
- [ ] Create footer stats component.

## 4. Integrate page

- [ ] Simplify PreviewPageComponent into container/composer.
- [ ] Wire existing DesktopPreviewService data into new components.
- [ ] Preserve audio element behavior.
- [ ] Preserve offset service behavior.
- [ ] Replace old visual blocks.

## 5. Visual pass

- [ ] Match 08a mock layout.
- [ ] Match colors/shapes.
- [ ] Use one waveform background.
- [ ] Align playhead/time/waveform/notes.
- [ ] Tune spacing and dark card style.

## 6. Validate

Run required commands.

## 7. Manual validation

Compare app Preview with mock and verify playback/offset.
