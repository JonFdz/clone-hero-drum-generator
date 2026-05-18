# CHDG Desktop Roadmap

This folder documents the desktop product roadmap and visual direction for CHDG Desktop.

CHDG Desktop is intended to become a self-sufficient local desktop application for creating, validating, previewing, and adjusting Clone Hero drum charts from user-provided local files.

## Product direction

CHDG Desktop should be:

```txt
local-first
100% offline
desktop-native
project-based
safe around copyrighted user files
not dependent on Moonscraper or any external editor
capable of internal validation, preview, offset adjustment, and mapping review over time
```

External editors may be supported later as optional integrations, but they are not part of the core product path.

## Reference mockups

Current mockups live in:

```txt
docs/desktop/mockups/
```

Files:

```txt
01-home-dashboard.png
02-projects-library.png
03-new-project.png
04-inspect-source.png
05-track-selection.png
06-generate.png
07-validation.png
08-preview-offset.png
09-mapping-overrides.png
10-settings.png
```

Use these as visual/product references during implementation. They are not pixel-perfect specs and some visible text is intentionally documented in `mockup-corrections.md` as non-canonical where the generated image is inconsistent with product decisions.

## Recommended phase order

```txt
Phase 10  — Desktop App Shell
Phase 10A — Structured Project Services + CLI --json
Phase 10B — Multi-track Normalization / Generation
Phase 11  — Desktop Generate MVP
Phase 12  — Project Persistence + Settings
Phase 13  — Validation Checklist
Phase 14A — Audio + Waveform + Timeline Preview
Phase 14B — Clone Hero Highway Preview
Phase 15  — Offset Adjustment UI
Phase 16A — Project Mapping Overrides
Phase 16B — Mapping Profiles
Phase 17  — Desktop Packaging / Multiplatform Distribution
Phase 18  — Optional External Tool Integration
Phase 19  — Individual Note Editing / Advanced Chart Editor
```

## Current backend capability summary

Already available or mostly available through CLI/packages:

```txt
MIDI inspection
GPIF/.gp inspection
MIDI drum normalization
GPIF drum normalization
MIDI -> notes.chart + song.ini + song.ogg
GPIF -> notes.chart + song.ini + song.ogg
metadata options
chart Offset from --offset-ms
Pro Drums cymbal modifiers
open hi-hat convention
ghost/accent modifiers
sections/global events
```

Important limitation:

```txt
Most features are CLI/package-oriented today. Desktop UI needs structured services, project persistence, native file/tool integration, preview models, validation reports, and robust state handling.
```

## Canonical product notes

- `.chdg` is a project file, not the generated chart package.
- The generated Clone Hero output is a folder containing `notes.chart`, `song.ini`, and `song.ogg`.
- Source files are local `.mid`, `.midi`, or modern `.gp` / GPIF.
- No network URLs, YouTube imports, scraping, or server upload workflow should be part of the core product.
- Audio is required for Desktop Generate MVP.
- CHDG should not depend on Moonscraper. Internal preview/validation is the core path.
