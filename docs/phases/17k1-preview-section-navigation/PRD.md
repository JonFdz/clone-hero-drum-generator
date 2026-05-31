# PRD — Phase 17K.1 Preview Section Navigation

## Problem

Preview currently shows generated notes and audio, but it does not expose generated chart sections. After Phase 17K, generated `notes.chart` files can contain useful section markers at correct ticks, but the user still has to scrub manually to find song parts.

## Goals

1. Show the current generated chart section in Preview.
2. Allow quick navigation between generated chart sections.
3. Keep Preview generated-output-only.
4. Keep the interaction small and non-invasive.

## Functional requirements

### Parse generated sections

Preview chart data must include section markers parsed from `[Events]` in generated `notes.chart`.

Supported event shape:

```chart
30720 = E "section Verse 1"
184320 = E "section Break"
```

The parser should ignore non-section event strings.

### Section timing

Each section event must include `tick`, `name`, and `seconds`.

`seconds` must be calculated using the generated chart tempo map, same as note events.

### Current section

When sections exist, Preview must show the current section. The current section is the latest section whose effective time is less than or equal to the current playback time.

Effective time must include preview offset:

```ts
effectiveSeconds = section.seconds + previewOffsetMs / 1000
```

### Section navigation

Preview must provide previous section, next section, and dropdown/select navigation.

Selecting a section seeks to:

```ts
section.seconds + previewOffsetMs / 1000
```

### Repeated names

If multiple section events have the same name, UI labels should disambiguate them by appending an occurrence number in the UI only.

Example:

```txt
Chorus · 01:35
Chorus 2 · 02:48
Chorus 3 · 03:40
```

Do not modify the generated chart name.

### Visibility

If the generated chart has no sections, do not show the section overlay.

### Playback state

Seeking to a section must preserve the previous play/pause state.

## Acceptance criteria

1. Preview parses generated chart section events from `[Events]`.
2. Preview shows current section only when sections exist.
3. Previous/next section controls seek correctly.
4. Dropdown section selection seeks correctly.
5. Section seeking respects `previewOffsetMs`.
6. Repeated section names are disambiguated in UI only.
7. Existing Preview note/highway behavior remains unchanged.
8. Existing Preview generated-output-only rule remains unchanged.
