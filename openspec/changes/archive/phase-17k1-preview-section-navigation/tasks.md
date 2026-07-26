# Tasks — Phase 17K.1 Preview Section Navigation

## 1. Preparation

- [ ] Read `AGENTS.md`.
- [ ] Read docs under `docs/phases/17k1-preview-section-navigation/`.
- [ ] Read this OpenSpec package.
- [ ] Transfer accepted OpenSpec into Engram.
- [ ] Stop if any required file is missing.

## 2. Parser

- [ ] Extend `ChartPreviewData` with `sectionEvents`.
- [ ] Parse `[Events]` section markers from generated `notes.chart`.
- [ ] Convert section ticks to seconds with existing tempo-map logic.
- [ ] Add parser tests.

## 3. Model

- [ ] Add helpers for current section, navigation items, and repeated-name labels.
- [ ] Apply `previewOffsetMs` consistently.
- [ ] Add model tests.

## 4. UI

- [ ] Add compact section overlay or component.
- [ ] Show only when sections exist.
- [ ] Add previous/next controls.
- [ ] Add dropdown/select jump.
- [ ] Wire jumps to existing seek event.
- [ ] Preserve playback state.

## 5. Validation

- [ ] Run focused desktop tests/typechecks.
- [ ] Run full test suite if allowed.
- [ ] Update PR body with evidence.
